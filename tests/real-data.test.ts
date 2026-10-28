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

  it('nur veröffentlichte Produkte erscheinen im Vergleich', () => {
    const ids = publishedProducts(data, 'kreatin', '2026-10-28').map((v) => v.product.id);
    expect(ids).toEqual(['esn-ultrapure-kreatin-500g', 'myprotein-kreatin-monohydrat-500g']);
  });

  it('Preise werden nach 30 Tagen als erneut zu prüfen markiert', () => {
    const p = data.products[0];
    expect(productView(data, p, '2026-11-27').latest!.freshness).toBe('aktuell');
    expect(productView(data, p, '2026-11-28').latest!.freshness).toBe('erneut-pruefen');
  });
});
