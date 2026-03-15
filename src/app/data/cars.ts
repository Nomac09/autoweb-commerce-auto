export type FuelType    = "Essence" | "Diesel" | "Hybride" | "Électrique";
export type GearboxType = "Manuelle" | "Automatique";
export type BudgetTag   = "< 2000 €" | "2000-4000 €" | "≥ 4000 €";
export type CarStatus   = "available" | "reserved" | "sold";
export type Car = {
  id: string; title: string; price: number; year: number; km: number;
  fuel: FuelType; gearbox: GearboxType; images: string[];
  description: string; budgetTag: BudgetTag; status: CarStatus;
  features: string[]; addedAt: string;
};
export const cars: Car[] = [
  { "id":"peugeot-206-2008","title":"Peugeot 206 1.4 Essence","price":1900,"year":2008,"km":145000,"fuel":"Essence","gearbox":"Manuelle","images":["/cars/peugeot1.jpg"],"description":"Peugeot 206 en très bon état. Idéale premier véhicule ou petits budgets. Carnet d'entretien à jour.","budgetTag":"< 2000 €","status":"available","features":["CT OK","Entretien à jour","Économique"],"addedAt":"2026-03-10T10:00:00Z" },
  { "id":"renault-clio-2012","title":"Renault Clio 1.2 16V","price":3500,"year":2012,"km":98000,"fuel":"Essence","gearbox":"Manuelle","images":["/cars/clio1.jpg"],"description":"Clio très propre, historique complet, aucun accident. Clim, vitres électriques, radio Bluetooth.","budgetTag":"2000-4000 €","status":"available","features":["Climatisation","CT OK","Garantie 3 mois","Bluetooth"],"addedAt":"2026-03-12T09:00:00Z" },
  { "id":"citroen-c3-2015","title":"Citroën C3 1.6 HDi","price":5200,"year":2015,"km":112000,"fuel":"Diesel","gearbox":"Manuelle","images":["/cars/c31.jpg"],"description":"C3 Diesel économique, parfaite pour longs trajets. Garantie 3 mois incluse. Équipements complets.","budgetTag":"≥ 4000 €","status":"available","features":["Garantie 3 mois","CT OK","Diesel économique","GPS"],"addedAt":"2026-03-14T14:00:00Z" },
  { "id":"fiat-punto-2009","title":"Fiat Punto 1.2","price":2400,"year":2009,"km":132000,"fuel":"Essence","gearbox":"Manuelle","images":["/cars/punto1.jpg"],"description":"Punto fiable et économique. Idéale en ville. Faible consommation, petite assurance.","budgetTag":"2000-4000 €","status":"available","features":["CT OK","Faible consommation","Petite assurance"],"addedAt":"2026-03-08T11:00:00Z" }
];
export const getAvailableCars = () => cars.filter((c) => c.status === "available");
export const getCarById = (id: string) => cars.find((c) => c.id === id) ?? null;
export const getLatestCars = (n = 6) =>
  [...cars].filter((c) => c.status === "available")
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, n);
export const getBudgetTag = (price: number): BudgetTag =>
  price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
