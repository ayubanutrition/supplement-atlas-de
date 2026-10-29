// Listet alle Punkte, die vor einer öffentlichen Veröffentlichung noch fehlen.
// Exit-Code 1, solange Blocker offen sind. Aufruf: pnpm release-check
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { loadDataset } from '../src/lib/load.ts';
import { loadOperator, missingOperatorFields } from '../src/lib/operator.ts';
import { priceFreshness } from '../src/lib/price.ts';

const blockers = [];
const infos = [];
const today = new Date().toISOString().slice(0, 10);

const { data, errors } = loadDataset();
if (errors.length) blockers.push(`Datenprüfung fehlgeschlagen (${errors.length} Fehler) – pnpm validate`);

for (const f of readdirSync('content/wirkstoffe').filter((x) => x.endsWith('.md'))) {
  const fm = readFileSync(`content/wirkstoffe/${f}`, 'utf8').split('---')[1] ?? '';
  const status = /^status:\s*(\w+)/m.exec(fm)?.[1];
  const reviewed = /^reviewedBy:\s*(.+)$/m.exec(fm)?.[1]?.trim();
  if (status === 'published' && (!reviewed || reviewed === 'null')) blockers.push(`Fachliche Prüfung fehlt: content/wirkstoffe/${f} (reviewedBy)`);
}

const op = loadOperator();
const miss = missingOperatorFields(op);
if (miss.length) blockers.push(`Impressum unvollständig (data/operator.json): ${miss.join(', ')}`);
if (!op.privacyReviewedBy) blockers.push('Datenschutzerklärung nicht rechtlich geprüft (data/operator.json: privacyReviewedBy)');

if (!process.env.SITE_URL) blockers.push('SITE_URL nicht gesetzt (Domain steht noch nicht fest)');
if (process.env.PUBLIC_INDEXING !== 'true') infos.push('PUBLIC_INDEXING ist nicht „true“ (Vorschau-Modus, gewollt bis zur Freigabe)');
if (!existsSync('wrangler.jsonc')) blockers.push('wrangler.jsonc fehlt');

const stale = data.products.filter((p) => p.status === 'published').flatMap((p) => p.prices.filter((x) => priceFreshness(x.observedAt, today) === 'erneut-pruefen').map(() => p.id));
if (stale.length) blockers.push(`Preise älter als 30 Tage (neu erfassen): ${[...new Set(stale)].join(', ')}`);
const expired = data.products.filter((p) => p.status === 'published').flatMap((p) => p.prices.filter((x) => x.saleEndsAt && x.saleEndsAt < today).map(() => p.id));
if (expired.length) blockers.push(`Aktionen laut Anbieter beendet (Preis neu erfassen): ${[...new Set(expired)].join(', ')}`);
const soon = data.products.filter((p) => p.status === 'published').flatMap((p) => p.prices.filter((x) => x.saleEndsAt && x.saleEndsAt >= today && x.saleEndsAt <= new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)).map((x) => `${p.id} (bis ${x.saleEndsAt})`));
if (soon.length) infos.push(`Aktionen laufen innerhalb von 7 Tagen aus: ${soon.join(', ')}`);
const drafts = data.products.filter((p) => p.status === 'draft').map((p) => p.id);
if (drafts.length) infos.push(`Produkte im Entwurf (werden nicht gezeigt): ${drafts.join(', ')}`);
const untested = data.evidence.flatMap((e) => e.evidence).filter((x) => x.certainty === 'nicht bewertet').length;
if (untested) infos.push(`${untested} Studien ohne eigene Bewertung der Evidenzsicherheit (kein Blocker, auf den Seiten gekennzeichnet)`);

console.log(blockers.length ? `OFFENE BLOCKER (${blockers.length}):` : 'Keine Blocker.');
blockers.forEach((b) => console.log('  ✗ ' + b));
infos.forEach((i) => console.log('  ℹ ' + i));
process.exit(blockers.length ? 1 : 0);
