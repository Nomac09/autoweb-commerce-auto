import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function twiml(msg: string): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}
function twimlEmpty(): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

async function getSession(id: string) {
  const { data } = await supabase.from("sessions").select("*").eq("id", id).single();
  return data;
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
  const { error } = await supabase.storage.from("cars")
    .upload(`photos/${filename}`, buf, { contentType: "image/jpeg", upsert: true });
  if (error) { console.error(error); return null; }
  return supabase.storage.from("cars").getPublicUrl(`photos/${filename}`).data.publicUrl;
}

async function callClaude(content: any[], system: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content }]
    })
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "";
}

async function ocrCarteGrise(buf: Buffer): Promise<Record<string, any>> {
  const raw = await callClaude(
    [
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: buf.toString("base64") } },
      { type: "text", text: "This is a vehicle registration document. Extract all data. Return ONLY JSON." }
    ],
    `Return ONLY valid JSON (no explanation):
{
  "make": "string (brand, e.g. Citroen)",
  "model": "string (e.g. C4)",
  "year": number (first registration year),
  "fuel": "Essence" | "Diesel" | "Hybride" | "Électrique",
  "power_kw": number or null (kilowatts),
  "doors": number or null,
  "color": string or null
}
Convert power: if you see kW multiply by 1.36 to get ch/hp.`
  );
  try {
    const p = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const title = `${p.make ?? ""} ${p.model ?? ""}`.trim();
    return {
      title: title || null,
      year: p.year ?? null,
      fuel: p.fuel ?? "Essence",
      power_din: p.power_kw ? Math.round(p.power_kw * 1.36) : null,
      doors: p.doors ?? null,
      color: p.color ?? null,
    };
  } catch { return {}; }
}

function parseLocally(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  // Normalize spaces in numbers: "4 990" → "4990"
  const n = text.replace(/(\d)\s+(\d)/g, "$1$2").replace(/(\d)\s+(\d)/g, "$1$2");
  // Price
  const pm = n.match(/(\d{3,6})\s*€/) || n.match(/prix\s*:?\s*(\d{3,6})/i) || n.match(/(\d{3,6})\s*euros?/i);
  if (pm) result.price = parseInt(pm[1]);
  // KM
  const km = n.match(/(\d{4,6})\s*km/i) || n.match(/km\s*:?\s*(\d{4,6})/i);
  if (km) result.km = parseInt(km[1]);
  // Gearbox
  if (/auto(matique)?/i.test(text)) result.gearbox = "Automatique";
  else if (/manu(elle)?|m[eé]canique|m[eé]ca\b/i.test(text)) result.gearbox = "Manuelle";
  // Color
  for (const c of ["noir","blanc","rouge","bleu","gris","vert","orange","beige","marron","argent","silver"]) {
    if (new RegExp(`\\b${c}\\b`, "i").test(text)) {
      result.color = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      break;
    }
  }
  // Guarantee
  const gm = text.match(/garanti[e]?\s*:?\s*(\d+\s*mois)/i);
  if (gm) result.guarantee = gm[1];
  // Model: if text has no big numbers and no € and starts with capital → it's a car name
  const isModelText = !text.match(/\d{4,}/) && !text.match(/€/) && text.match(/^[A-ZÀ-Ö]/);
  if (isModelText) result.title = text.trim();
  return result;
}

async function parseDetails(text: string): Promise<Record<string, any>> {
  const local = parseLocally(text);
  // If we got price and km from regex, no need for Claude
  if (local.price && local.km) return local;
  // Ask Claude for the rest
  const raw = await callClaude(
    [{ type: "text", text: `French car dealer message: "${text}"\nExtract car details. Return ONLY JSON.` }],
    `Return ONLY valid JSON (no explanation, no markdown):
{
  "price": number or null,
  "km": number or null,
  "gearbox": "Manuelle" or "Automatique" or null,
  "color": string or null,
  "title": string or null,
  "description": string or null,
  "guarantee": string or null,
  "equipments": string[] or null
}
IMPORTANT: spaces are thousand separators. "4 990" = 4990, "154 000" = 154000.
"boîte auto" or "automatique" = Automatique. "manuelle" or "mécanique" = Manuelle.`
  );
  try {
    const claude = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return { ...local, ...claude };
  } catch { return local; }
}

function budgetTag(price: number): string {
  return price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
}

async function getStock(): Promise<string> {
  const { data } = await supabase.from("cars")
    .select("id,title,price,status,km")
    .order("added_at", { ascending: false });
  if (!data?.length) return "📦 Stock vide.";
  const lines = data.map(c => {
    const icon = c.status === "available" ? "✅" : c.status === "reserved" ? "🟡" : "❌";
    return `${icon} ${c.title}\n💰 ${c.price.toLocaleString("fr-FR")}€ · ${c.km?.toLocaleString("fr-FR")} km\nID: ${c.id}`;
  });
  return `📦 *Stock AUTOWEB* (${data.length} voitures)\n\n${lines.join("\n\n")}`;
}

