// Prüft die gebaute Seite (dist/) ohne Browser. Läuft nach jedem Build.
// - jeder interne Link und jedes Anker-Ziel existiert
// - genau ein <h1>, eindeutiger <title>, Beschreibung vorhanden
// - Vorschau-Modus: jede Seite noindex; sitemap.xml leer
// - keine Seiten für Entwürfe; keine Test-Fixtures im Output
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadDataset } from '../src/lib/load.ts';
import { CATEGORIES } from '../src/lib/categories.ts';

const root = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const errors = [];
const indexing = process.env.PUBLIC_INDEXING === 'true' && Boolean(process.env.SITE_URL);

const urlOf = (f) => '/' + relative(root, f).replace(/index\.html$/, '').replace(/\.html$/, '');
const known = new Set(htmlFiles.map(urlOf));
const assets = new Set(files.filter((f) => !f.endsWith('.html')).map((f) => '/' + relative(root, f)));
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
  if (!/<meta property="og:title" content="[^"]+"/.test(html)) errors.push(`${u}: og:title fehlt`);
  if (!/<html lang="de"/.test(html)) errors.push(`${u}: lang="de" fehlt`);
  const robots = /<meta name="robots" content="([^"]+)"/.exec(html)?.[1];
  if (!indexing && !/noindex/.test(robots ?? '')) errors.push(`${u}: Vorschau ohne noindex (${robots})`);
  if (/TESTFIXTURE|example\.invalid/.test(html)) errors.push(`${u}: Test-Fixture im Output`);
  for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [pathAndQuery, hash] = href.split('#');
    let path = pathAndQuery.split('?')[0];
    if (path === '') {
      // Nur-Anker-Link auf derselben Seite
      if (hash && !ids.get(u)?.has(hash)) errors.push(`${u}: Anker fehlt #${hash}`);
      continue;
    }
    const target = path;
    const last = target.split('/').pop();
    if (last.includes('.')) {
      // Datei-Link (Asset, XML, PDF): muss im Output existieren
      if (!assets.has(target) && !known.has(target)) errors.push(`${u}: toter Datei-Link ${href}`);
      continue;
    }
    const normalized = target.endsWith('/') ? target : target + '/'; // trailingSlash: 'always' leitet um
    if (!known.has(normalized)) errors.push(`${u}: toter Link ${href}`);
    else if (hash && !ids.get(normalized)?.has(hash)) errors.push(`${u}: Anker fehlt ${href}`);
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
for (const d of data.duels.filter((x) => x.status === 'draft')) if (known.has(`/duell/${d.slug}/`)) errors.push(`Entwurf hat Seite: /duell/${d.slug}/`);
for (const f of readdirSync('content/wirkstoffe').filter((x) => x.endsWith('.md'))) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(`content/wirkstoffe/${f}`, 'utf8'))?.[1] ?? '';
  const status = /^status:\s*["']?(\w+)/m.exec(fm)?.[1];
  const sid = /^substanceId:\s*["']?([\w-]+)/m.exec(fm)?.[1];
  const cat = CATEGORIES.find((c) => c.substanceId === sid);
  if (cat && status !== 'published' && known.has(`/wirkstoffe/${cat.slug}/`)) errors.push(`Entwurfsartikel hat Seite: /wirkstoffe/${cat.slug}/`);
  if (cat && status === 'published' && !known.has(`/wirkstoffe/${cat.slug}/`)) errors.push(`Veröffentlichter Artikel ohne Seite: ${f}`);
}
if (!existsSync(join(root, '404.html'))) errors.push('404.html fehlt');

if (errors.length) { console.error(`Output-Prüfung fehlgeschlagen (${errors.length}):\n  - ` + errors.join('\n  - ')); process.exit(1); }
console.log(`Output-Prüfung ok: ${htmlFiles.length} Seiten, ${[...ids.values()].reduce((n, s) => n + s.size, 0)} Anker, Links/Überschriften/noindex/Entwürfe geprüft.`);
