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
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content: userContent }] }),
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "";
}

// Simple regex-based parser — no Claude needed for basic number extraction
function parseDetailsLocally(text: string): Record<string, any> {
  const result: Record<string, any> = {};

  // Model extraction: if text looks like a car model (no numbers, 2-5 words)
  const modelMatch = text.match(/^([A-ZÀ-Ö][a-zà-ö]+(?:\s+[A-ZÀ-Öa-zà-ö0-9]+){1,4})$/);
  if (modelMatch && !text.match(/\d{3,}/)) result.title = modelMatch[1].trim();

  // Remove spaces between digits: "4 990" → "4990", "154 000" → "154000"
  const normalized = text.replace(/(\d)\s+(\d)/g, "$1$2").replace(/(\d)\s+(\d)/g, "$1$2");

  // Price: number before/after € symbol or "euros"
  const priceMatch = normalized.match(/(\d{3,6})\s*€/) ||
                     normalized.match(/prix\s*:?\s*(\d{3,6})/i) ||
                     normalized.match(/(\d{3,6})\s*euros?/i);
  if (priceMatch) result.price = parseInt(priceMatch[1]);

  // KM: number before/after km
  const kmMatch = normalized.match(/(\d{4,6})\s*km/i) ||
                  normalized.match(/km\s*:?\s*[\(\[]?(\d{4,6})/i) ||
                  normalized.match(/kilom[eè]tres?\s*:?\s*(\d{4,6})/i);
  if (kmMatch) result.km = parseInt(kmMatch[1]);

  // Gearbox
  if (/auto(matique)?/i.test(text)) result.gearbox = "Automatique";
  else if (/manu(elle)?|mecanique|méca/i.test(text)) result.gearbox = "Manuelle";

  // Color
  const colors = ["noir","blanc","rouge","bleu","gris","vert","orange","beige","marron","argent","silver","black","white","red","blue","gray","grey"];
  for (const c of colors) {
    if (new RegExp(`\\b${c}\\b`, "i").test(text)) {
      result.color = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      break;
    }
  }

  // Guarantee
  const garantieMatch = text.match(/garanti[e]?\s*:?\s*(\d+\s*mois)/i);
  if (garantieMatch) result.guarantee = garantieMatch[1];

  return result;
}

async function parseDetailsWithClaude(text: string, existing: Record<string, any>): Promise<Record<string, any>> {
  // First try regex (fast, free, reliable for numbers)
  const local = parseDetailsLocally(text);

  // If we got both price and km locally, skip Claude
  if (local.price && local.km) return local;

  // Otherwise ask Claude to help with the rest
  const raw = await callClaude(
    [{ type: "text", text: `Car dealer message: "${text}"\n\nExtract car details. Return ONLY JSON, no explanation.` }],
    `Extract car details from this French dealer message. Return ONLY valid JSON.

IMPORTANT: Numbers may have spaces as thousand separators. "4 990" = 4990, "154 000" = 154000.

Return: {
  "price": number or null (€ amount, e.g. 4990),
  "km": number or null (kilometers, e.g. 154000),
  "gearbox": "Manuelle" or "Automatique" or null,
  "color": string or null,
  "description": string or null,
  "features": string array or null,
  "guarantee": string or null,
  "equipments": string array or null
}

Examples:
- "4990€, 154000km" → {"price":4990,"km":154000}
- "Prix 4990€" → {"price":4990}
- "KM (154000km)" → {"km":154000}
- "boîte auto" → {"gearbox":"Automatique"}
- "manuelle" → {"gearbox":"Manuelle"}`
  );

  try {
    const claude = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return { ...local, ...claude };
  } catch {
    return local;
  }
}

async function readCarteGrise(buf: Buffer): Promise<Record<string, any>> {
  const b64 = buf.toString("base64");
  const raw = await callClaude(
    [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
     { type: "text", text: "Extract vehicle data from this registration document. Return ONLY valid JSON." }],
    `Return ONLY a JSON object: { "make": string, "model": string, "year": number, "fuel": "Essence"|"Diesel"|"Hybride"|"Électrique", "power_din": number (ch, convert kW×1.36), "doors": number|null, "color": string|null }. No explanation.`
  );
  try {
    const p = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      title: `${p.make ?? ""} ${p.model ?? ""}`.trim(),
      year: p.year ?? null,
      fuel: p.fuel ?? "Essence",
      power_din: p.power_din ? Math.round(p.power_din) : null,
      doors: p.doors ?? null,
      color: p.color ?? null,
    };
  } catch { return {}; }
}

function budgetTag(price: number): string {
  return price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
}

async function getStock(): Promise<string> {
  const { data } = await supabase.from("cars").select("id,title,price,status,km").order("added_at", { ascending: false });
  if (!data?.length) return "📦 Stock vide.";
  const lines = data.map(c => {
    const icon = c.status === "available" ? "✅" : c.status === "reserved" ? "🟡" : "❌";
    return `${icon} ${c.title} — ${c.price.toLocaleString("fr-FR")}€\nID: ${c.id}`;
  });
  return `📦 *Stock AUTOWEB* (${data.length})\n\n${lines.join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  const form   = await req.formData();
  const from   = form.get("From")?.toString() ?? "";
  const body   = form.get("Body")?.toString().trim() ?? "";
  const nMedia = parseInt(form.get("NumMedia")?.toString() ?? "0");
  const lower  = body.toLowerCase();

  const owner = process.env.OWNER_WHATSAPP ?? "";
  if (owner && !from.includes(owner)) return twilioReply("❌ Non autorisé.");

  if (lower === "stock" || lower === "status") return twilioReply(await getStock());
  if (lower === "annuler" || lower === "cancel") { sessions.delete(from); return twilioReply("✅ Session annulée."); }
  if (lower.startsWith("vendu "))    { await supabase.from("cars").update({ status: "sold" }).eq("id", body.slice(6).trim()); return twilioReply("✅ Marquée vendue."); }
  if (lower.startsWith("réservé ") || lower.startsWith("reserve ")) { await supabase.from("cars").update({ status: "reserved" }).eq("id", body.split(" ").slice(1).join(" ").trim()); return twilioReply("✅ Marquée réservée."); }
  if (lower.startsWith("dispo "))    { await supabase.from("cars").update({ status: "available" }).eq("id", body.slice(6).trim()); return twilioReply("✅ Remise disponible."); }
  if (lower.startsWith("supprimer ") || lower.startsWith("delete ")) { await supabase.from("cars").delete().eq("id", body.split(" ").slice(1).join(" ").trim()); return twilioReply("🗑️ Supprimée."); }

  let s = sessions.get(from);
  if (!s || Date.now() - s.startedAt > 3600000) {
    s = { step: "idle", photos: [], partialData: {}, startedAt: Date.now() };
    sessions.set(from, s);
  }

  // Photos
  if (nMedia > 0) {
    const uploaded: string[] = [];
    for (let i = 0; i < nMedia; i++) {
      const url  = form.get(`MediaUrl${i}`)?.toString() ?? "";
      const type = form.get(`MediaContentType${i}`)?.toString() ?? "";
      if (!type.startsWith("image/")) continue;
      const buf  = await fetchTwilioMedia(url);
      const pub  = await uploadPhoto(buf, `${Date.now()}-${i}.jpg`);
      if (pub) uploaded.push(pub);
      if (!s.partialData.year && !s.partialData.title) {
        const cg = await readCarteGrise(buf);
        if (cg.year || cg.title) s.partialData = { ...s.partialData, ...cg };
      }
    }
    s.photos.push(...uploaded);
    s.step = "waiting_details";
    sessions.set(from, s);
    const d = s.partialData;
    const detected = (d.title || d.year) ? `\n\n📋 Détecté: *${d.title ?? ""} ${d.year ?? ""}* · ${d.fuel ?? "?"}` : "";
    return twilioReply(`📸 *${uploaded.length} photo(s)* reçue(s) (total: ${s.photos.length})${detected}\n\nEnvoyez:\n• Prix (ex: 3200€)\n• KM (ex: 87000km)\n• Boîte (auto/manuelle)\n\nTapez *"publier"* quand prêt.`);
  }

  // Publish
  if (lower === "publier" || lower === "publish") {
    if (s.photos.length === 0) return twilioReply("❌ Pas de photos.");
    const d = s.partialData;
    if (!d.price) return twilioReply("❌ Prix manquant. Envoyez: Prix 4990€");
    if (d.km == null) return twilioReply("❌ KM manquant. Envoyez: KM 154000");
    if (!d.title) return twilioReply("❌ Modèle manquant. Envoyez: ex Citroën C4");
    const year = d.year ?? new Date().getFullYear();
    const features: string[] = d.features ?? [];
    if (d.guarantee) features.push(`Garantie ${d.guarantee}`);
    if (!features.some((f: string) => f.toLowerCase().includes("ct"))) features.push("CT OK");
    const car = {
      id: `${(d.title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}-${Date.now().toString(36)}`,
      title: d.title, price: d.price, year, km: d.km,
      fuel: d.fuel ?? "Essence", gearbox: d.gearbox ?? "Manuelle",
      images: s.photos,
      description: d.description ?? `${d.title} ${year}. ${(d.km as number).toLocaleString("fr-FR")} km.`,
      budget_tag: budgetTag(d.price as number), status: "available",
      features, color: d.color ?? null, doors: d.doors ?? null,
      power_din: d.power_din ?? null, co2: d.co2 ?? null,
      equipments: d.equipments ?? null,
      added_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("cars").insert(car);
    if (error) return twilioReply(`❌ Erreur: ${error.message}`);
    sessions.delete(from);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoweb-commerce-auto.vercel.app";
    return twilioReply(`✅ *Publiée !*\n\n🚗 ${car.title}\n💰 ${(car.price as number).toLocaleString("fr-FR")} € · ${(car.km as number).toLocaleString("fr-FR")} km\n📸 ${s.photos.length} photo(s)\n\n🔗 ${site}/car/${car.id}`);
  }

  // Parse text details
  if (body.length > 0 && s.step === "waiting_details") {
    const extracted = await parseDetailsWithClaude(body, s.partialData);
    s.partialData = { ...s.partialData, ...extracted };
    sessions.set(from, s);
    const d = s.partialData;
    const summary = [
      d.title   ? `🚗 ${d.title} ${d.year ?? ""}` : null,
      d.price   ? `💰 ${(d.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      d.km != null ? `📍 ${(d.km as number).toLocaleString("fr-FR")} km` : "❓ KM manquant",
      d.fuel    ? `⛽ ${d.fuel}`    : null,
      d.gearbox ? `🕹 ${d.gearbox}` : null,
      d.color   ? `🎨 ${d.color}`   : null,
    ].filter(Boolean).join("\n");
    return twilioReply(`📝 *Récap:*\n${summary}\n📸 ${s.photos.length} photo(s)\n\nAjoutez des détails ou tapez *"publier"*.`);
  }

  return twilioReply(`🚗 *AUTOWEB Agent*\n\n📸 Photos + carte grise pour ajouter une voiture\n\n*Commandes:*\nstock · vendu [id] · réservé [id] · dispo [id] · supprimer [id] · annuler`);
}
