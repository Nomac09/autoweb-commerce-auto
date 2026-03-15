import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Session = {
  step: string;
  photos: string[];
  partialData: Record<string, any>;
  startedAt: number;
};

const sessions = new Map<string, Session>();

function twilioReply(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
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
    headers: { "Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY!,"anthropic-version":"2023-06-01" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{ role:"user", content:userContent }] }),
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "";
}

async function readCarteGrise(buf: Buffer): Promise<Record<string, any>> {
  const b64 = buf.toString("base64");
  const raw = await callClaude(
    [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64 } },
     { type:"text",  text:"Extract all vehicle data from this registration document. Return ONLY valid JSON." }],
    `Return ONLY a JSON object with: make (string), model (string), year (number, first registration year), fuel ("Essence"|"Diesel"|"Hybride"|"Électrique"), power_din (number in ch, convert kW*1.36), doors (number or null), color (string or null), vin (string or null). No explanation.`
  );
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
    return {
      title: `${parsed.make ?? ""} ${parsed.model ?? ""}`.trim(),
      year:  parsed.year      ?? null,
      fuel:  parsed.fuel      ?? "Essence",
      power_din: parsed.power_din ? Math.round(parsed.power_din) : null,
      doors: parsed.doors     ?? null,
      color: parsed.color     ?? null,
    };
  } catch { return {}; }
}

async function parseDetails(text: string, existing: Record<string, any>): Promise<Record<string, any>> {
  const raw = await callClaude(
    [{ type:"text", text:`Dealer message: "${text}"\nExisting: ${JSON.stringify(existing)}\nExtract car details. Return ONLY JSON.` }],
    `Return ONLY valid JSON: { price: number|null, km: number|null, gearbox: "Manuelle"|"Automatique"|null, description: string|null, features: string[]|null, color: string|null, guarantee: string|null, equipments: string[]|null }. French: "auto"=Automatique, "manu"=Manuelle.`
  );
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return {}; }
}

function budgetTag(price: number): string {
  return price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
}

