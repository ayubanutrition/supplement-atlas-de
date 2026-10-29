// Prüft die gebaute Seite (dist/) ohne Browser. Läuft nach jedem Build.
// - jeder interne Link und jedes Anker-Ziel existiert
// - genau ein <h1>, eindeutiger <title>, Beschreibung vorhanden
// - Vorschau-Modus: jede Seite noindex; sitemap.xml leer
// - keine Seiten für Entwürfe; keine Test-Fixtures im Output
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadDataset } from '../src/lib/load.ts';

const root = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const errors = [];
const indexing = process.env.PUBLIC_INDEXING === 'true' && Boolean(process.env.SITE_URL);

const urlOf = (f) => '/' + relative(root, f).replace(/index\.html$/, '').replace(/\.html$/, '');
const known = new Set(htmlFiles.map(urlOf));
const ids = new Map(htmlFiles.map((f) => [urlOf(f), new Set([...readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const titles = new Map();

for (const f of htmlFiles) {
  const u = urlOf(f);
  const html = readFileSync(f, 'utf8');
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) errors.push(`${u}: ${h1} <h1>`);
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  if (!title) errors.push(`${u}: kein <title>`);
  else if (titles.has(title)) errors.push(`${u}: Titel doppelt mit ${titles.get(title)}`);
  else titles.set(title, u);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html) ) errors.push(`${u}: Beschreibung fehlt/zu kurz`);
  if (!/<html lang="de"/.test(html)) errors.push(`${u}: lang="de" fehlt`);
  const robots = /<meta name="robots" content="([^"]+)"/.exec(html)?.[1];
  if (!indexing && !/noindex/.test(robots ?? '')) errors.push(`${u}: Vorschau ohne noindex (${robots})`);
  if (/TESTFIXTURE|example\.invalid/.test(html)) errors.push(`${u}: Test-Fixture im Output`);
  for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [path, hash] = href.split('#');
    const target = path === '' ? u : path;
    if (!known.has(target)) errors.push(`${u}: toter Link ${href}`);
    else if (hash && !ids.get(target)?.has(hash)) errors.push(`${u}: Anker fehlt ${href}`);
  }
}

if (!indexing) {
  const sm = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  if (/<loc>/.test(sm)) errors.push('sitemap.xml enthält URLs im Vorschau-Modus');
  if (!/Disallow: \//.test(readFileSync(join(root, 'robots.txt'), 'utf8'))) errors.push('robots.txt sperrt nicht im Vorschau-Modus');
}

const { data } = loadDataset();
for (const p of data.products.filter((x) => x.status === 'draft')) if (known.has(`/produkte/${p.id}/`)) errors.push(`Entwurf hat Seite: /produkte/${p.id}/`);
for (const p of data.products.filter((x) => x.status === 'published')) if (!known.has(`/produkte/${p.id}/`)) errors.push(`Veröffentlichtes Produkt ohne Seite: ${p.id}`);
if (!existsSync(join(root, '404.html'))) errors.push('404.html fehlt');

if (errors.length) { console.error(`Output-Prüfung fehlgeschlagen (${errors.length}):\n  - ` + errors.join('\n  - ')); process.exit(1); }
console.log(`Output-Prüfung ok: ${htmlFiles.length} Seiten, ${[...ids.values()].reduce((n, s) => n + s.size, 0)} Anker, Links/Überschriften/noindex/Entwürfe geprüft.`);
