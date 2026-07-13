import { supabaseServer } from "./supabase";

export type CarStatus = "available" | "sold" | "reserved";

export interface Car {
  id: string;
  slug: string;
  make: string;
  model: string;
  version: string | null;
  year: number;
  color: string | null;
  fuel: string | null;
  gearbox: string | null;
  mileage_km: number | null;
  power_hp: number | null;
  power_kw: number | null;
  doors: number | null;
  seats: number | null;
  price_eur: number | null;
  price_estimated: boolean;
  status: CarStatus;
  ct_valid_until: string | null;
  registration_date: string | null;
  options: string[];
  photos: string[];
  sort_order: number;
}

export function isSold(car: Car) {
  return car.status === "sold";
}

// Sold cars stay visible but never expose a price or a reservation CTA.
export function showsPrice(car: Car) {
  return car.status !== "sold" && car.price_eur != null;
}

export async function getAllCars(): Promise<Car[]> {
  const { data, error } = await supabaseServer()
    .from("cars")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Car[];
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const { data, error } = await supabaseServer()
    .from("cars")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Car) ?? null;
}
