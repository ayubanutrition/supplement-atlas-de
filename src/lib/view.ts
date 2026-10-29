// Aufbereitung der Daten für die Seiten. Keine Bewertung, nur Rechnung.
import { activeAmount, pricePer, priceFreshness, type PriceFreshness } from './price.ts';
import { categoryBySubstance } from './categories.ts';
import type { Brand, Dataset, PriceObservation, Product, Source } from './schema.ts';
import { published } from './schema.ts';

export interface PriceView {
  obs: PriceObservation;
  regularPerBasis: number | null;
  salePerBasis: number | null;
  regularPerGram: number | null;
  /** Ohne Code zahlbarer Preis am Beobachtungstag (Aktion, sonst regulär). */
  payableCents: number;
  payablePerBasis: number | null;
  isSale: boolean;
  /** Aktion laut Anbieter bereits beendet: Preis nicht mehr als aktuell zeigen. */
  saleExpired: boolean;
  freshness: PriceFreshness;
}

export interface ProductView {
  product: Product;
  brand: Brand;
  activeG: number | null;
  /** Neueste Preisbeobachtung (nach observedAt). */
  latest: PriceView | null;
}

/** Heutiges Datum in Berlin (YYYY-MM-DD), nicht UTC: um Mitternacht zählt sonst der falsche Tag. */
export function today(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
}

/** Wirkstoffmenge je Packung in g: Gesamtmenge, sonst Füllmenge × Anteil. */
export function packActive(p: Product): number | null {
  return p.activeTotalG ?? activeAmount(p.netWeightG, p.activePer100g);
}

export function priceView(p: Product, obs: PriceObservation, asOf = today()): PriceView {
  const active = packActive(p);
  const basis = categoryBySubstance(p.substanceId).basisG;
  return {
    obs,
    regularPerBasis: pricePer(obs.regularPriceCents, active, basis),
    salePerBasis: obs.salePriceCents === null ? null : pricePer(obs.salePriceCents, active, basis),
    regularPerGram: pricePer(obs.regularPriceCents, active, 1),
    payableCents: obs.salePriceCents ?? obs.regularPriceCents,
    // Abgelaufene Aktion: kein gültiger Preis mehr (der Streichpreis ist kein belegter Normalpreis).
    payablePerBasis: obs.saleEndsAt && obs.saleEndsAt < asOf && obs.salePriceCents !== null ? null : pricePer(obs.salePriceCents ?? obs.regularPriceCents, active, basis),
    isSale: obs.salePriceCents !== null,
    saleExpired: Boolean(obs.saleEndsAt && obs.saleEndsAt < asOf),
    freshness: Boolean(obs.saleEndsAt && obs.saleEndsAt < asOf) ? 'erneut-pruefen' : priceFreshness(obs.observedAt, asOf),
  };
}

export function productView(d: Dataset, p: Product, asOf = today()): ProductView {
  const brand = d.brands.find((b) => b.id === p.brandId)!;
  const sorted = [...p.prices].sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  return {
    product: p,
    brand,
    activeG: packActive(p),
    latest: sorted[0] ? priceView(p, sorted[0], asOf) : null,
  };
}

export function publishedProducts(d: Dataset, substanceId: string, asOf = today()): ProductView[] {
  return published(d.products)
    .filter((p) => p.substanceId === substanceId)
    .map((p) => productView(d, p, asOf))
    .sort((a, b) => a.product.name.localeCompare(b.product.name, 'de'));
}

export function sourceMap(d: Dataset): Map<string, Source> {
  return new Map(d.sources.map((s) => [s.id, s]));
}

export function formatDate(iso: string): string {
  const [y, m, day] = iso.slice(0, 10).split('-');
  return `${day}.${m}.${y}`;
}

export function formatGrams(g: number | null): string {
  if (g === null) return 'nicht angegeben';
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(g)} g`;
}

/** Kurzhinweis zur Preisart für Balken und Tabellen. */
export function priceNote(v: PriceView | null | undefined): string | undefined {
  if (!v) return undefined;
  if (!v.isSale) return 'regulärer Preis';
  if (v.saleExpired) return 'Aktion laut Anbieter beendet – erneut prüfen';
  return v.obs.saleEndsAt ? `Aktionspreis bis ${formatDate(v.obs.saleEndsAt)}` : 'Aktionspreis, Ende nicht angegeben';
}
