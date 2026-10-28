// Gemeinsames Datenschema für Build, Validator und Tests.
// Regel: Jede veränderliche Angabe verweist auf eine Quelle mit Abrufdatum.
// "null" heißt "unbekannt / nicht angegeben" – nie "0".
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss YYYY-MM-DD sein');
const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/, 'ISO-Datum/Zeit erwartet');
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'ID: kleinbuchstaben-mit-bindestrich');
const status = z.enum(['draft', 'published']);

export const SourceSchema = z.object({
  id,
  kind: z.enum(['label', 'shop', 'impressum', 'study', 'regulation', 'authority', 'other']),
  title: z.string().min(3),
  publisher: z.string().min(2),
  url: z.url(),
  retrievedAt: isoDateTime,
  note: z.string().nullable().default(null),
});

export const SubstanceSchema = z.object({
  id,
  name: z.string(),
  synonyms: z.array(z.string()),
  forms: z.array(z.string()),
  status,
  updatedAt: isoDate,
});

export const BrandSchema = z.object({
  id,
  name: z.string(),
  legalProvider: z.object({ name: z.string(), address: z.string().nullable(), sourceId: id }),
  parentCompany: z.object({ name: z.string(), sourceId: id }).nullable(),
  countries: z.array(z.enum(['DE', 'AT', 'CH'])),
  status,
});

export const PriceObservationSchema = z.object({
  retailer: z.string(),
  country: z.enum(['DE', 'AT', 'CH']),
  currency: z.literal('EUR'),
  /** Regulärer bzw. vom Shop als Streich-/"War"-Preis angezeigter Preis. */
  regularPriceCents: z.number().int().nonnegative(),
  regularPriceNote: z.string().nullable(),
  salePriceCents: z.number().int().nonnegative().nullable(),
  saleConditions: z.string().nullable(),
  shipping: z.object({
    note: z.string(),
    costCents: z.number().int().nonnegative().nullable(),
    freeFromCents: z.number().int().nonnegative().nullable(),
    sourceId: id.nullable(),
  }),
  observedAt: isoDateTime,
  sourceId: id,
});

export const ProductSchema = z.object({
  id,
  brandId: id,
  substanceId: id,
  name: z.string(),
  variant: z.string(),
  netWeightG: z.number().positive(),
  /** Wie der Wirkstoff auf dem Etikett deklariert ist (Bezugsgröße für Preisvergleich). */
  activeDeclaredAs: z.string(),
  /** Gramm deklarierter Wirkstoff je 100 g Produkt; null = nicht angegeben. */
  activePer100g: z.number().min(0).max(100).nullable(),
  servingSizeG: z.number().positive().nullable(),
  activePerServingG: z.number().nonnegative().nullable(),
  /** Zutatenliste wörtlich; null = vom Anbieter nicht angegeben/nicht auffindbar. */
  ingredients: z.string().nullable(),
  rawMaterial: z.object({ name: z.string().nullable(), sourceId: id.nullable() }),
  allergenNote: z.string().nullable(),
  /** Nur wörtlich belegte Aussagen des Anbieters; keine eigene Prüfung. */
  labTesting: z.object({ statement: z.string().nullable(), sourceId: id.nullable() }),
  label: z.object({ sourceId: id, version: z.string(), retrievedAt: isoDateTime }),
  /** Widersprüche oder Lücken auf der Anbieterseite, sichtbar dokumentiert. */
  labelNotes: z.array(z.string()),
  prices: z.array(PriceObservationSchema),
  status,
  changelog: z.array(z.object({ date: isoDate, note: z.string() })).min(1),
});

export const ClaimSchema = z.object({
  id,
  status: z.enum(['zugelassen', 'abgelehnt']),
  wording: z.string(),
  conditions: z.string(),
  regulation: z.string(),
  sourceId: id,
  verified: z.boolean(),
});

export const EvidenceSchema = z.object({
  id,
  sourceId: id,
  topic: z.enum(['uebersicht', 'kraft', 'koerperzusammensetzung', 'aeltere', 'kognition', 'nieren', 'muskel', 'quellen', 'sicherheit']),
  title: z.string(),
  pmid: z.string().regex(/^\d+$/).nullable(),
  doi: z.string().nullable(),
  year: z.number().int(),
  design: z.string(),
  population: z.string(),
  intervention: z.string(),
  comparison: z.string().nullable(),
  outcome: z.string(),
  result: z.string(),
  limitations: z.string(),
  funding: z.string().nullable(),
  basis: z.enum(['abstract', 'fulltext']),
  /** Evidenzstufe als Text, bewusst keine Zahl. */
  certainty: z.enum(['hoch', 'mittel', 'niedrig', 'sehr niedrig', 'nicht bewertet']),
});

