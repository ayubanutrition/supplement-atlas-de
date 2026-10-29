// Erzeugt docs/PRUEFPAKET.md: alles, was eine fachliche Prüfung je Artikel abhaken muss.
// Wird aus den Daten erzeugt, damit es nie vom Stand der Seite abweicht. Aufruf: pnpm review-pack
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { loadDataset } from '../src/lib/load.ts';
import { CATEGORIES } from '../src/lib/categories.ts';
import { formatEur, pricePer } from '../src/lib/price.ts';
import { packActive } from '../src/lib/view.ts';

const { data, errors } = loadDataset();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const src = new Map(data.sources.map((s) => [s.id, s]));
const link = (id) => { const s = src.get(id); return s ? `[${s.title}](${s.url}) (abgerufen ${s.retrievedAt.slice(0, 10)})` : `?${id}`; };
const out = [];
out.push('# Prüfpaket für die fachliche Prüfung', '',
  `Automatisch erzeugt (\`pnpm review-pack\`) am ${new Date().toISOString().slice(0, 10)}. Dient dazu, jede Aussage der Artikel gegen Quelle und Zahlen abzuhaken.`, '',
  '**Wichtig für Prüfende:** Der Text wurde mit KI-Unterstützung erstellt. Studienergebnisse stammen aus den Zusammenfassungen (Abstracts), nicht aus Volltexten. Eine eigene Bewertung der Evidenzsicherheit (z. B. GRADE) wurde nicht vorgenommen. Rechtliche Wortlaute stammen aus den Ursprungsfassungen der Verordnungen im Amtsblatt; konsolidierte Fassungen sind nicht abgeglichen.', '',
  '## Prüfablauf', '',
  '1. Artikeltext Satz für Satz lesen; jede Tatsachenaussage muss in Abschnitt B (EU-Aussagen) oder C (Studien) oder D (Behörden) belegt sein.',
  '2. Medizinische Aussagen auf Zulässigkeit prüfen (Health-Claims-Verordnung): keine Heil- oder Wirkversprechen jenseits der zugelassenen Aussagen.',
  '3. Sicherheitshinweise (Nieren, Kinder/Jugendliche) auf Vollständigkeit prüfen.',
  '4. Ergebnis festhalten: Name, Qualifikation, Datum → `reviewedBy` im Artikel (z. B. „Dr. X, Ernährungswissenschaftler/in, 2026-11-01“). Nur nach Freigabe eintragen; Änderungswünsche als `status: draft` zurückhalten.', '');

for (const f of readdirSync('content/wirkstoffe').filter((x) => x.endsWith('.md'))) {
  const raw = readFileSync(`content/wirkstoffe/${f}`, 'utf8');
  const [, fm, body] = raw.split(/^---$/m);
  const sid = /^substanceId:\s*(.+)$/m.exec(fm)[1].trim();
  const cat = CATEGORIES.find((c) => c.substanceId === sid);
  const ev = data.evidence.find((e) => e.substanceId === sid);
  out.push(`---`, '', `# ${cat.name}`, '', '## A. Artikeltext (zu prüfen)', '', `Kurzantwort: ${/^summary:\s*"(.*)"$/m.exec(fm)?.[1] ?? ''}`, '', body.trim().replace(/^## /gm, '### '), '');
  out.push('## B. EU-Aussagen', '', '| Status | Wortlaut | Bedingungen | Rechtsgrundlage | Quelle |', '|---|---|---|---|---|');
  for (const c of ev.claims) out.push(`| ${c.status} | ${c.wording} | ${c.conditions} | ${c.regulation} | ${link(c.sourceId)} |`);
  out.push('', '## C. Studien', '');
  for (const e of ev.evidence) out.push(`- **${e.title}** (${e.year}, ${e.design}) – PMID [${e.pmid}](https://pubmed.ncbi.nlm.nih.gov/${e.pmid}/)${e.doi ? `, DOI ${e.doi}` : ''}. Population: ${e.population}. Ergebnis: ${e.result} Grenzen: ${e.limitations} Finanzierung/Interessen: ${e.funding ?? 'nicht geprüft'}. Grundlage: ${e.basis}.`);
  out.push('', '## D. Behörden und weitere Quellen im Text', '');
  const extra = /^extraSources:\s*\[(.*)\]/m.exec(fm)?.[1].split(',').map((x) => x.replace(/["\s]/g, '')).filter(Boolean) ?? [];
  for (const id of extra) out.push(`- ${link(id)}${src.get(id)?.note ? ` – ${src.get(id).note}` : ''}`);
  out.push('', '## E. Preisvergleich (Zahlen nachrechnen)', '', `| Produkt | Packung | Wirkstoff (je 100 g bzw. je Packung) | Preis (ohne Code) | Pro ${cat.basisLabel} Wirkstoff | Streichpreis → pro ${cat.basisLabel} | Stand |`, '|---|---|---|---|---|---|---|');
  for (const p of data.products.filter((x) => x.substanceId === sid && x.status === 'published')) {
    const pr = [...p.prices].sort((a, b) => b.observedAt.localeCompare(a.observedAt))[0];
    const act = packActive(p);
    const pay = pr.salePriceCents ?? pr.regularPriceCents;
    out.push(`| ${p.name} (${p.variant}) | ${p.netWeightG ?? '–'} g | ${p.activePer100g ?? (p.activeTotalG ?? '–')} g | ${formatEur(pay)}${pr.salePriceCents !== null ? ' (Aktion)' : ''} | ${formatEur(pricePer(pay, act, cat.basisG))} | ${formatEur(pr.regularPriceCents)} → ${formatEur(pricePer(pr.regularPriceCents, act, cat.basisG))} | ${pr.observedAt.slice(0, 10)} |`);
  }
  out.push('');
}
writeFileSync('docs/PRUEFPAKET.md', out.join('\n') + '\n');
console.log(`docs/PRUEFPAKET.md geschrieben (${out.length} Zeilen)`);