async function getStock(): Promise<string> {
  const { data } = await supabase.from("cars").select("id,title,price,status,km").order("added_at",{ascending:false});
  if (!data?.length) return "📦 Stock vide.";
  const lines = data.map(c => {
    const icon = c.status==="available"?"✅":c.status==="reserved"?"🟡":"❌";
    return `${icon} ${c.title} — ${c.price.toLocaleString("fr-FR")}€\nID: \`${c.id}\``;
  });
  return `📦 *Stock AUTOWEB* (${data.length})\n\n${lines.join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  const form  = await req.formData();
  const from  = form.get("From")?.toString() ?? "";
  const body  = form.get("Body")?.toString().trim() ?? "";
  const nMedia = parseInt(form.get("NumMedia")?.toString() ?? "0");
  const lower  = body.toLowerCase();

  // Auth check
  const owner = process.env.OWNER_WHATSAPP ?? "";
  if (owner && !from.includes(owner)) return twilioReply("❌ Non autorisé.");

  // Commands
  if (lower==="stock"||lower==="status") return twilioReply(await getStock());
  if (lower==="annuler"||lower==="cancel") { sessions.delete(from); return twilioReply("✅ Session annulée. Envoyez des photos pour ajouter une voiture."); }

  if (lower.startsWith("vendu "))   { await supabase.from("cars").update({status:"sold"}).eq("id",body.slice(6).trim()); return twilioReply(`✅ Marquée vendue.`); }
  if (lower.startsWith("réservé ")||lower.startsWith("reserve ")) { await supabase.from("cars").update({status:"reserved"}).eq("id",body.split(" ").slice(1).join(" ").trim()); return twilioReply(`✅ Marquée réservée.`); }
  if (lower.startsWith("dispo "))   { await supabase.from("cars").update({status:"available"}).eq("id",body.slice(6).trim()); return twilioReply(`✅ Remise disponible.`); }
  if (lower.startsWith("supprimer ")||lower.startsWith("delete ")) { await supabase.from("cars").delete().eq("id",body.split(" ").slice(1).join(" ").trim()); return twilioReply(`🗑️ Supprimée.`); }

  // Session
  let s = sessions.get(from);
  if (!s || Date.now()-s.startedAt>3600000) {
    s = { step:"idle", photos:[], partialData:{}, startedAt:Date.now() };
    sessions.set(from, s);
  }

  // Photos
  if (nMedia > 0) {
    const uploaded: string[] = [];
    for (let i=0; i<nMedia; i++) {
      const url  = form.get(`MediaUrl${i}`)?.toString() ?? "";
      const type = form.get(`MediaContentType${i}`)?.toString() ?? "";
      if (!type.startsWith("image/")) continue;
      const buf = await fetchTwilioMedia(url);
      const url2 = await uploadPhoto(buf, `${Date.now()}-${i}.jpg`);
      if (url2) uploaded.push(url2);
      // Try carte grise on first image if no data yet
      if (!s.partialData.year && !s.partialData.title) {
        const cg = await readCarteGrise(buf);
        if (cg.year || cg.title) s.partialData = { ...s.partialData, ...cg };
      }
    }
    s.photos.push(...uploaded);
    s.step = "waiting_details";
    sessions.set(from, s);
    const d = s.partialData;
    const detected = (d.title||d.year) ? `\n\n📋 Détecté: *${d.title??""} ${d.year??""}* · ${d.fuel??"?"}` : "";
    return twilioReply(`📸 *${uploaded.length} photo(s)* reçue(s) (total: ${s.photos.length})${detected}\n\nEnvoyez les détails:\n• Prix (ex: 3200€)\n• KM (ex: 87000km)\n• Boîte (auto/manuelle)\n• Équipements\n\nTapez *"publier"* quand prêt.`);
  }

  // Publish
  if (lower==="publier"||lower==="publish") {
    if (s.photos.length===0) return twilioReply("❌ Pas de photos. Envoyez d'abord des photos.");
    const d = s.partialData;
    if (!d.price) return twilioReply("❌ Prix manquant (ex: 3200€).");
    if (d.km==null) return twilioReply("❌ KM manquant (ex: 87000km).");
    if (!d.title) return twilioReply("❌ Modèle non identifié. Précisez: ex 'Peugeot 208'.");
    const year = d.year ?? new Date().getFullYear();
    const features: string[] = d.features ?? [];
    if (d.guarantee) features.push(`Garantie ${d.guarantee}`);
    if (!features.some((f:string)=>f.toLowerCase().includes("ct"))) features.push("CT OK");
    const car = {
      id: `${(d.title).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${year}-${Date.now().toString(36)}`,
      title: d.title, price: d.price, year, km: d.km,
      fuel: d.fuel??"Essence", gearbox: d.gearbox??"Manuelle",
      images: s.photos,
      description: d.description ?? `${d.title} ${year}. ${(d.km as number).toLocaleString("fr-FR")} km.`,
      budget_tag: budgetTag(d.price), status:"available",
      features, color:d.color??null, doors:d.doors??null,
      power_din:d.power_din??null, co2:d.co2??null,
      equipments:d.equipments??null,
      added_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("cars").insert(car);
    if (error) return twilioReply(`❌ Erreur: ${error.message}`);
    sessions.delete(from);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    return twilioReply(`✅ *Publiée !*\n\n🚗 ${car.title}\n💰 ${car.price.toLocaleString("fr-FR")} € · ${(car.km as number).toLocaleString("fr-FR")} km\n📸 ${s.photos.length} photo(s)\n\n🔗 ${site}/car/${car.id}`);
  }

  // Parse text details
  if (body.length>0 && s.step==="waiting_details") {
    const extracted = await parseDetails(body, s.partialData);
    s.partialData = { ...s.partialData, ...extracted };
    sessions.set(from, s);
    const d = s.partialData;
    const summary = [
      d.title  ? `🚗 ${d.title} ${d.year??""}` : null,
      d.price  ? `💰 ${(d.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      d.km!=null?`📍 ${(d.km as number).toLocaleString("fr-FR")} km`:"❓ KM manquant",
      d.fuel   ? `⛽ ${d.fuel}`   : null,
      d.gearbox? `🕹 ${d.gearbox}`: null,
      d.color  ? `🎨 ${d.color}`  : null,
    ].filter(Boolean).join("\n");
    return twilioReply(`📝 *Récap:*\n${summary}\n📸 ${s.photos.length} photo(s)\n\nAjoutez des détails ou tapez *"publier"*.`);
  }

  return twilioReply(`🚗 *AUTOWEB Agent*\n\n📸 Envoyez des photos + carte grise pour ajouter une voiture\n\n*Commandes:*\n• stock · vendu [id] · réservé [id] · dispo [id] · supprimer [id] · annuler`);
}
