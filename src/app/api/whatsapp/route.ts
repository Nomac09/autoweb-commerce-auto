import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function twilioReply(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}

async function getSession(id: string) {
  const { data } = await supabase.from("sessions").select("*").eq("id", id).single();
  return data ?? { id, photos: [], partial_data: {} };
}

async function saveSession(id: string, photos: string[], partialData: Record<string, any>) {
  await supabase.from("sessions").upsert({
    id, photos, partial_data: partialData, updated_at: new Date().toISOString()
  });
}

async function deleteSession(id: string) {
  await supabase.from("sessions").delete().eq("id", id);
}

async function fetchTwilioMedia(url: string): Promise<Buffer> {
  const creds = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(url, { headers: { Authorization: `Basic ${creds}` } });
  return Buffer.from(await res.arrayBuffer());
}

async function uploadPhoto(buf: Buffer, filename: string): Promise<string | null> {
  const { error } = await supabase.storage.from("cars").upload(`photos/${filename}`, buf, { contentType: "image/jpeg", upsert: true });
  if (error) { console.error(error); return null; }
  return supabase.storage.from("cars").getPublicUrl(`photos/${filename}`).data.publicUrl;
}

async function callClaude(userContent: any[], system: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content: userContent }] }),
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "";
}

function parseLocally(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const n = text.replace(/(\d)\s+(\d)/g, "$1$2").replace(/(\d)\s+(\d)/g, "$1$2");
  const priceMatch = n.match(/(\d{3,6})\s*€/) || n.match(/prix\s*:?\s*(\d{3,6})/i);
  if (priceMatch) result.price = parseInt(priceMatch[1]);
  const kmMatch = n.match(/(\d{4,6})\s*km/i) || n.match(/km\s*[\(\[]?\s*(\d{4,6})/i);
  if (kmMatch) result.km = parseInt(kmMatch[1]);
  if (/auto(matique)?/i.test(text)) result.gearbox = "Automatique";
  else if (/manu(elle)?|mécanique|méca/i.test(text)) result.gearbox = "Manuelle";
  const colors = ["noir","blanc","rouge","bleu","gris","vert","orange","beige","marron","argent"];
  for (const c of colors) {
    if (new RegExp(`\\b${c}\\b`, "i").test(text)) { result.color = c.charAt(0).toUpperCase() + c.slice(1); break; }
  }
  // Extract model if text looks like a car name (starts with capital, no price/km)
  const modelMatch = text.match(/^([A-ZÀ-Ö][a-zA-ZÀ-öà-ö0-9\s\-\.]{3,40})$/);
  if (modelMatch && !text.match(/\d{4,}/) && !text.match(/€/)) result.title = text.trim();
  return result;
}

async function parseWithClaude(text: string): Promise<Record<string, any>> {
  const local = parseLocally(text);
  if (local.price && local.km) return local;
  const raw = await callClaude(
    [{ type: "text", text: `Car dealer message: "${text}"\nExtract: price(€), km, gearbox, color, model name. Return ONLY JSON.` }],
    `Return ONLY valid JSON: {"price":number|null,"km":number|null,"gearbox":"Manuelle"|"Automatique"|null,"color":string|null,"title":string|null}. Numbers: "4 990"=4990, "154 000"=154000.`
  );
  try { return { ...local, ...JSON.parse(raw.replace(/```json|```/g,"").trim()) }; } catch { return local; }
}

async function readCarteGrise(buf: Buffer): Promise<Record<string, any>> {
  const raw = await callClaude(
    [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: buf.toString("base64") } },
     { type: "text", text: "Extract vehicle registration data. Return ONLY JSON." }],
    `Return ONLY JSON: {"make":string,"model":string,"year":number,"fuel":"Essence"|"Diesel"|"Hybride"|"Électrique","power_din":number|null,"doors":number|null,"color":string|null}. No explanation.`
  );
  try {
    const p = JSON.parse(raw.replace(/```json|```/g,"").trim());
    return { title:`${p.make??""} ${p.model??""}`.trim(), year:p.year??null, fuel:p.fuel??"Essence", power_din:p.power_din?Math.round(p.power_din):null, doors:p.doors??null, color:p.color??null };
  } catch { return {}; }
}

function budgetTag(price: number) { return price<2000?"< 2000 €":price<=4000?"2000-4000 €":"≥ 4000 €"; }

