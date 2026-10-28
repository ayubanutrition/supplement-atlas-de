// Sitemap nur mit indexierbaren, kanonischen Seiten – und nur nach Freigabe.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getDataset } from '../lib/load.ts';
import { published } from '../lib/schema.ts';
import { CATEGORIES } from '../lib/categories.ts';
import { publishedProducts } from '../lib/view.ts';

export const GET: APIRoute = async ({ site }) => {
  const indexing = Boolean(site) && process.env.PUBLIC_INDEXING === 'true';
  const d = getDataset();
  const paths = ['/', '/methodik/', '/ueber-uns/', '/rechner/', '/rechner/kreatinpreis/', '/rechner/proteinpreis/'];
  const articles = await getCollection('wirkstoffe', (e) => e.data.status === 'published');
  for (const a of articles) paths.push(`/wirkstoffe/${CATEGORIES.find((c) => c.substanceId === a.data.substanceId)!.slug}/`);
  for (const c of CATEGORIES) if (publishedProducts(d, c.substanceId).length) paths.push(`/vergleich/${c.slug}/`);
  for (const p of published(d.products)) paths.push(`/produkte/${p.id}/`);
  for (const x of published(d.duels)) paths.push(`/duell/${x.slug}/`);
  const urls = indexing ? [...new Set(paths)].sort().map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`) : [];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
