// Prüft die Veröffentlichungsregeln mit klar gekennzeichneten Test-Fixtures.
// Diese Objekte werden nie gerendert (sie liegen nicht in /data).
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDataset } from '../src/lib/load.ts';
import { crossCheck, published, type Dataset, type Product } from '../src/lib/schema.ts';

const FIXTURE_URL = 'https://example.invalid/';

function product(over: Partial<Product> = {}): Product {
  return {
    id: 'fixture-a',
    brandId: 'fixture-brand',
    substanceId: 'kreatin',
    name: 'TESTFIXTURE Kreatin A',
    variant: 'neutral, 500 g',
    netWeightG: 500,
    activeDeclaredAs: 'Kreatin-Monohydrat',
    activePer100g: 100,
    activeTotalG: null,
    servingSizeG: 3,
    activePerServingG: 3,
    ingredients: 'Kreatin-Monohydrat',
    rawMaterial: { name: null, sourceId: null },
    allergenNote: null,
    labTesting: { statement: null, sourceId: null },
    label: { sourceId: 'fx-label', version: 'v1', retrievedAt: '2026-10-28' },
    labelNotes: [],
    prices: [
      {
        retailer: 'Fixture-Shop',
        country: 'DE',
        currency: 'EUR',
        regularPriceCents: 2000,
        regularPriceNote: null,
        salePriceCents: null,
        saleConditions: null,
        shipping: { note: 'unbekannt', costCents: null, freeFromCents: null, sourceId: null },
        observedAt: '2026-10-28',
        sourceId: 'fx-label',
      },
    ],
    status: 'published',
    changelog: [{ date: '2026-10-28', note: 'Fixture' }],
    ...over,
  };
}

function dataset(over: Partial<Dataset> = {}): Dataset {
  return {
    sources: [
      { id: 'fx-label', kind: 'label', title: 'TESTFIXTURE Etikett', publisher: 'Fixture', url: FIXTURE_URL, retrievedAt: '2026-10-28', note: null },
    ],
    substances: [{ id: 'kreatin', name: 'Kreatin', synonyms: [], forms: [], status: 'published', updatedAt: '2026-10-28' }],
    brands: [
      {
        id: 'fixture-brand',
        name: 'TESTFIXTURE Marke',
        legalProvider: { name: 'Fixture GmbH', address: null, sourceId: 'fx-label' },
        parentCompany: null,
        countries: ['DE'],
        status: 'published',
      },
    ],
    products: [product(), product({ id: 'fixture-b', name: 'TESTFIXTURE Kreatin B' })],
    evidence: [],
    duels: [{ slug: 'fixture-a-vs-fixture-b', a: 'fixture-a', b: 'fixture-b', question: 'Test', status: 'published' }],
    ...over,
  };
}

describe('crossCheck', () => {
  it('akzeptiert einen konsistenten Datensatz', () => {
    expect(crossCheck(dataset())).toEqual([]);
  });

  it('verlangt existierende Quellen', () => {
    const d = dataset({ products: [product({ label: { sourceId: 'gibt-es-nicht', version: 'v1', retrievedAt: '2026-10-28' } })], duels: [] });
    expect(crossCheck(d).join()).toMatch(/unbekannte Quelle "gibt-es-nicht"/);
  });

  it('blockiert Veröffentlichung ohne Preisbeobachtung', () => {
    const d = dataset({ products: [product({ prices: [] })], duels: [] });
    expect(crossCheck(d).join()).toMatch(/ohne Preisbeobachtung/);
  });

  it('blockiert Veröffentlichung ohne bekannte Wirkstoffmenge', () => {
    const d = dataset({ products: [product({ activePer100g: null })], duels: [] });
    expect(crossCheck(d).join()).toMatch(/ohne Wirkstoffmenge/);
  });

  it('akzeptiert Kapselprodukte mit Gesamtmenge statt Füllmenge/Anteil', () => {
    const d = dataset({ products: [product({ netWeightG: null, activePer100g: null, activeTotalG: 54 })], duels: [] });
    expect(crossCheck(d)).toEqual([]);
  });

  it('erlaubt Entwürfe mit unvollständigen Daten', () => {
    const d = dataset({ products: [product({ status: 'draft', prices: [], activePer100g: null })], duels: [] });
    expect(crossCheck(d)).toEqual([]);
  });

  it('verbietet veröffentlichte Duelle mit Entwurfsprodukten', () => {
    const d = dataset({ products: [product(), product({ id: 'fixture-b', status: 'draft' })] });
    expect(crossCheck(d).join()).toMatch(/fixture-b aber Entwurf/);
  });

  it('verlangt Bedingungen bei Aktionspreisen', () => {
    const p = product();
    p.prices[0] = { ...p.prices[0], salePriceCents: 1500, saleConditions: null };
    expect(crossCheck(dataset({ products: [p], duels: [] })).join()).toMatch(/Aktionspreis ohne Bedingungen/);
  });

  it('verlangt Quelle für Laboraussagen', () => {
    const d = dataset({ products: [product({ labTesting: { statement: 'geprüft', sourceId: null } })], duels: [] });
    expect(crossCheck(d).join()).toMatch(/Laboraussage ohne Quelle/);
  });
});

describe('published', () => {
  it('filtert Entwürfe heraus', () => {
    const items = [product(), product({ id: 'x', status: 'draft' })];
    expect(published(items).map((p) => p.id)).toEqual(['fixture-a']);
  });
});

describe('loadDataset', () => {
  it('meldet Schemafehler mit Dateipfad', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-'));
    mkdirSync(join(root, 'products'));
    writeFileSync(join(root, 'products', 'kaputt.json'), JSON.stringify({ ...product(), label: { sourceId: 'x', version: 'v1', retrievedAt: '28.10.2026' } }));
    const { errors } = loadDataset(root);
    expect(errors.join()).toMatch(/kaputt\.json label\.retrievedAt/);
  });

  it('meldet ungültiges JSON mit Dateipfad statt abzustürzen', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-'));
    mkdirSync(join(root, 'products'));
    writeFileSync(join(root, 'products', 'komma.json'), '{ "id": "x", }');
    writeFileSync(join(root, 'sources.json'), '[]');
    const { errors } = loadDataset(root);
    expect(errors.join()).toMatch(/komma\.json: ungültiges JSON/);
  });

  it('die echten Projektdaten sind gültig', () => {
    const { errors } = loadDataset();
    expect(errors).toEqual([]);
  });
});

describe('operator', () => {
  it('meldet fehlende Pflichtangaben und ungültige E-Mail', async () => {
    const { missingOperatorFields } = await import('../src/lib/operator.ts');
    const empty = { name: null, legalForm: null, street: null, postalCodeCity: null, email: null, phone: null, representedBy: null, register: null, vatId: null, responsibleForContent: null, privacyReviewedBy: null };
    expect(missingOperatorFields(empty)).toEqual(['name', 'street', 'postalCodeCity', 'email', 'responsibleForContent']);
    const bad = { ...empty, name: 'X', street: 'S', postalCodeCity: 'P', responsibleForContent: 'Y', email: 'kein-mail' };
    expect(missingOperatorFields(bad)).toEqual(['email (ungültig)']);
    expect(missingOperatorFields({ ...bad, email: 'a@b.de' })).toEqual([]);
  });
});
