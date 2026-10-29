// Interne Kalibrierung der Rubrik-ENTWURFS (docs/RUBRIK-ENTWURF.md) auf den echten Daten.
// Erzeugt KEINE öffentlichen Noten. Aufruf: node scripts/rubric-sim.mjs [substanceId]
import { loadDataset } from '../src/lib/load.ts';
import { productView, publishedProducts } from '../src/lib/view.ts';

const sid = process.argv[2] || 'kreatin';
const { data } = loadDataset();
const views = publishedProducts(data, sid);

// Achse A: Dokumentierte Zusammensetzung (je 2,5 Punkte), −1 je dokumentiertem Widerspruch
const A = (p) => {
  const pts = (p.ingredients ? 2.5 : 0) + (p.activePerServingG !== null ? 2.5 : 0) + (p.allergenNote ? 2.5 : 0) + (p.rawMaterial.name ? 2.5 : 0);
  const contradictions = p.labelNotes.filter((n) => /Widerspruch|widerspricht|wirbt/i.test(n)).length;
  return Math.max(1, Math.min(10, +(1 + (pts / 10) * 9 - contradictions).toFixed(1)));
};
// Achse B: Nachvollziehbarkeit von Prüfunterlagen – ohne geöffnete Unterlagen höchstens 7
const B = (p) => {
  const s = p.labTesting.statement;
  if (!s) return 1;
  if (/DAkkS|akkreditiert|SGS|Kölner Liste|Informed/i.test(s)) return 7;
  return 4;
};
// Achse C: Preis relativ in der Stichprobe (10 = günstigster, 1 = teuerster), je Preisbasis
const rel = (vals) => {
  const lo = Math.min(...vals), hi = Math.max(...vals);
  return vals.map((v) => (hi === lo ? 5.5 : +(10 - 9 * ((v - lo) / (hi - lo))).toFixed(1)));
};
const pay = views.map((v) => v.latest.payablePerBasis);
const reg = views.map((v) => v.latest.regularPerBasis);
const cPay = rel(pay), cReg = rel(reg);
const rank = (xs) => xs.map((x) => 1 + xs.filter((y) => y < x).length);
const rPay = rank(pay), rReg = rank(reg);

console.log(`Kalibrierung ${sid}, n=${views.length} (nur intern, keine Veröffentlichung)\n`);
console.log('Produkt'.padEnd(46), 'A'.padStart(4), 'B'.padStart(4), 'C(Akt.)'.padStart(8), 'C(Liste)'.padStart(9), 'Rang Akt.→Liste');
views.forEach((v, i) => console.log(v.product.name.padEnd(46).slice(0, 46), String(A(v.product)).padStart(4), String(B(v.product)).padStart(4), String(cPay[i]).padStart(8), String(cReg[i]).padStart(9), `   ${rPay[i]} → ${rReg[i]}`));
const spread = (xs) => +(Math.max(...xs) - Math.min(...xs)).toFixed(1);
const As = views.map((v) => A(v.product)), Bs = views.map((v) => B(v.product));
console.log(`\nSpannweite: A=${spread(As)}  B=${spread(Bs)}  C(Aktion)=${spread(cPay)}  C(Liste)=${spread(cReg)}`);
const moved = views.filter((_, i) => rPay[i] !== rReg[i]).length;
console.log(`Produkte mit anderem Preisrang je nach Basis: ${moved} von ${views.length}`);
