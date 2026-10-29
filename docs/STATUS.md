# Arbeitsstand

Stand: 29.10.2026 · Branch `feat/omega3` (enthält M1–M3 aus `feat/m3-protein`; Basis `main` @ 5a4b1b2)

## Verifiziert
- M0–M2: Astro 7.3.8 + TypeScript, ein Zod-Schema für Build/Validator/Tests, Draft- und Quellenregeln, Kreatin-Strecke.
- M3 (Launch-Kern, technisch fertig, Inhalte im Entwurf):
  - Kategorien datengetrieben (`src/lib/categories.ts`): Kreatin und Whey-Protein, je Wirkstoffseite, Vergleich, Rechner, Duelle.
  - Kreatin: 7 veröffentlichte Produkte (ESN, Myprotein, Bulk, Bodylab24, nu3, Natural Elements, Weider), 3 Duelle; More Nutrition als **Entwurf** (Verfügbarkeit widersprüchlich). Creapure-Produkte (nu3, Weider) mit Vergleichbarkeitshinweis.
  - Whey: 5 veröffentlichte Produkte (ESN, Myprotein, Bulk, Bodylab24, Optimum Nutrition), 3 Duelle; Scitec als **Entwurf** (Gewicht 1000 g vs. 920 g, Sorte, Versand ungeklärt). Vergleichbarkeitshinweise sichtbar (ESN/Bodylab24 sind Konzentrat-Isolat-Mischungen, Geschmack und Packung unterschiedlich, drei von vier Preisen sind Aktionen; Reihenfolge kippt zwischen Aktions- und Streichpreis).
  - Evidenz: Kreatin 8 Arbeiten + 3 EU-Aussagen; Protein 13 Arbeiten + 4 EU-Aussagen (Wortlaut aus Amtsblatt-Ursprungsfassungen); 63 dokumentierte Quellen.
  - Release-Technik: `wrangler.jsonc` (Workers Static Assets), `_headers` (CSP u. a., mit Testserver geprüft), `sitemap.xml` nur nach Freigabe, `noindex`/robots bis Freigabe.
- Prüfungen: `pnpm build` = Datenprüfung + 57 Tests + 33 Seiten + Output-Prüfung grün. Browser-QA (`scripts/qa-browser.cjs`, gegen Server mit echten Headern): alle internen Links 200, 404 korrekt, kein Überlauf bei 360 px, keine Konsolenfehler, keine axe-core-Befunde (WCAG 2.1 AA + Best Practice), beide Rechner korrekt. Screenshots 360/1280 px gesichtet.
- Freigabesperren (alle getestet): Build mit `PUBLIC_INDEXING=true` bricht ab ohne `reviewedBy` am Artikel, ohne vollständiges Impressum (`data/operator.json`) und ohne geprüfte Datenschutzerklärung. `pnpm release-check` listet alle offenen Blocker; Schritt-für-Schritt-Anleitung in `docs/RELEASE.md`.
- **Omega-3-Cluster (Entwurf, nicht veröffentlicht):** Artikel `content/wirkstoffe/omega-3.md` (`status: draft`, ohne Fachprüfung), 6 EU-Aussagen, 17 Quellen/Studien, 4 Produkte (ESN, Bulk, Bodylab24, Natural Elements) als Entwurf, Preisbasis 10 g EPA+DHA (Kapselzahl × EPA+DHA je Kapsel), Rechner `/rechner/omega3preis/` (live, neutral). Mit lokal freigeschaltetem Cluster gebaut und im Browser geprüft (38 Seiten, keine Befunde). Zur Freigabe: Fachprüfung, dann `status: published` in Artikel, Substanz und Produkten; Preise ggf. neu erfassen.
- **Magnesium-Cluster (Entwurf, nicht veröffentlicht):** Artikel `content/wirkstoffe/magnesium.md` (`status: draft`, ohne Fachprüfung), 10 EU-Aussagen + Nährwertaussage, 18 Studien, Behördenwerte (EFSA, SCF, BfR, DGE), 4 Produkte (natural elements, Bodylab24, Bulk, Weider) als Entwurf, Preisbasis 10 g elementares Magnesium (Stückzahl × Magnesium je Stück, aus Portionswert gerechnet), Rechner `/rechner/magnesiumpreis/` (live, neutral). Preise je 10 g von Hand nachgerechnet und getestet: 8,79 / 9,39 / 12,48 (Aktion, Liste 16,65) / 11,33 €. Hinweis im Vergleich: drei Produkte empfehlen Tagesdosen über dem BfR-Vorschlag von 250 mg. Mit lokal freigeschaltetem Cluster gebaut und im Browser geprüft (39 Seiten, keine Befunde), danach zurück auf Entwurf. Lücken: ESN Magnesium (keine Zutatenliste) nicht erfasst; Bodylab24 nennt „Magnesium“ ohne „elementar“.
- Aktionspreise mit Enddatum (`saleEndsAt`): nach Ablauf automatisch „Aktion beendet – erneut prüfen“ (nu3 bis 30.10.2026, Bulk bis 03.11.2026).
- Code-Review (unabhängig, 10 Befunde) umgesetzt: abgelaufene Aktion zählt nicht mehr als gültiger Preis; Datum in Berlin statt UTC; Hinweis im Browser bei Seiten ohne Neubau >30 Tage; Release-Check wertet nur die neueste Preisbeobachtung und liest Frontmatter robust; „1.000“ im Rechner = 1000; Rundung 10,075 € = 10,08 €; ungültiges JSON wird mit Pfad gemeldet; Output-Prüfung kennt Assets/Query-Links und Entwurfsseiten; Testserver gehärtet.
- Stichproben-Audit gegen Live-Seiten (9 Produkte aus allen Bereichen, unabhängig abgerufen 29.10.2026): alle Preise, Mengen, Wirkstoffangaben und Portionsgrößen identisch; 4 als Zitat wirkende Paraphrasen (Prüf-/Allergenhinweise) auf Originalwortlaut korrigiert. Nicht geprüft: Versandkosten, verlinkte Laboranalysen.
- Output-Prüfung nach jedem Build (mit absichtlichen Fehlern getestet) und Mobil-Performance-Stichprobe (gedrosselt: LCP 0,45–0,72 s, CLS 0; HTML 4–23 KB, CSS 6,5 KB).
- Protein-Aussagen gegen die konsolidierte EU-Fassung (20.08.2025) wörtlich bestätigt; Nährwertangabe „Proteinquelle“ (VO 1924/2006) noch aus der Ursprungsfassung.
- Pull Request (Entwurf): https://github.com/ayubanutrition/supplement-atlas-de/pull/1

