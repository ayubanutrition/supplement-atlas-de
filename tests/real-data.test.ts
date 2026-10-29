// Rechnet die veröffentlichten Kreatin-Preise unabhängig nach (Handrechnung
// im Kommentar), damit Datenänderungen bewusst bestätigt werden müssen.
import { describe, expect, it } from 'vitest';
import { loadDataset } from '../src/lib/load.ts';
import { priceNote, productView, publishedProducts } from '../src/lib/view.ts';

const { data } = loadDataset();
const view = (id: string) => productView(data, data.products.find((p) => p.id === id)!, '2026-10-28');

describe('Kreatin-Preise (Stand 28.10.2026)', () => {
  it('ESN: 29,90 € / 500 g × 100 = 5,98 € pro 100 g', () => {
    const v = view('esn-ultrapure-kreatin-500g').latest!;
    expect(v.payableCents).toBe(2990);
    expect(v.payablePerBasis).toBe(598);
    expect(v.isSale).toBe(false);
  });

  it('Myprotein: Aktion 14,99 € → 3,00 €/100 g; Streichpreis 19,99 € → 4,00 €/100 g', () => {
    const v = view('myprotein-kreatin-monohydrat-500g').latest!;
    expect(v.payableCents).toBe(1499);
    expect(v.payablePerBasis).toBe(300); // 299,8 Cent gerundet
    expect(v.regularPerBasis).toBe(400); // 399,8 Cent gerundet
    expect(v.isSale).toBe(true);
  });

  it('Bulk: Aktion 15,99 € → 3,20 €/100 g; Streichpreis 24,99 € → 5,00 €/100 g', () => {
    const v = view('bulk-kreatin-monohydrat-500g').latest!;
    expect(v.payablePerBasis).toBe(320); // 319,8 gerundet
    expect(v.regularPerBasis).toBe(500); // 499,8 gerundet
  });

  it('Bodylab24: Angebot 13,50 € → 2,70 €/100 g; Streichpreis 19,99 € → 4,00 €/100 g', () => {
    const v = view('bodylab24-creatine-powder-500g').latest!;
    expect(v.payablePerBasis).toBe(270);
    expect(v.regularPerBasis).toBe(400); // 399,8 gerundet
  });

  it('nu3: Aktion 36,99 € → 7,40 €/100 g; UVP 38,99 € → 7,80 €/100 g', () => {
    const v = view('nu3-creatine-pulver-500g').latest!;
    expect(v.payablePerBasis).toBe(740); // 739,8 gerundet
    expect(v.regularPerBasis).toBe(780); // 779,8 gerundet
  });
  it('Natural Elements: 16,99 € / 500 g = 3,40 €/100 g', () => {
    expect(view('natural-elements-kreatin-monohydrat-500g').latest!.payablePerBasis).toBe(340);
  });
  it('Weider: 36,99 € / 600 g = 6,17 €/100 g (616,5 Cent, kaufmännisch gerundet)', () => {
    expect(view('weider-pure-creatine-600g').latest!.payablePerBasis).toBe(617);
  });

  it('nur veröffentlichte Produkte erscheinen im Vergleich', () => {
    const ids = publishedProducts(data, 'kreatin', '2026-10-28').map((v) => v.product.id);
    expect(ids).toEqual([
      'bodylab24-creatine-powder-500g',
      'bulk-kreatin-monohydrat-500g',
      'esn-ultrapure-kreatin-500g',
      'myprotein-kreatin-monohydrat-500g',
      'natural-elements-kreatin-monohydrat-500g',
      'nu3-creatine-pulver-500g',
      'weider-pure-creatine-600g',
    ]);
    expect(ids).not.toContain('more-nutrition-daily-creatine-250g');
  });

  it('Preise werden nach 30 Tagen als erneut zu prüfen markiert', () => {
    const p = data.products.find((x) => x.id === 'esn-ultrapure-kreatin-500g')!;
    expect(productView(data, p, '2026-11-27').latest!.freshness).toBe('aktuell');
    expect(productView(data, p, '2026-11-28').latest!.freshness).toBe('erneut-pruefen');
  });
});

