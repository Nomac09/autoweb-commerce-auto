// French formatting, fr-FR locale, non-breaking spaces per design spec.
const nf = new Intl.NumberFormat("fr-FR");

export function formatPrice(n: number): string {
  return nf.format(n) + " €";
}

export function formatKm(n: number): string {
  return nf.format(n) + " km";
}
