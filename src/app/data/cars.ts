export type Car = {
  id: string; title: string; price: number; year: number; km: number;
  fuel: "Essence" | "Diesel"; gearbox: "Manuelle" | "Automatique";
  images: string[]; description: string; budgetTag: "< 2000 €" | "2000-4000 €" | "≥ 4000 €";
};

export const cars: Car[] = [
  {id:"peugeot-206",title:"Peugeot 206 1.4 Essence",price:1900,year:2008,km:145000,fuel:"Essence",gearbox:"Manuelle",images:["/cars/peugeot1.jpg"],description:"Peugeot 206 en très bon état, CT OK.",budgetTag:"< 2000 €"},
  {id:"renault-clio",title:"Renault Clio 1.2 16V",price:3500,year:2012,km:98000,fuel:"Essence",gearbox:"Manuelle",images:["/cars/clio1.jpg"],description:"Clio très propre, clim, vitres électriques.",budgetTag:"2000-4000 €"},
  {id:"citroen-c3",title:"Citroën C3 1.6 HDi",price:5200,year:2015,km:112000,fuel:"Diesel",gearbox:"Manuelle",images:["/cars/c31.jpg"],description:"C3 Diesel économique, garantie 3 mois.",budgetTag:"≥ 4000 €"},
  {id:"fiat-punto",title:"Fiat Punto 1.2",price:2400,year:2009,km:132000,fuel:"Essence",gearbox:"Manuelle",images:["/cars/punto1.jpg"],description:"Punto fiable, idéale ville.",budgetTag:"2000-4000 €"}
];