describe('Whey-Preise pro 100 g Protein (Stand 29.10.2026)', () => {
  // Handrechnung: Preis ÷ (Packung × Eiweiß je 100 g ÷ 100) × 100
  it('Bodylab24: 37,90 € / (1000 g × 75 %) = 5,05 €; Streichpreis 57,99 € → 7,73 €', () => {
    const v = view('bodylab24-whey-protein-1000g').latest!;
    expect(v.payablePerBasis).toBe(505);
    expect(v.regularPerBasis).toBe(773);
  });
  it('Bulk: 37,99 € / 710 g = 5,35 €; Streichpreis 43,99 € → 6,20 €', () => {
    const v = view('bulk-pure-whey-1kg').latest!;
    expect(v.payablePerBasis).toBe(535);
    expect(v.regularPerBasis).toBe(620);
  });
  it('Myprotein: 35,99 € / 648 g = 5,55 €; Streichpreis 44,99 € → 6,94 €', () => {
    const v = view('myprotein-impact-whey-900g').latest!;
    expect(v.payablePerBasis).toBe(555);
    expect(v.regularPerBasis).toBe(694);
  });
  it('ESN: 47,90 € / 681 g = 7,03 € (keine Aktion)', () => {
    const v = view('esn-designer-whey-908g').latest!;
    expect(v.payablePerBasis).toBe(703);
    expect(v.isSale).toBe(false);
  });
  it('Optimum Nutrition: 49,99 € / (900 g × 79 %) = 7,03 € (keine Aktion)', () => {
    const v = view('optimum-nutrition-gold-standard-whey-900g').latest!;
    expect(v.payablePerBasis).toBe(703); // 4999 / 711 g
    expect(v.isSale).toBe(false);
  });
  it('Entwurf Scitec erscheint nicht im Vergleich', () => {
    const ids = publishedProducts(data, 'whey-protein', '2026-10-29').map((v) => v.product.id);
    expect(ids).toHaveLength(5);
    expect(ids).not.toContain('scitec-100-whey-professional-1kg');
  });
  it('Reihenfolge kippt je nach Preisbasis (Listenpreis vs. Aktion) – beides wird gezeigt', () => {
    const ids = ['bodylab24-whey-protein-1000g', 'bulk-pure-whey-1kg', 'myprotein-impact-whey-900g', 'esn-designer-whey-908g'];
    const byPayable = [...ids].sort((a, b) => view(a).latest!.payablePerBasis! - view(b).latest!.payablePerBasis!);
    const byRegular = [...ids].sort((a, b) => view(a).latest!.regularPerBasis! - view(b).latest!.regularPerBasis!);
    expect(byPayable[0]).toBe('bodylab24-whey-protein-1000g');
    expect(byRegular[0]).toBe('bulk-pure-whey-1kg');
  });
});

describe('Aktionsende', () => {
  it('nu3: Aktion bis 30.10.2026 – danach „beendet“ und erneut zu prüfen', () => {
    const p = data.products.find((x) => x.id === 'nu3-creatine-pulver-500g')!;
    const before = productView(data, p, '2026-10-30').latest!;
    expect(before.saleExpired).toBe(false);
    expect(priceNote(before)).toBe('Aktionspreis bis 30.10.2026');
    const after = productView(data, p, '2026-10-31').latest!;
    expect(after.saleExpired).toBe(true);
    expect(after.freshness).toBe('erneut-pruefen');
    expect(after.payablePerBasis).toBeNull(); // abgelaufene Aktion zählt nicht als gültiger Preis
    expect(priceNote(after)).toBe('Aktion laut Anbieter beendet – erneut prüfen');
  });
  it('ohne Enddatum: „Ende nicht angegeben“; ohne Aktion: „regulärer Preis“', () => {
    const noEnd = productView(data, data.products.find((x) => x.id === 'myprotein-kreatin-monohydrat-500g')!, '2026-10-30').latest!;
    expect(priceNote(noEnd)).toBe('Aktionspreis, Ende nicht angegeben');
    const reg = productView(data, data.products.find((x) => x.id === 'esn-ultrapure-kreatin-500g')!, '2026-10-30').latest!;
    expect(priceNote(reg)).toBe('regulärer Preis');
  });
});