async function getStock() {
  const { data } = await supabase.from("cars").select("id,title,price,status").order("added_at",{ascending:false});
  if (!data?.length) return "📦 Stock vide.";
  return `📦 *Stock AUTOWEB* (${data.length})\n\n${data.map(c=>`${c.status==="available"?"✅":c.status==="reserved"?"🟡":"❌"} ${c.title} — ${c.price.toLocaleString("fr-FR")}€\nID: ${c.id}`).join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  const form   = await req.formData();
  const from   = form.get("From")?.toString() ?? "";
  const body   = form.get("Body")?.toString().trim() ?? "";
  const nMedia = parseInt(form.get("NumMedia")?.toString() ?? "0");
  const lower  = body.toLowerCase();
  const owner  = process.env.OWNER_WHATSAPP ?? "";
  if (owner && !from.includes(owner)) return twilioReply("❌ Non autorisé.");

  // Commands
  if (lower==="stock"||lower==="status") return twilioReply(await getStock());
  if (lower==="annuler"||lower==="cancel") { await deleteSession(from); return twilioReply("✅ Session annulée."); }
  if (lower.startsWith("vendu "))    { await supabase.from("cars").update({status:"sold"}).eq("id",body.slice(6).trim()); return twilioReply("✅ Marquée vendue."); }
  if (lower.startsWith("réservé ")||lower.startsWith("reserve ")) { await supabase.from("cars").update({status:"reserved"}).eq("id",body.split(" ").slice(1).join(" ").trim()); return twilioReply("✅ Marquée réservée."); }
  if (lower.startsWith("dispo "))    { await supabase.from("cars").update({status:"available"}).eq("id",body.slice(6).trim()); return twilioReply("✅ Remise disponible."); }
  if (lower.startsWith("supprimer ")||lower.startsWith("delete ")) { await supabase.from("cars").delete().eq("id",body.split(" ").slice(1).join(" ").trim()); return twilioReply("🗑️ Supprimée."); }

  // Load session from Supabase
  const sess = await getSession(from);
  let photos: string[] = sess.photos ?? [];
  let data: Record<string, any> = sess.partial_data ?? {};

  // Photos
  if (nMedia > 0) {
    const uploaded: string[] = [];
    for (let i=0; i<nMedia; i++) {
      const url  = form.get(`MediaUrl${i}`)?.toString()??"";
      const type = form.get(`MediaContentType${i}`)?.toString()??"";
      if (!type.startsWith("image/")) {
        // PDF sent — warn user
        if (type.includes("pdf")) return twilioReply("⚠️ La carte grise doit être envoyée en *photo* (screenshot), pas en PDF.\n\nFaites une capture d'écran de votre carte grise et envoyez-la.");
        continue;
      }
      const buf = await fetchTwilioMedia(url);
      const pub = await uploadPhoto(buf, `${Date.now()}-${i}.jpg`);
      if (pub) uploaded.push(pub);
      // Try carte grise OCR on first image if no title yet
      if (!data.title) {
        const cg = await readCarteGrise(buf);
        if (cg.title||cg.year) data = { ...data, ...cg };
      }
    }
    photos = [...photos, ...uploaded];
    await saveSession(from, photos, data);
    const detected = (data.title||data.year) ? `\n\n📋 Détecté: *${data.title??""} ${data.year??""}* · ${data.fuel??"?"}` : "";
    return twilioReply(`📸 *${uploaded.length} photo(s)* reçue(s) (total: ${photos.length})${detected}\n\nEnvoyez:\n• Prix (ex: 4990€)\n• KM (ex: 154000km)\n• Boîte (auto/manuelle)\n\nTapez *"publier"* quand prêt.`);
  }

  // Publish
  if (lower==="publier"||lower==="publish") {
    if (photos.length===0) return twilioReply("❌ Pas de photos. Envoyez d'abord des photos.");
    if (!data.price) return twilioReply("❌ Prix manquant. Envoyez: 4990€");
    if (data.km==null) return twilioReply("❌ KM manquant. Envoyez: 154000km");
    if (!data.title) return twilioReply("❌ Modèle manquant. Envoyez ex: Citroën C4 1.4 Essence 2011");
    const year = data.year ?? new Date().getFullYear();
    const features: string[] = data.features ?? [];
    if (data.guarantee) features.push(`Garantie ${data.guarantee}`);
    if (!features.some((f:string)=>f.toLowerCase().includes("ct"))) features.push("CT OK");
    const car = {
      id: `${(data.title as string).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${year}-${Date.now().toString(36)}`,
      title:data.title, price:data.price, year, km:data.km,
      fuel:data.fuel??"Essence", gearbox:data.gearbox??"Manuelle",
      images:photos,
      description:data.description??`${data.title} ${year}. ${(data.km as number).toLocaleString("fr-FR")} km.`,
      budget_tag:budgetTag(data.price as number), status:"available",
      features, color:data.color??null, doors:data.doors??null,
      power_din:data.power_din??null, equipments:data.equipments??null,
      added_at:new Date().toISOString(),
    };
    const { error } = await supabase.from("cars").insert(car);
    if (error) return twilioReply(`❌ Erreur: ${error.message}`);
    await deleteSession(from);
    const site = process.env.NEXT_PUBLIC_SITE_URL??"https://autoweb-commerce-auto.vercel.app";
    return twilioReply(`✅ *Publiée !*\n\n🚗 ${car.title}\n💰 ${(car.price as number).toLocaleString("fr-FR")} €\n📍 ${(car.km as number).toLocaleString("fr-FR")} km\n📸 ${photos.length} photo(s)\n\n🔗 ${site}/car/${car.id}`);
  }

  // Parse text details
  if (body.length > 0) {
    const extracted = await parseWithClaude(body);
    // Only update fields that were actually extracted
    if (extracted.price) data.price = extracted.price;
    if (extracted.km != null) data.km = extracted.km;
    if (extracted.gearbox) data.gearbox = extracted.gearbox;
    if (extracted.color) data.color = extracted.color;
    if (extracted.title && !data.title) data.title = extracted.title;
    if (extracted.description) data.description = extracted.description;
    await saveSession(from, photos, data);
    const summary = [
      data.title  ? `🚗 ${data.title} ${data.year??""}` : null,
      data.price  ? `💰 ${(data.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      data.km!=null?`📍 ${(data.km as number).toLocaleString("fr-FR")} km`:"❓ KM manquant",
      data.fuel   ? `⛽ ${data.fuel}`    : null,
      data.gearbox? `🕹 ${data.gearbox}` : null,
      data.color  ? `🎨 ${data.color}`   : null,
    ].filter(Boolean).join("\n");
    return twilioReply(`📝 *Récap:*\n${summary}\n📸 ${photos.length} photo(s)\n\nAjoutez des détails ou tapez *"publier"*.`);
  }

  return twilioReply(`🚗 *AUTOWEB Agent*\n\n📸 Envoyez photos + screenshot carte grise\n⚠️ Carte grise en *screenshot*, pas en PDF\n\n*Commandes:*\nstock · vendu [id] · réservé [id] · dispo [id] · supprimer [id] · annuler`);
}
