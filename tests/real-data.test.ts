// Rechnet die veröffentlichten Kreatin-Preise unabhängig nach (Handrechnung
// im Kommentar), damit Datenänderungen bewusst bestätigt werden müssen.
import { describe, expect, it } from 'vitest';
import { loadDataset } from '../src/lib/load.ts';
import { productView, publishedProducts } from '../src/lib/view.ts';

const { data } = loadDataset();
const view = (id: string) => productView(data, data.products.find((p) => p.id === id)!, '2026-10-28');

describe('Kreatin-Preise (Stand 28.10.2026)', () => {
  it('ESN: 29,90 € / 500 g × 100 = 5,98 € pro 100 g', () => {
    const v = view('esn-ultrapure-kreatin-500g').latest!;
    expect(v.payableCents).toBe(2990);
    expect(v.payablePer100).toBe(598);
    expect(v.isSale).toBe(false);
  });

  it('Myprotein: Aktion 14,99 € → 3,00 €/100 g; Streichpreis 19,99 € → 4,00 €/100 g', () => {
    const v = view('myprotein-kreatin-monohydrat-500g').latest!;
    expect(v.payableCents).toBe(1499);
    expect(v.payablePer100).toBe(300); // 299,8 Cent gerundet
    expect(v.regularPer100).toBe(400); // 399,8 Cent gerundet
    expect(v.isSale).toBe(true);
  });

  it('Bulk: Aktion 15,99 € → 3,20 €/100 g; Streichpreis 24,99 € → 5,00 €/100 g', () => {
    const v = view('bulk-kreatin-monohydrat-500g').latest!;
    expect(v.payablePer100).toBe(320); // 319,8 gerundet
    expect(v.regularPer100).toBe(500); // 499,8 gerundet
  });

  it('Bodylab24: Angebot 13,50 € → 2,70 €/100 g; Streichpreis 19,99 € → 4,00 €/100 g', () => {
    const v = view('bodylab24-creatine-powder-500g').latest!;
    expect(v.payablePer100).toBe(270);
    expect(v.regularPer100).toBe(400); // 399,8 gerundet
  });

  it('nur veröffentlichte Produkte erscheinen im Vergleich', () => {
    const ids = publishedProducts(data, 'kreatin', '2026-10-28').map((v) => v.product.id);
    expect(ids).toEqual([
      'bodylab24-creatine-powder-500g',
      'bulk-kreatin-monohydrat-500g',
      'esn-ultrapure-kreatin-500g',
      'myprotein-kreatin-monohydrat-500g',
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
    expect(v.payablePer100).toBe(505);
    expect(v.regularPer100).toBe(773);
  });
  it('Bulk: 37,99 € / 710 g = 5,35 €; Streichpreis 43,99 € → 6,20 €', () => {
    const v = view('bulk-pure-whey-1kg').latest!;
    expect(v.payablePer100).toBe(535);
    expect(v.regularPer100).toBe(620);
  });
  it('Myprotein: 35,99 € / 648 g = 5,55 €; Streichpreis 44,99 € → 6,94 €', () => {
    const v = view('myprotein-impact-whey-900g').latest!;
    expect(v.payablePer100).toBe(555);
    expect(v.regularPer100).toBe(694);
  });
  it('ESN: 47,90 € / 681 g = 7,03 € (keine Aktion)', () => {
    const v = view('esn-designer-whey-908g').latest!;
    expect(v.payablePer100).toBe(703);
    expect(v.isSale).toBe(false);
  });
  it('Reihenfolge kippt je nach Preisbasis (Listenpreis vs. Aktion) – beides wird gezeigt', () => {
    const ids = ['bodylab24-whey-protein-1000g', 'bulk-pure-whey-1kg', 'myprotein-impact-whey-900g', 'esn-designer-whey-908g'];
    const byPayable = [...ids].sort((a, b) => view(a).latest!.payablePer100! - view(b).latest!.payablePer100!);
    const byRegular = [...ids].sort((a, b) => view(a).latest!.regularPer100! - view(b).latest!.regularPer100!);
    expect(byPayable[0]).toBe('bodylab24-whey-protein-1000g');
    expect(byRegular[0]).toBe('bulk-pure-whey-1kg');
  });
});
