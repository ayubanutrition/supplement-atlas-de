// Preisnormalisierung. Alle Geldbeträge intern in Cent (ganze Zahlen),
// damit keine Gleitkommafehler in Vergleiche rutschen.

export const STALE_AFTER_DAYS = 30;

/**
 * Wandelt eine deutsche oder englische Dezimaleingabe ("12,99", "12.99", "1.299,00")
 * in eine Zahl um. Gibt null zurück, wenn die Eingabe leer oder ungültig ist.
 */
export function parseDecimal(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  let s = input.trim().replace(/\s|€|g/gi, '');
  if (s === '') return null;
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    // Das zuletzt stehende Zeichen ist das Dezimaltrennzeichen.
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (hasComma) {
    s = s.replace(',', '.');
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Euro → Cent, kaufmännisch gerundet. */
export function eurToCents(eur: number): number {
  return Math.round((eur + Number.EPSILON) * 100);
}

/**
 * Preis je Bezugsmenge, z. B. Cent pro 100 g Kreatin-Monohydrat.
 * priceCents: Gesamtpreis inkl. offen ausgewiesener Zusatzkosten
 * amount: enthaltene Menge des Bezugsstoffs (z. B. Gramm Kreatin-Monohydrat)
 * per: Bezugsgröße (1 für "pro Gramm", 100 für "pro 100 g")
 * Rückgabe in Cent, auf ganze Cent gerundet; null bei fehlenden/ungültigen Daten.
 */
export function pricePer(
  priceCents: number | null | undefined,
  amount: number | null | undefined,
  per = 100,
): number | null {
  if (priceCents == null || amount == null) return null;
  if (!Number.isFinite(priceCents) || !Number.isFinite(amount)) return null;
  if (priceCents < 0 || amount <= 0 || per <= 0) return null;
  return Math.round((priceCents * per) / amount);
}

/** Menge des Wirkstoffs in einer Packung aus Nettogewicht und Anteil je 100 g. */
export function activeAmount(netWeightG: number | null | undefined, per100g: number | null | undefined): number | null {
  if (netWeightG == null || per100g == null) return null;
  if (netWeightG <= 0 || per100g < 0 || per100g > 100) return null;
  return (netWeightG * per100g) / 100;
}

/** Formatiert Cent als deutschen Eurobetrag ("12,99 €"). */
export function formatEur(cents: number | null | undefined): string {
  if (cents == null) return 'nicht berechenbar';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

/** Tage zwischen zwei ISO-Datumsangaben (YYYY-MM-DD oder volle ISO-Zeit). */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(fromIso.slice(0, 10) + 'T00:00:00Z');
  const b = Date.parse(toIso.slice(0, 10) + 'T00:00:00Z');
  return Math.floor((b - a) / 86_400_000);
}

export type PriceFreshness = 'aktuell' | 'erneut-pruefen';

/** Preise älter als STALE_AFTER_DAYS gelten als "erneut zu prüfen". */
export function priceFreshness(observedAt: string, today: string): PriceFreshness {
  return daysBetween(observedAt, today) > STALE_AFTER_DAYS ? 'erneut-pruefen' : 'aktuell';
}
