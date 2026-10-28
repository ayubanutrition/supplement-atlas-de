import { describe, expect, it } from 'vitest';
import {
  activeAmount,
  daysBetween,
  eurToCents,
  formatEur,
  parseDecimal,
  pricePer,
  priceFreshness,
} from '../src/lib/price.ts';

describe('parseDecimal', () => {
  it('liest deutsche und englische Dezimalschreibweise', () => {
    expect(parseDecimal('12,99')).toBe(12.99);
    expect(parseDecimal('12.99')).toBe(12.99);
    expect(parseDecimal('1.299,50')).toBe(1299.5);
    expect(parseDecimal('1,299.50')).toBe(1299.5);
    expect(parseDecimal(' 24,90 € ')).toBe(24.9);
    expect(parseDecimal('500 g')).toBe(500);
  });
  it('liefert null für leere oder ungültige Eingaben', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('   ')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('1,2,3')).toBeNull();
    expect(parseDecimal(null)).toBeNull();
    expect(parseDecimal(undefined)).toBeNull();
    expect(parseDecimal(Number.NaN)).toBeNull();
  });
  it('behandelt 0 als echten Wert, nicht als fehlend', () => {
    expect(parseDecimal('0')).toBe(0);
    expect(parseDecimal('0,00')).toBe(0);
  });
});

describe('eurToCents', () => {
  it('rundet kaufmännisch ohne Gleitkommafehler', () => {
    expect(eurToCents(19.99)).toBe(1999);
    expect(eurToCents(1.005)).toBe(101);
    expect(eurToCents(0.1 + 0.2)).toBe(30);
  });
});

describe('pricePer', () => {
  it('berechnet Preis pro 100 g', () => {
    // 24,90 € für 500 g → 4,98 € pro 100 g
    expect(pricePer(2490, 500, 100)).toBe(498);
  });
  it('berechnet Preis pro Gramm und rundet auf Cent', () => {
    // 24,90 € / 500 g = 0,0498 €/g → 5 Cent
    expect(pricePer(2490, 500, 1)).toBe(5);
    // 19,99 € / 300 g × 100 = 6,663… € → 666 Cent
    expect(pricePer(1999, 300, 100)).toBe(666);
  });
  it('liefert null bei fehlender oder ungültiger Menge', () => {
    expect(pricePer(2490, 0)).toBeNull();
    expect(pricePer(2490, -5)).toBeNull();
    expect(pricePer(2490, null)).toBeNull();
    expect(pricePer(null, 500)).toBeNull();
    expect(pricePer(-1, 500)).toBeNull();
    expect(pricePer(2490, Number.NaN)).toBeNull();
  });
  it('erlaubt einen Preis von 0 (echter Wert, kein Fehlwert)', () => {
    expect(pricePer(0, 500)).toBe(0);
  });
});

describe('activeAmount', () => {
  it('berechnet enthaltene Wirkstoffmenge', () => {
    expect(activeAmount(500, 100)).toBe(500);
    expect(activeAmount(500, 99.5)).toBe(497.5);
  });
  it('lehnt unplausible Werte ab', () => {
    expect(activeAmount(500, 101)).toBeNull();
    expect(activeAmount(0, 100)).toBeNull();
    expect(activeAmount(null, 100)).toBeNull();
    expect(activeAmount(500, null)).toBeNull();
  });
});

describe('formatEur', () => {
  it('formatiert deutsch', () => {
    expect(formatEur(498).replace(/ /g, ' ')).toBe('4,98 €');
    expect(formatEur(null)).toBe('nicht berechenbar');
  });
});

describe('priceFreshness', () => {
  it('markiert Preise nach 30 Tagen als erneut zu prüfen', () => {
    expect(daysBetween('2026-10-01', '2026-10-31')).toBe(30);
    expect(priceFreshness('2026-10-01', '2026-10-31')).toBe('aktuell');
    expect(priceFreshness('2026-10-01', '2026-11-01')).toBe('erneut-pruefen');
    expect(priceFreshness('2026-10-28T14:00:00Z', '2026-10-28')).toBe('aktuell');
  });
});