// ── MAIN HANDLER ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const form   = await req.formData();
  const from   = form.get("From")?.toString() ?? "";
  const body   = form.get("Body")?.toString().trim() ?? "";
  const nMedia = parseInt(form.get("NumMedia")?.toString() ?? "0");
  const lower  = body.toLowerCase().trim();

  // Auth
  const owner = process.env.OWNER_WHATSAPP ?? "";
  if (owner && !from.includes(owner)) return twiml("❌ Non autorisé.");

  // ── GLOBAL COMMANDS (work anytime) ──────────────────────
  if (lower === "stock" || lower === "status") {
    return twiml(await getStock());
  }

  if (lower.startsWith("vendu ")) {
    const id = body.slice(6).trim();
    await supabase.from("cars").update({ status: "sold" }).eq("id", id);
    return twiml(`✅ *${id}* marquée comme *vendue* sur le site.`);
  }
  if (lower.startsWith("réservé ") || lower.startsWith("reserve ")) {
    const id = body.split(" ").slice(1).join(" ").trim();
    await supabase.from("cars").update({ status: "reserved" }).eq("id", id);
    return twiml(`🟡 *${id}* marquée comme *réservée* sur le site.`);
  }
  if (lower.startsWith("dispo ")) {
    const id = body.slice(6).trim();
    await supabase.from("cars").update({ status: "available" }).eq("id", id);
    return twiml(`✅ *${id}* remise *disponible* sur le site.`);
  }
  if (lower.startsWith("supprimer ") || lower.startsWith("delete ")) {
    const id = body.split(" ").slice(1).join(" ").trim();
    await supabase.from("cars").delete().eq("id", id);
    return twiml(`🗑️ *${id}* supprimée du stock.`);
  }

  // ── START NEW CAR SESSION ───────────────────────────────
  if (lower === "nouvelle voiture" || lower === "new" || lower === "ajouter") {
    await deleteSession(from); // clear any previous session
    await saveSession(from, [], {});
    return twiml(
      `🚗 *Nouvelle voiture — Session ouverte*\n\n` +
      `Envoyez dans l'ordre:\n` +
      `1️⃣ Screenshot de la carte grise\n` +
      `2️⃣ Photos de la voiture (une par une ou plusieurs)\n` +
      `3️⃣ Les détails: prix, km, boîte, couleur\n\n` +
      `Tapez *"publier"* pour mettre en ligne.\n` +
      `Tapez *"annuler"* pour tout effacer.`
    );
  }

  // ── CANCEL ──────────────────────────────────────────────
  if (lower === "annuler" || lower === "cancel") {
    await deleteSession(from);
    return twiml(
      `✅ Session annulée. Toutes les données ont été effacées.\n\n` +
      `Tapez *"nouvelle voiture"* pour recommencer.`
    );
  }

  // ── LOAD SESSION ────────────────────────────────────────
  const sess = await getSession(from);

  // If no active session and receiving photos/text, prompt to start one
  if (!sess) {
    if (nMedia > 0 || body.length > 0) {
      return twiml(
        `👋 Tapez *"nouvelle voiture"* pour démarrer l'ajout d'une voiture.\n\n` +
        `Ou tapez *"stock"* pour voir le stock actuel.`
      );
    }
    return twiml(
      `🚗 *AUTOWEB Agent*\n\n` +
      `*Commandes:*\n` +
      `• *nouvelle voiture* — ajouter une voiture\n` +
      `• *stock* — voir le stock\n` +
      `• *vendu [id]* — marquer vendue\n` +
      `• *réservé [id]* — marquer réservée\n` +
      `• *dispo [id]* — remettre disponible\n` +
      `• *supprimer [id]* — supprimer`
    );
  }

  let photos: string[] = sess.photos ?? [];
  let data: Record<string, any> = sess.partial_data ?? {};

  // ── PHOTOS ──────────────────────────────────────────────
  if (nMedia > 0) {
    const uploaded: string[] = [];

    for (let i = 0; i < nMedia; i++) {
      const url  = form.get(`MediaUrl${i}`)?.toString() ?? "";
      const type = form.get(`MediaContentType${i}`)?.toString() ?? "";

      // PDF warning
      if (type.includes("pdf")) {
        return twiml(
          `⚠️ *Carte grise en PDF non supportée.*\n\n` +
          `Faites une *capture d'écran* (screenshot) de la carte grise et envoyez-la comme image.`
        );
      }

      if (!type.startsWith("image/")) continue;

      const buf = await fetchTwilioMedia(url);
      const pub = await uploadPhoto(buf, `${Date.now()}-${i}.jpg`);
      if (pub) uploaded.push(pub);

      // Try OCR on this image if we don't have a title yet
      if (!data.title) {
        const cg = await ocrCarteGrise(buf);
        if (cg.title || cg.year) {
          data = { ...data, ...cg };
        }
      }
    }

    photos = [...photos, ...uploaded];
    await saveSession(from, photos, data);

    // Build response
    const detected = (data.title || data.year)
      ? `\n\n📋 *Carte grise lue:*\n🚗 ${data.title ?? "?"} ${data.year ?? ""}\n⛽ ${data.fuel ?? "?"}`
      : "";

    const photoCount = `📸 *${uploaded.length} photo(s) ajoutée(s)* → total: *${photos.length}*`;

    return twiml(
      `${photoCount}${detected}\n\n` +
      `Envoyez d'autres photos ou les détails:\n` +
      `💰 Prix · 📍 KM · 🕹 Boîte · 🎨 Couleur\n\n` +
      `Tapez *"publier"* quand tout est prêt.`
    );
  }

  // ── PUBLISH ─────────────────────────────────────────────
  if (lower === "publier" || lower === "publish") {
    // Validate
    const missing: string[] = [];
    if (photos.length === 0) missing.push("📸 photos");
    if (!data.price)         missing.push("💰 prix");
    if (data.km == null)     missing.push("📍 kilométrage");
    if (!data.title)         missing.push("🚗 modèle");

    if (missing.length > 0) {
      return twiml(
        `❌ *Impossible de publier — il manque:*\n${missing.join("\n")}\n\n` +
        `Envoyez les informations manquantes puis retapez *"publier"*.`
      );
    }

    const year = data.year ?? new Date().getFullYear();
    const features: string[] = data.features ?? [];
    if (data.guarantee) features.push(`Garantie ${data.guarantee}`);
    if (!features.some((f: string) => f.toLowerCase().includes("ct"))) features.push("CT OK");

    const carId = `${(data.title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}-${Date.now().toString(36)}`;

    const car = {
      id: carId,
      title: data.title,
      price: data.price,
      year,
      km: data.km,
      fuel: data.fuel ?? "Essence",
      gearbox: data.gearbox ?? "Manuelle",
      images: photos,
      description: data.description ?? `${data.title} ${year}. ${(data.km as number).toLocaleString("fr-FR")} km.`,
      budget_tag: budgetTag(data.price as number),
      status: "available",
      features,
      color: data.color ?? null,
      doors: data.doors ?? null,
      power_din: data.power_din ?? null,
      equipments: data.equipments ?? null,
      added_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("cars").insert(car);

    if (error) {
      return twiml(
        `❌ *Erreur lors de la publication:*\n${error.message}\n\n` +
        `Retapez *"publier"* pour réessayer.`
      );
    }

    // Session cleared on success
    await deleteSession(from);

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoweb-commerce-auto.vercel.app";

    return twiml(
      `🎉 *Voiture publiée avec succès !*\n\n` +
      `🚗 ${car.title} ${year}\n` +
      `💰 ${(car.price as number).toLocaleString("fr-FR")} € TTC\n` +
      `📍 ${(car.km as number).toLocaleString("fr-FR")} km\n` +
      `⛽ ${car.fuel} · 🕹 ${car.gearbox}\n` +
      `📸 ${photos.length} photo(s)\n\n` +
      `🔗 *Voir l'annonce:*\n${site}/car/${carId}\n\n` +
      `🔗 *Voir le stock:*\n${site}/stock\n\n` +
      `Tapez *"nouvelle voiture"* pour ajouter une autre voiture.`
    );
  }

  // ── PARSE TEXT DETAILS ───────────────────────────────────
  if (body.length > 0) {
    const extracted = await parseDetails(body);

    if (extracted.price)               data.price       = extracted.price;
    if (extracted.km != null)          data.km          = extracted.km;
    if (extracted.gearbox)             data.gearbox     = extracted.gearbox;
    if (extracted.color)               data.color       = extracted.color;
    if (extracted.title && !data.title) data.title      = extracted.title;
    if (extracted.description)         data.description = extracted.description;
    if (extracted.guarantee)           data.guarantee   = extracted.guarantee;
    if (extracted.equipments)          data.equipments  = extracted.equipments;

    await saveSession(from, photos, data);

    const summary = [
      data.title   ? `🚗 ${data.title} ${data.year ?? ""}` : "❓ Modèle manquant",
      data.price   ? `💰 ${(data.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      data.km != null ? `📍 ${(data.km as number).toLocaleString("fr-FR")} km` : "❓ KM manquant",
      data.fuel    ? `⛽ ${data.fuel}`    : null,
      data.gearbox ? `🕹 ${data.gearbox}` : null,
      data.color   ? `🎨 ${data.color}`   : null,
    ].filter(Boolean).join("\n");

    const allGood = data.title && data.price && data.km != null;

    return twiml(
      `📝 *Récapitulatif:*\n${summary}\n📸 ${photos.length} photo(s)\n\n` +
      (allGood
        ? `✅ Tout est prêt ! Tapez *"publier"* pour mettre en ligne.`
        : `Complétez les informations manquantes puis tapez *"publier"*.`)
    );
  }

  // Fallback
  return twiml(
    `🚗 Session en cours (${photos.length} photo(s))\n\n` +
    `Envoyez des photos ou des détails.\n` +
    `Tapez *"publier"* pour publier · *"annuler"* pour effacer.`
  );
}
