// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL erst setzen, wenn die Domain feststeht. Ohne SITE_URL:
// keine Canonicals/Sitemap, und jede Seite trägt noindex (Vorschau).
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  output: 'static',
  devToolbar: { enabled: false },
});
