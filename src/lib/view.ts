// Aufbereitung der Daten für die Seiten. Keine Bewertung, nur Rechnung.
import { activeAmount, pricePer, priceFreshness, type PriceFreshness } from './price.ts';
import type { Brand, Dataset, PriceObservation, Product, Source } from './schema.ts';
import { published } from './schema.ts';

export interface PriceView {
  obs: PriceObservation;
  regularPer100: number | null;
  salePer100: number | null;
  regularPerGram: number | null;
  /** Ohne Code zahlbarer Preis am Beobachtungstag (Aktion, sonst regulär). */
  payableCents: number;
  payablePer100: number | null;
  isSale: boolean;
  freshness: PriceFreshness;
}

export interface ProductView {
  product: Product;
  brand: Brand;
  activeG: number | null;
  /** Neueste Preisbeobachtung (nach observedAt). */
  latest: PriceView | null;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function priceView(p: Product, obs: PriceObservation, asOf = today()): PriceView {
  const active = activeAmount(p.netWeightG, p.activePer100g);
  return {
    obs,
    regularPer100: pricePer(obs.regularPriceCents, active, 100),
    salePer100: obs.salePriceCents === null ? null : pricePer(obs.salePriceCents, active, 100),
    regularPerGram: pricePer(obs.regularPriceCents, active, 1),
    payableCents: obs.salePriceCents ?? obs.regularPriceCents,
    payablePer100: pricePer(obs.salePriceCents ?? obs.regularPriceCents, active, 100),
    isSale: obs.salePriceCents !== null,
    freshness: priceFreshness(obs.observedAt, asOf),
  };
}

export function productView(d: Dataset, p: Product, asOf = today()): ProductView {
  const brand = d.brands.find((b) => b.id === p.brandId)!;
  const sorted = [...p.prices].sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  return {
    product: p,
    brand,
    activeG: activeAmount(p.netWeightG, p.activePer100g),
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