describe('Omega-3-Preise pro 10 g EPA+DHA (Entwurf, Stand 29.10.2026)', () => {
  // Handrechnung: Kapseln × (EPA+DHA je Kapsel) = g; Preis ÷ g × 10
  it('ESN: 16,90 € / (60 × 700 mg = 42 g) × 10 = 4,02 €', () => {
    expect(view('esn-omega-3-60').latest!.payablePerBasis).toBe(402);
  });
  it('Bulk: Aktion 15,99 € / (90 × 550 mg = 49,5 g) × 10 = 3,23 €; Streichpreis 21,99 € → 4,44 €', () => {
    const v = view('bulk-omega-3-90').latest!;
    expect(v.payablePerBasis).toBe(323);
    expect(v.regularPerBasis).toBe(444);
  });
  it('Bodylab24: Angebot 9,90 € / (120 × 300 mg = 36 g) × 10 = 2,75 €; Streichpreis 15,99 € → 4,44 €', () => {
    const v = view('bodylab24-omega-3-120').latest!;
    expect(v.payablePerBasis).toBe(275);
    expect(v.regularPerBasis).toBe(444);
  });
  it('Natural Elements: 29,99 € / (365 × 300 mg = 109,5 g) × 10 = 2,74 €', () => {
    expect(view('natural-elements-omega-3-365').latest!.payablePerBasis).toBe(274);
  });
  it('Gesamtmenge EPA+DHA stimmt mit Kapselzahl × Dosis überein', () => {
    const g = (id: string) => data.products.find((p) => p.id === id)!.activeTotalG;
    expect(g('esn-omega-3-60')).toBeCloseTo(60 * 0.7);
    expect(g('bulk-omega-3-90')).toBeCloseTo(90 * 0.55);
    expect(g('bodylab24-omega-3-120')).toBeCloseTo(120 * 0.3);
    expect(g('natural-elements-omega-3-365')).toBeCloseTo(365 * 0.3);
  });
});

describe('Magnesium-Preise pro 10 g elementares Magnesium (Entwurf, Stand 29.10.2026)', () => {
  // Handrechnung: Stück × Magnesium je Stück = g; Preis ÷ g × 10
  it('natural elements: 18,99 € / (180 × 120 mg = 21,6 g) × 10 = 8,79 €', () => {
    expect(view('natural-elements-magnesiumcitrat-180').latest!.payablePerBasis).toBe(879);
  });
  it('Bodylab24: 16,90 € / (120 × 150 mg = 18 g) × 10 = 9,39 €', () => {
    expect(view('bodylab24-magnesium-citrat-120').latest!.payablePerBasis).toBe(939);
  });
  it('Bulk: Aktion 7,49 € / (60 × 100 mg = 6 g) × 10 = 12,48 €; Streichpreis 9,99 € → 16,65 €', () => {
    const v = view('bulk-magnesium-bisglycinat-60').latest!;
    expect(v.payablePerBasis).toBe(1248);
    expect(v.regularPerBasis).toBe(1665);
  });
  it('Weider: 16,99 € / (120 × 125 mg = 15 g) × 10 = 11,33 €', () => {
    expect(view('weider-magnesium-complex-120').latest!.payablePerBasis).toBe(1133);
  });
  it('Gesamtmenge Magnesium stimmt mit Stückzahl × Dosis überein', () => {
    const g = (id: string) => data.products.find((p) => p.id === id)!.activeTotalG;
    expect(g('natural-elements-magnesiumcitrat-180')).toBeCloseTo(180 * 0.12);
    expect(g('bodylab24-magnesium-citrat-120')).toBeCloseTo(120 * 0.15);
    expect(g('bulk-magnesium-bisglycinat-60')).toBeCloseTo(60 * 0.1);
    expect(g('weider-magnesium-complex-120')).toBeCloseTo(120 * 0.125);
  });
});
