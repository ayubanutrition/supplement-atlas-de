# Supplement Atlas DACH

Deutschsprachige Vergleichsplattform für Nahrungsergänzungsmittel, getrennt von ayubanutrition.de. Status: Vorschau, nicht veröffentlicht.

Strategie: [CLAUDE_MASTER_HANDOFF.md](CLAUDE_MASTER_HANDOFF.md) · Aktueller Stand: [docs/STATUS.md](docs/STATUS.md)

## Befehle (Node ≥ 22, pnpm)

| Befehl | Zweck |
|---|---|
| `pnpm install` | Abhängigkeiten installieren (Versionen exakt gepinnt) |
| `pnpm validate` | Daten in `data/` gegen Schema und Querverweise prüfen |
| `pnpm test` | Rechenlogik, Veröffentlichungsregeln, echte Preise nachrechnen |
| `pnpm build` | validate + test + statischer Build nach `dist/` |
| `pnpm preview` | gebaute Seite lokal ausliefern |
| `node scripts/qa-browser.cjs http://localhost:4321 [screenshotDir]` | Browser-QA: Links, 404, 360 px, axe-core, Rechner per Tastatur (benötigt Playwright) |

Für Cloudflare später: Build-Befehl `pnpm build`, Ausgabeverzeichnis `dist`.

## Aufbau

- `data/` – strukturierte Daten (JSON): Quellen, Wirkstoffe, Marken, Produkte mit Preisbeobachtungen, Evidenz, Duelle. Jede veränderliche Angabe verweist auf eine Quelle in `data/sources.json`.
- `content/wirkstoffe/` – redaktionelle Texte (Markdown) mit `status` und `reviewedBy`.
- `src/lib/schema.ts` – ein Schema für Build, Validator und Tests, inkl. Querprüfungen.
- `src/lib/price.ts` – Preisnormalisierung in ganzen Cent.
- `src/pages/` – Startseite, `/wirkstoffe/[slug]/`, `/produkte/[id]/`, `/vergleich/kreatin/`, `/duell/[slug]/`, `/rechner/kreatinpreis/`, `/methodik/`, `/ueber-uns/`, 404.

## Veröffentlichungsregeln im Code

- `status: "draft"` wird nie gerendert. Veröffentlichte Produkte brauchen Preisbeobachtung und Wirkstoffanteil; Aktionspreise brauchen Bedingungen; Laboraussagen brauchen eine Quelle.
- Ohne `SITE_URL` **und** `PUBLIC_INDEXING=true` trägt jede Seite `noindex` und `robots.txt` sperrt alles. `noindex` ist keine Zugriffskontrolle.
- Mit `PUBLIC_INDEXING=true` bricht der Build ab, solange ein veröffentlichter Artikel kein `reviewedBy` hat.
