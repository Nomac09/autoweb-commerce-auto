// Single source of truth for business / contact details.
export const site = {
  name: "AUTOWEB COMMERCE",
  legalName: "AUTOWEB COMMERCE SAS",
  siren: "100148469",
  city: "Bondues",
  region: "Lille",
  phoneDisplay: "07 83 80 96 94",
  phoneHref: "tel:+33783809694",
  whatsappHref: "https://wa.me/33783809694",
  email: "autowebcommercesas@gmail.com",
  address: {
    street: "2 Allée de la Mannée",
    zip: "59910",
    city: "Bondues",
  },
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=2+All%C3%A9e+de+la+Mann%C3%A9e+59910+Bondues",
  hours: [
    { days: "Du lundi au samedi", time: "9h à 19h" },
    { days: "Dimanche", time: "Sur rendez-vous" },
  ],
} as const;
