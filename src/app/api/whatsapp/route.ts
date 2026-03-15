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

function parseLocally(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const n = text.replace(/(\d)\s+(\d)/g, "$1$2").replace(/(\d)\s+(\d)/g, "$1$2");
  const pm = n.match(/(\d{3,6})\s*€/) || n.match(/prix\s*:?\s*(\d{3,6})/i);
  if (pm) result.price = parseInt(pm[1]);
  const km = n.match(/(\d{4,6})\s*km/i) || n.match(/km\s*:?\s*(\d{4,6})/i);
  if (km) result.km = parseInt(km[1]);
  if (/auto(matique)?/i.test(text)) result.gearbox = "Automatique";
  else if (/manu(elle)?|m[eé]canique/i.test(text)) result.gearbox = "Manuelle";
  for (const c of ["noir","blanc","rouge","bleu","gris","vert","orange","beige","marron","argent"]) {
    if (new RegExp(`\\b${c}\\b`, "i").test(text)) {
      result.color = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }
  const gm = text.match(/garanti[e]?\s*:?\s*(\d+\s*mois)/i);
  if (gm) result.guarantee = gm[1];
  // Year: 4-digit number between 1990-2030
  const ym = text.match(/\b(19[9]\d|20[0-3]\d)\b/);
  if (ym) result.year = parseInt(ym[1]);
  // Model: if text contains no price/km patterns, treat as model name
  if (!text.match(/\d{4,}\s*km/i) && !text.match(/\d{3,}\s*€/) && text.length < 60) {
    result.title = text.trim();
  }
  return result;
}

async function parseDetails(text: string): Promise<Record<string, any>> {
  const local = parseLocally(text);
  if (local.price && local.km) return local;
  const raw = await callClaude(
    [{ type: "text", text: `French car dealer message: "${text}"\nExtract car details. Return ONLY JSON.` }],
    `Return ONLY valid JSON (no markdown):
{"price":number|null,"km":number|null,"year":number|null,"gearbox":"Manuelle"|"Automatique"|null,"color":string|null,"title":string|null,"description":string|null,"guarantee":string|null,"equipments":string[]|null}
Spaces are thousand separators: "4 990"=4990, "154 000"=154000.`
  );
  try { return { ...local, ...JSON.parse(raw.replace(/```json|```/g, "").trim()) }; }
  catch { return local; }
}

function budgetTag(price: number) {
  return price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
}

async function getStock() {
  const { data } = await supabase.from("cars")
    .select("id,title,price,status,km").order("added_at", { ascending: false });
  if (!data?.length) return "📦 Stock vide.";
  return `📦 *Stock AUTOWEB* (${data.length})\n\n` +
    data.map(c =>
      `${c.status==="available"?"✅":c.status==="reserved"?"🟡":"❌"} ${c.title}\n` +
      `💰 ${c.price?.toLocaleString("fr-FR")}€ · ${c.km?.toLocaleString("fr-FR")} km\n` +
      `ID: ${c.id}`
    ).join("\n\n");
}

export async function POST(req: NextRequest) {
  const form   = await req.formData();
  const from   = form.get("From")?.toString() ?? "";
  const body   = form.get("Body")?.toString().trim() ?? "";
  const nMedia = parseInt(form.get("NumMedia")?.toString() ?? "0");
  const lower  = body.toLowerCase().trim();
  const owner  = process.env.OWNER_WHATSAPP ?? "";
  if (owner && !from.includes(owner)) return twiml("❌ Non autorisé.");

  // ── GLOBAL COMMANDS ──────────────────────────────────────
  if (lower === "stock" || lower === "status") return twiml(await getStock());

  if (lower.startsWith("vendu ")) {
    const id = body.slice(6).trim();
    await supabase.from("cars").update({ status: "sold" }).eq("id", id);
    return twiml(`✅ *${id}*\nMarquée *vendue* sur le site.`);
  }
  if (lower.startsWith("réservé ") || lower.startsWith("reserve ")) {
    const id = body.split(" ").slice(1).join(" ").trim();
    await supabase.from("cars").update({ status: "reserved" }).eq("id", id);
    return twiml(`🟡 *${id}*\nMarquée *réservée* sur le site.`);
  }
  if (lower.startsWith("dispo ")) {
    const id = body.slice(6).trim();
    await supabase.from("cars").update({ status: "available" }).eq("id", id);
    return twiml(`✅ *${id}*\nRemise *disponible* sur le site.`);
  }
  if (lower.startsWith("supprimer ") || lower.startsWith("delete ")) {
    const id = body.split(" ").slice(1).join(" ").trim();
    await supabase.from("cars").delete().eq("id", id);
    return twiml(`🗑️ *${id}* supprimée.`);
  }

  // ── MODIFIER [id] [champ] [valeur] ──────────────────────
  if (lower.startsWith("modifier ") || lower.startsWith("modif ") || lower.startsWith("edit ")) {
    const parts = body.split(" ");
    const carId = parts[1]?.trim();
    const field = parts[2]?.toLowerCase().trim();
    const value = parts.slice(3).join(" ").trim();
    if (!carId || !field || !value) {
      return twiml(
        `❌ Format: *modifier [id] [champ] [valeur]*\n\n` +
        `Exemples:\n` +
        `modifier [id] km 87000\n` +
        `modifier [id] prix 4500\n` +
        `modifier [id] année 2011\n` +
        `modifier [id] modele Citroën C4 1.4 Essence\n` +
        `modifier [id] carburant Diesel\n` +
        `modifier [id] boite Automatique\n` +
        `modifier [id] couleur Gris\n` +
        `modifier [id] description Voiture révisée, excellent état\n\n` +
        `Tapez *stock* pour voir les IDs.`
      );
    }
    const fieldMap: Record<string,string> = {
      km:"km", prix:"price", price:"price",
      année:"year", annee:"year", year:"year",
      modele:"title", modèle:"title", title:"title",
      carburant:"fuel", fuel:"fuel",
      boite:"gearbox", boîte:"gearbox", gearbox:"gearbox",
      couleur:"color", color:"color",
      description:"description",
      garantie:"guarantee", guarantee:"guarantee",
    };
    const dbField = fieldMap[field];
    if (!dbField) return twiml(`❌ Champ inconnu: *${field}*\nDisponibles: km, prix, année, modele, carburant, boite, couleur, description, garantie`);
    const numericFields = ["km","price","year"];
    const dbValue = numericFields.includes(dbField) ? parseInt(value) : value;
    const updates: Record<string,any> = { [dbField]: dbValue };
    if (dbField === "price") {
      const p = parseInt(value);
      updates.budget_tag = p < 2000 ? "< 2000 €" : p <= 4000 ? "2000-4000 €" : "≥ 4000 €";
    }
    const { error: modErr } = await supabase.from("cars").update(updates).eq("id", carId);
    if (modErr) return twiml(`❌ Erreur: ${modErr.message}`);
    return twiml(`✅ *${carId}*\n${field} → *${value}*\n\nMis à jour sur le site.`);
  }

  // ── DÉTAILS [id] [texte] — ajouter équipements/features ─
  if (lower.startsWith("détails ") || lower.startsWith("details ") || lower.startsWith("equipements ")) {
    const parts = body.split(" ");
    const carId = parts[1]?.trim();
    const detailText = parts.slice(2).join(" ").trim();
    if (!carId || !detailText) {
      return twiml(
        `❌ Format: *détails [id] [texte]*\n\n` +
        `Exemple:\n` +
        `détails [id] révision complète, garantie 3 mois, plaquettes neuves, pneus neufs avant\n\n` +
        `Séparez les éléments par des virgules.\n` +
        `Tapez *stock* pour voir les IDs.`
      );
    }
    const { data: existing } = await supabase.from("cars").select("features,equipments").eq("id", carId).single();
    if (!existing) return twiml(`❌ Voiture non trouvée: ${carId}`);
    const items = detailText.split(",").map((s:string) => s.trim()).filter(Boolean);
    const existingFeatures: string[] = existing.features ?? [];
    const existingEquipments: string[] = existing.equipments ?? [];
    const newFeatures = items.filter((i:string) => i.split(" ").length <= 4);
    const newEquipments = items.filter((i:string) => i.split(" ").length > 4);
    const mergedFeatures = [...new Set([...existingFeatures, ...newFeatures])];
    const mergedEquipments = [...new Set([...existingEquipments, ...newEquipments])];
    await supabase.from("cars").update({
      features: mergedFeatures,
      equipments: mergedEquipments.length > 0 ? mergedEquipments : existingEquipments,
    }).eq("id", carId);
    return twiml(
      `✅ *${carId}* mis à jour\n\n` +
      `🏷 Features: ${mergedFeatures.join(", ")}\n` +
      (mergedEquipments.length > 0 ? `🔧 Équipements: ${mergedEquipments.join(", ")}` : "")
    );
  }

  // ── PHOTOS [id] — remplacer les photos ──────────────────
  if (lower.startsWith("photos ") && body.trim().split(" ").length === 2) {
    const carId = body.slice(7).trim();
    const { data: existing } = await supabase.from("cars").select("id,title").eq("id", carId).single();
    if (!existing) return twiml(`❌ Voiture non trouvée: ${carId}`);
    await saveSession(from, [], { __replace_photos_for: carId, __replace_mode: true });
    return twiml(
      `📸 *Mode remplacement photos*\nVoiture: *${existing.title}*\n\n` +
      `Envoyez les nouvelles photos une par une.\n` +
      `Tapez *"confirmer"* quand toutes les photos sont envoyées.`
    );
  }

  // ── CONFIRMER — valider le remplacement de photos ───────
  if (lower === "confirmer" || lower === "confirm") {
    const sessCfm = await getSession(from);
    if (sessCfm?.partial_data?.__replace_mode && sessCfm?.partial_data?.__replace_photos_for) {
      const carId = sessCfm.partial_data.__replace_photos_for;
      const newPhotos = sessCfm.photos ?? [];
      if (newPhotos.length === 0) return twiml("❌ Aucune photo reçue. Envoyez les photos d'abord.");
      await supabase.from("cars").update({ images: newPhotos }).eq("id", carId);
      await deleteSession(from);
      return twiml(`✅ *${carId}*\n${newPhotos.length} photo(s) remplacée(s) sur le site.`);
    }
    return twiml("❌ Rien à confirmer. Utilisez *photos [id]* d'abord.");
  }


  // ── START NEW SESSION ────────────────────────────────────
  if (lower === "nouvelle voiture" || lower === "new" || lower === "ajouter") {
    await deleteSession(from);
    await saveSession(from, [], {});
    return twiml(
      `🚗 *Nouvelle voiture — Session ouverte*\n\n` +
      `Envoyez dans l'ordre:\n` +
      `1️⃣ Photos de la voiture (une par une)\n` +
      `2️⃣ Les détails en un message:\n\n` +
      `Exemple:\n` +
      `_Citroën C4 2011, 4990€, 154000km, manuelle, noir, essence_\n\n` +
      `Tapez *"publier"* pour mettre en ligne.\n` +
      `Tapez *"recap"* pour voir l'état actuel.\n` +
      `Tapez *"annuler"* pour tout effacer.`
    );
  }

  // ── CANCEL ───────────────────────────────────────────────
  if (lower === "annuler" || lower === "cancel") {
    await deleteSession(from);
    return twiml(`✅ Session annulée.\n\nTapez *"nouvelle voiture"* pour recommencer.`);
  }

  // ── LOAD SESSION ─────────────────────────────────────────
  const sess = await getSession(from);

  if (!sess) {
    return twiml(
      `🚗 *AUTOWEB Agent*\n\n` +
      `Tapez *"nouvelle voiture"* pour ajouter une voiture.\n\n` +
      `*Autres commandes:*\n` +
      `• *stock* — voir le stock\n` +
      `• *vendu [id]* — marquer vendue\n` +
      `• *réservé [id]* — marquer réservée\n` +
      `• *dispo [id]* — remettre disponible\n` +
      `• *supprimer [id]* — supprimer`
    );
  }

  let photos: string[] = sess.photos ?? [];
  let data: Record<string, any> = sess.partial_data ?? {};

  // ── RECAP ────────────────────────────────────────────────
  if (lower === "recap" || lower === "récap") {
    const summary = [
      data.title   ? `🚗 ${data.title} ${data.year ?? ""}` : "❓ Modèle manquant",
      data.price   ? `💰 ${(data.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      data.km != null ? `📍 ${(data.km as number).toLocaleString("fr-FR")} km` : "❓ KM manquant",
      data.fuel    ? `⛽ ${data.fuel}`    : "❓ Carburant manquant",
      data.gearbox ? `🕹 ${data.gearbox}` : "❓ Boîte manquante",
      data.color   ? `🎨 ${data.color}`   : null,
    ].filter(Boolean).join("\n");
    return twiml(`📋 *État de la session:*\n\n${summary}\n📸 ${photos.length} photo(s)`);
  }

  // ── PHOTOS ───────────────────────────────────────────────
  if (nMedia > 0) {
    const uploaded: string[] = [];
    for (let i = 0; i < nMedia; i++) {
      const url  = form.get(`MediaUrl${i}`)?.toString() ?? "";
      const type = form.get(`MediaContentType${i}`)?.toString() ?? "";
      if (type.includes("pdf")) {
        return twiml(`⚠️ Envoyez les photos en *image*, pas en PDF.`);
      }
      if (!type.startsWith("image/")) continue;
      const buf = await fetchTwilioMedia(url);
      const pub = await uploadPhoto(buf, `${Date.now()}-${i}.jpg`);
      if (pub) uploaded.push(pub);
    }
    photos = [...photos, ...uploaded];
    await saveSession(from, photos, data);
    return twiml(`📸 *+${uploaded.length} photo(s)* → total: *${photos.length}*\n\nEnvoyez d'autres photos ou les détails.`);
  }

  // ── PUBLISH ──────────────────────────────────────────────
  if (lower === "publier" || lower === "publish") {
    const missing: string[] = [];
    if (photos.length === 0) missing.push("📸 photos");
    if (!data.price)         missing.push("💰 prix");
    if (data.km == null)     missing.push("📍 kilométrage");
    if (!data.title)         missing.push("🚗 modèle");
    if (!data.fuel)          missing.push("⛽ carburant");

    if (missing.length > 0) {
      return twiml(
        `❌ *Il manque:*\n${missing.join("\n")}\n\n` +
        `Envoyez les informations manquantes puis retapez *"publier"*.`
      );
    }

    const year = data.year ?? new Date().getFullYear();
    const features: string[] = data.features ?? [];
    if (data.guarantee) features.push(`Garantie ${data.guarantee}`);
    if (!features.some((f: string) => f.toLowerCase().includes("ct"))) features.push("CT OK");

    const carId = `${(data.title as string).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${year}-${Date.now().toString(36)}`;

    const car = {
      id: carId,
      title: data.title,
      price: data.price,
      year,
      km: data.km,
      fuel: data.fuel,
      gearbox: data.gearbox ?? "Manuelle",
      images: photos,
      description: data.description ?? `${data.title} ${year}. ${(data.km as number).toLocaleString("fr-FR")} km. ${data.fuel}, ${data.gearbox ?? "Manuelle"}.`,
      budget_tag: budgetTag(data.price as number),
      status: "available",
      features,
      color: data.color ?? null,
      doors: data.doors ?? null,
      power_din: data.power_din ?? null,
      co2: data.co2 ?? null,
      equipments: data.equipments ?? null,
      guarantee: data.guarantee ?? null,
      added_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("cars").insert(car);
    if (error) return twiml(`❌ Erreur: ${error.message}\n\nRetapez *"publier"* pour réessayer.`);

    await deleteSession(from);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoweb-commerce-auto.vercel.app";

    return twiml(
      `🎉 *Voiture publiée avec succès !*\n\n` +
      `🚗 ${car.title} ${year}\n` +
      `💰 ${(car.price as number).toLocaleString("fr-FR")} € TTC\n` +
      `📍 ${(car.km as number).toLocaleString("fr-FR")} km\n` +
      `⛽ ${car.fuel} · 🕹 ${car.gearbox}\n` +
      `📸 ${photos.length} photo(s)\n\n` +
      `🔗 Annonce: ${site}/car/${carId}\n` +
      `🔗 Stock: ${site}/stock\n\n` +
      `Tapez *"nouvelle voiture"* pour en ajouter une autre.`
    );
  }

  // ── PARSE TEXT DETAILS ───────────────────────────────────
  if (body.length > 0) {
    const extracted = await parseDetails(body);
    if (extracted.price)                data.price       = extracted.price;
    if (extracted.km != null)           data.km          = extracted.km;
    if (extracted.year)                 data.year        = extracted.year;
    if (extracted.gearbox)              data.gearbox     = extracted.gearbox;
    if (extracted.color)                data.color       = extracted.color;
    if (extracted.fuel)                 data.fuel        = extracted.fuel;
    if (extracted.title)                data.title       = extracted.title;
    if (extracted.description)          data.description = extracted.description;
    if (extracted.guarantee)            data.guarantee   = extracted.guarantee;
    if (extracted.equipments)           data.equipments  = extracted.equipments;
    await saveSession(from, photos, data);

    const summary = [
      data.title   ? `🚗 ${data.title} ${data.year ?? ""}` : "❓ Modèle manquant",
      data.price   ? `💰 ${(data.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      data.km != null ? `📍 ${(data.km as number).toLocaleString("fr-FR")} km` : "❓ KM manquant",
      data.fuel    ? `⛽ ${data.fuel}`    : "❓ Carburant manquant",
      data.gearbox ? `🕹 ${data.gearbox}` : null,
      data.color   ? `🎨 ${data.color}`   : null,
    ].filter(Boolean).join("\n");

    const allGood = data.title && data.price && data.km != null && data.fuel;

    return twiml(
      `📝 *Récapitulatif:*\n${summary}\n📸 ${photos.length} photo(s)\n\n` +
      (allGood
        ? `✅ Tout est prêt ! Tapez *"publier"* pour mettre en ligne.`
        : `Complétez les informations manquantes puis tapez *"publier"*.`)
    );
  }

  return twiml(
    `🚗 Session en cours · ${photos.length} photo(s)\n\n` +
    `Tapez *"recap"* pour voir l'état · *"publier"* pour publier · *"annuler"* pour effacer.`
  );
}
