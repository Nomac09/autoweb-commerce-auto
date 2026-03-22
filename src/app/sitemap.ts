import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("cars").select("id,added_at");
  const cars = (data ?? []).map((c: any) => ({
    url: `https://www.autoweb-commerce.fr/car/${c.id}`,
    lastModified: new Date(c.added_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [
    { url: "https://www.autoweb-commerce.fr", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://www.autoweb-commerce.fr/stock", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://www.autoweb-commerce.fr/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://www.autoweb-commerce.fr/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...cars,
  ];
}