## Entscheidungen
- Preisbasis Kreatin = Kreatin-Monohydrat (Etiketten runden „davon Kreatin“ unterschiedlich); Whey = Protein laut Nährwerttabelle.
- Anzeige = ohne Code zahlbarer Preis (Aktion, sonst regulär) plus Streichpreis; Versand daneben, nicht eingerechnet.
- Keine Punktnoten, kein Testsieger. Rubrik nur als Entwurf: `docs/RUBRIK-ENTWURF.md`; Kalibrierung auf echten Daten (`scripts/rubric-sim.mjs`) ergab: Preisnote instabil (Whey: 5 von 5 Produkten wechseln den Rang je nach Preisbasis), Achsen A/B unterscheiden schlecht → Rubrik v2: keine 1–10-Noten zum Start, sondern Preiszahlen mit beiden Basen und Checklisten.
- Systemschriften, kein Drittanbieter-Request. Abhängigkeiten gepinnt (astro 7.3.8, vitest 5.0.4, zod 4.6.7, axe-core 4.13.0).
- Nicht abrufbar/nicht geeignet, bewusst weggelassen: Sunday Natural, HSN (Bot-Schutz, nicht umgangen), foodspring (Proxy-Sperre), Bulk-AGB (403), Rocka (500-g-Variante nicht lieferbar), Weider Whey (keine passende Größe).

## Entscheidungen des Eigentümers (29.10.2026)
- Impressum: vorerst nicht; Seite bleibt Vorschau mit `noindex`.
- Hosting: zuerst kostenlose Vorschau über Cloudflare (`workers.dev`), Domain später.
- Fachprüfung: laut Eigentümer am 29.10.2026 durch Jens Petersen erfolgt (Bestätigung per Rückfrage). **Qualifikation wurde nicht genannt** und ist in `reviewedBy` nicht ausgewiesen; empfohlen, sie zu ergänzen. Prüfpaket: `pnpm review-pack` → `docs/PRUEFPAKET.md`.
- Impressum: weiterhin „doch noch nicht“; Name Jens Petersen wurde genannt, Anschrift/E-Mail fehlen.

## Offen / Blocker (nur der Eigentümer kann das lösen)
1. ~~Fachliche Prüfung~~ eingetragen (siehe oben; Qualifikation noch ergänzen).
2. **Impressum/Kontakt:** `data/operator.json` mit echten Angaben füllen; **Datenschutz-Text** (Entwurf des technischen Ist-Zustands liegt vor) rechtlich prüfen lassen.
3. **Domain/Marke** nicht geprüft, nichts gekauft. Cloudflare-Konto nicht verbunden (`wrangler.jsonc` + gepinnter Wrangler 4.151.3 liegen bereit, Dry-Run geprüft; Build `pnpm build`, Deploy `npx wrangler deploy`).
4. Preise sind Momentaufnahmen vom 28./29.10.2026 und werden nach 30 Tagen als „erneut zu prüfen“ markiert; die Bulk-Aktion endet laut Shop am 03.11.2026.
5. Quellenlücken: ESN ohne Zutatenliste (Kreatin); Prüfberichte/PDFs der Anbieter nicht geöffnet; Herstellerangaben zu Tests nicht verifiziert; VO 1924/2006 nur als Ursprungsfassung geprüft; More-Nutrition-Verfügbarkeit ungeklärt.
6. `gh` ohne gültiges Token und GraphQL gesperrt; PR-Anlage über die REST-API funktioniert (`gh api repos/…/pulls`).

## Nächste Aufgabe
Owner-Anleitung in einfacher Sprache: `docs/NAECHSTE-SCHRITTE.md`.
Eigentümer: `docs/RELEASE.md` Schritte 1–3 (Prüfung, Impressum, Domain-/Cloudflare-Entscheidung). Danach M4: Vorschau prüfen, `pnpm release-check` ohne Blocker, Variablen setzen, veröffentlichen. Parallel möglich: Rubrik an den 7 Kreatin-Produkten kalibrieren (Schwelle 6 erreicht; Whey hat 5), Omega-3/Magnesium vorbereiten. Preise nu3 (bis 30.10.) und Bulk (bis 03.11.) laufen ab.