export const EvidenceFileSchema = z.object({
  substanceId: id,
  reviewedAt: isoDate,
  claims: z.array(ClaimSchema),
  evidence: z.array(EvidenceSchema),
});

export const DuelSchema = z.object({
  slug: id,
  a: id,
  b: id,
  question: z.string(),
  status,
});

export type Source = z.infer<typeof SourceSchema>;
export type Substance = z.infer<typeof SubstanceSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type PriceObservation = z.infer<typeof PriceObservationSchema>;
export type EvidenceFile = z.infer<typeof EvidenceFileSchema>;
export type Duel = z.infer<typeof DuelSchema>;

export interface Dataset {
  sources: Source[];
  substances: Substance[];
  brands: Brand[];
  products: Product[];
  evidence: EvidenceFile[];
  duels: Duel[];
}

/** Querprüfungen über alle Dateien. Gibt Fehlermeldungen zurück (leer = ok). */
export function crossCheck(d: Dataset): string[] {
  const errors: string[] = [];
  const dupes = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const i of ids) {
      if (seen.has(i)) errors.push(`${kind}: doppelte ID ${i}`);
      seen.add(i);
    }
  };
  dupes('source', d.sources.map((s) => s.id));
  dupes('product', d.products.map((p) => p.id));
  dupes('brand', d.brands.map((b) => b.id));
  dupes('duel', d.duels.map((x) => x.slug));

  const src = new Set(d.sources.map((s) => s.id));
  const needSrc = (where: string, sid: string | null) => {
    if (sid && !src.has(sid)) errors.push(`${where}: unbekannte Quelle "${sid}"`);
  };
  const brands = new Map(d.brands.map((b) => [b.id, b]));
  const substances = new Map(d.substances.map((s) => [s.id, s]));
  const products = new Map(d.products.map((p) => [p.id, p]));

  for (const b of d.brands) {
    needSrc(`brand ${b.id}`, b.legalProvider.sourceId);
    needSrc(`brand ${b.id}`, b.parentCompany?.sourceId ?? null);
  }
  for (const p of d.products) {
    const w = `product ${p.id}`;
    const brand = brands.get(p.brandId);
    if (!brand) errors.push(`${w}: unbekannte Marke ${p.brandId}`);
    if (!substances.has(p.substanceId)) errors.push(`${w}: unbekannter Wirkstoff ${p.substanceId}`);
    needSrc(w, p.label.sourceId);
    needSrc(w, p.rawMaterial.sourceId);
    needSrc(w, p.labTesting.sourceId);
    if (p.rawMaterial.name && !p.rawMaterial.sourceId) errors.push(`${w}: Rohstoffangabe ohne Quelle`);
    if (p.labTesting.statement && !p.labTesting.sourceId) errors.push(`${w}: Laboraussage ohne Quelle`);
    for (const pr of p.prices) {
      needSrc(`${w} Preis`, pr.sourceId);
      needSrc(`${w} Versand`, pr.shipping.sourceId);
      if (pr.salePriceCents !== null && !pr.saleConditions)
        errors.push(`${w}: Aktionspreis ohne Bedingungen`);
    }
    if (p.status === 'published') {
      if (brand && brand.status !== 'published') errors.push(`${w}: veröffentlicht, Marke aber Entwurf`);
      if (p.prices.length === 0) errors.push(`${w}: veröffentlicht ohne Preisbeobachtung`);
      if (p.activePer100g === null) errors.push(`${w}: veröffentlicht ohne Wirkstoffanteil`);
    }
  }
  for (const e of d.evidence) {
    if (!substances.has(e.substanceId)) errors.push(`evidence: unbekannter Wirkstoff ${e.substanceId}`);
    for (const c of e.claims) needSrc(`claim ${c.id}`, c.sourceId);
    for (const ev of e.evidence) needSrc(`evidence ${ev.id}`, ev.sourceId);
  }
  for (const du of d.duels) {
    for (const pid of [du.a, du.b]) {
      const p = products.get(pid);
      if (!p) errors.push(`duel ${du.slug}: unbekanntes Produkt ${pid}`);
      else if (du.status === 'published' && p.status !== 'published')
        errors.push(`duel ${du.slug}: veröffentlicht, ${pid} aber Entwurf`);
    }
    if (du.a === du.b) errors.push(`duel ${du.slug}: Produkt gegen sich selbst`);
    if (products.get(du.a)?.substanceId !== products.get(du.b)?.substanceId)
      errors.push(`duel ${du.slug}: unterschiedliche Kategorien`);
  }
  return errors;
}

/** Nur veröffentlichte Einträge rendern. */
export function published<T extends { status: 'draft' | 'published' }>(items: T[]): T[] {
  return items.filter((i) => i.status === 'published');
}
