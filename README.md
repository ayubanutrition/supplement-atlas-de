# Supplement Atlas DACH

Deutschsprachige Vergleichsplattform für Nahrungsergänzungsmittel, getrennt von ayubanutrition.de. Status: Vorschau, nicht veröffentlicht.

Strategie: [CLAUDE_MASTER_HANDOFF.md](CLAUDE_MASTER_HANDOFF.md) · Aktueller Stand: [docs/STATUS.md](docs/STATUS.md)

## Befehle (Node ≥ 22, pnpm)

| Befehl | Zweck |
|---|---|
| `pnpm install` | Abhängigkeiten installieren (Versionen exakt gepinnt) |
| `pnpm validate` | Daten in `data/` gegen Schema und Querverweise prüfen |
| `pnpm test` | Rechenlogik, Veröffentlichungsregeln, echte Preise nachrechnen |
| `pnpm build` | validate + test + statischer Build nach `dist/` + Output-Prüfung (`scripts/check-dist.mjs`: Links, Anker, h1, Titel, noindex, keine Entwurfsseiten) |
| `pnpm preview` | gebaute Seite lokal ausliefern |
| `node scripts/serve-dist.cjs [port]` | `dist/` mit den Headern aus `public/_headers` ausliefern (wie Cloudflare) |
| `node scripts/perf-sample.cjs [url]` | Mobil-Stichprobe: FCP, LCP, CLS, Transfergröße (gedrosselt) |
| `node scripts/rubric-sim.mjs [kreatin\|whey-protein]` | interne Kalibrierung des Rubrik-Entwurfs (keine öffentlichen Noten) |
| `pnpm release-check` / `pnpm review-pack` | offene Release-Blocker / Prüfpaket für die Fachprüfung |
| `node scripts/qa-browser.cjs http://localhost:4321 [screenshotDir]` | Browser-QA: Links, 404, 360 px, axe-core, Rechner per Tastatur (benötigt Playwright) |

Für Cloudflare später: Build-Befehl `pnpm build`, Ausgabeverzeichnis `dist`.

## Aufbau

- `data/` – strukturierte Daten (JSON): Quellen, Wirkstoffe, Marken, Produkte mit Preisbeobachtungen, Evidenz, Duelle. Jede veränderliche Angabe verweist auf eine Quelle in `data/sources.json`.
- `content/wirkstoffe/` – redaktionelle Texte (Markdown) mit `status` und `reviewedBy`.
- `src/lib/schema.ts` – ein Schema für Build, Validator und Tests, inkl. Querprüfungen.
- `src/lib/price.ts` – Preisnormalisierung in ganzen Cent.
- `src/lib/categories.ts` – Kategorien (Kreatin, Whey-Protein): Bezugsstoff, Rechner, Texte.
- `src/pages/` – Startseite, `/wirkstoffe/[slug]/`, `/produkte/[id]/`, `/vergleich/[slug]/`, `/duell/[slug]/`, `/rechner/…`, `/methodik/`, `/ueber-uns/`, 404, `sitemap.xml`.
- `wrangler.jsonc`, `public/_headers` – Cloudflare Workers Static Assets, Sicherheits-Header.
- `docs/DATEN-ERFASSEN.md` – Checkliste zum Erfassen von Produkten, Studien und Aussagen.
- `docs/RUBRIK-ENTWURF.md` – nicht öffentlicher Entwurf der Bewertungsrubrik.

## Veröffentlichungsregeln im Code

- `status: "draft"` wird nie gerendert. Veröffentlichte Produkte brauchen Preisbeobachtung und Wirkstoffanteil; Aktionspreise brauchen Bedingungen; Laboraussagen brauchen eine Quelle.
- Ohne `SITE_URL` **und** `PUBLIC_INDEXING=true` trägt jede Seite `noindex` und `robots.txt` sperrt alles. `noindex` ist keine Zugriffskontrolle.
- Mit `PUBLIC_INDEXING=true` bricht der Build ab, solange ein veröffentlichter Artikel kein `reviewedBy` hat.
