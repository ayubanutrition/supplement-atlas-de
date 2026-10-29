# Arbeitsstand

Stand: 29.10.2026 · Branch `feat/m3-protein` (enthält M1/M2; Basis `main` @ 5a4b1b2)

## Verifiziert
- M0–M2: Astro 7.3.8 + TypeScript, ein Zod-Schema für Build/Validator/Tests, Draft- und Quellenregeln, Kreatin-Strecke.
- M3 (Launch-Kern, technisch fertig, Inhalte im Entwurf):
  - Kategorien datengetrieben (`src/lib/categories.ts`): Kreatin und Whey-Protein, je Wirkstoffseite, Vergleich, Rechner, Duelle.
  - Kreatin: 4 veröffentlichte Produkte (ESN, Myprotein, Bulk, Bodylab24), 2 Duelle; More Nutrition als **Entwurf** (Verfügbarkeit widersprüchlich).
  - Whey: 4 veröffentlichte Produkte (ESN, Myprotein, Bulk, Bodylab24), 2 Duelle. Vergleichbarkeitshinweise sichtbar (ESN/Bodylab24 sind Konzentrat-Isolat-Mischungen, Geschmack und Packung unterschiedlich, drei von vier Preisen sind Aktionen; Reihenfolge kippt zwischen Aktions- und Streichpreis).
  - Evidenz: Kreatin 8 Arbeiten + 3 EU-Aussagen; Protein 13 Arbeiten + 4 EU-Aussagen (Wortlaut aus Amtsblatt-Ursprungsfassungen); 51 dokumentierte Quellen.
  - Release-Technik: `wrangler.jsonc` (Workers Static Assets), `_headers` (CSP u. a., mit Testserver geprüft), `sitemap.xml` nur nach Freigabe, `noindex`/robots bis Freigabe.
- Prüfungen: `pnpm build` = Datenprüfung + 34 Tests + 23 Seiten grün. Browser-QA (`scripts/qa-browser.cjs`, gegen Server mit echten Headern): alle internen Links 200, 404 korrekt, kein Überlauf bei 360 px, keine Konsolenfehler, keine axe-core-Befunde (WCAG 2.1 AA + Best Practice), beide Rechner korrekt. Screenshots 360/1280 px gesichtet.
- Freigabesperre: Build mit `PUBLIC_INDEXING=true` bricht ab, solange ein Artikel kein `reviewedBy` hat.

## Entscheidungen
- Preisbasis Kreatin = Kreatin-Monohydrat (Etiketten runden „davon Kreatin“ unterschiedlich); Whey = Protein laut Nährwerttabelle.
- Anzeige = ohne Code zahlbarer Preis (Aktion, sonst regulär) plus Streichpreis; Versand daneben, nicht eingerechnet.
- Keine Punktnoten, kein Testsieger. Rubrik nur als Entwurf: `docs/RUBRIK-ENTWURF.md`.
- Systemschriften, kein Drittanbieter-Request. Abhängigkeiten gepinnt (astro 7.3.8, vitest 5.0.4, zod 4.6.7, axe-core 4.13.0).
- Nicht abrufbar, bewusst weggelassen: Sunday Natural, HSN (Bot-Schutz, nicht umgangen), foodspring (Proxy-Sperre), Bulk-AGB (403).

## Offen / Blocker (nur der Eigentümer kann das lösen)
1. **Fachliche Prüfung** beider Artikel durch qualifizierte Person (`reviewedBy`) – ohne sie keine Indexierung.
2. **Impressum, Datenschutz, Kontakt** (Betreiberangaben) fehlen; dürfen nicht erfunden werden.
3. **Domain/Marke** nicht geprüft, nichts gekauft. Cloudflare-Konto nicht verbunden (`wrangler.jsonc` liegt bereit; Build `pnpm build`, Ausgabe `dist`).
4. Preise sind Momentaufnahmen vom 28./29.10.2026 und werden nach 30 Tagen als „erneut zu prüfen“ markiert; die Bulk-Aktion endet laut Shop am 03.11.2026.
5. Quellenlücken: ESN ohne Zutatenliste (Kreatin); Prüfberichte/PDFs der Anbieter nicht geöffnet; Herstellerangaben zu Tests nicht verifiziert; konsolidierte EU-Fassung bei Protein-Claims nicht abgeglichen; More-Nutrition-Verfügbarkeit ungeklärt.
6. `gh` CLI hat in der Cloud kein gültiges Token: Pull Request im Browser anlegen.

## Nächste Aufgabe
Nach fachlicher Prüfung und Betreiberangaben: M4 (Cloudflare-Vorschau, Domain-Entscheidung mit konkreten Kosten, Freigabe). Parallel möglich: weitere Produkte erfassen, Rubrik kalibrieren (mind. 6 Produkte je Kategorie), Omega-3/Magnesium vorbereiten.
