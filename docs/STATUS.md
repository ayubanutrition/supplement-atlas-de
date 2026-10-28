# Arbeitsstand

Stand: 29.10.2026 · Branch `feat/m1-m2-kreatin` (Basis `main` @ 5a4b1b2)

## Verifiziert
- M0: Repo `ayubanutrition/supplement-atlas-de` (privat) mit Startdateien auf `main`.
- M1: Astro 7.3.8 + TypeScript, ein Zod-Schema für Build/Validator/Tests, Draft- und Quellenregeln, Navigation, drei Seitentypen (Wirkstoff, Produkt, Vergleich) plus Duell, Rechner, Methodik, Über uns, 404.
- M2: Kreatin-Strecke mit echten Daten, abgerufen 28.10.2026:
  - ESN Ultrapure Kreatin 500 g: 29,90 € → 5,98 €/100 g Monohydrat.
  - Myprotein Kreatin Monohydrat 500 g: Aktion 14,99 € → 3,00 €/100 g; Streichpreis 19,99 € → 4,00 €/100 g.
  - 2 zugelassene + 1 abgelehnter EU-Claim (Wortlaut aus Amtsblatt), 8 Studien mit verifizierter PMID, VKM-Risikobewertung.
- Prüfungen: `pnpm build` (Datenprüfung, 27 Tests, 10 Seiten) grün. Browser-QA (`scripts/qa-browser.cjs`): alle internen Links 200, 404 korrekt, kein Überlauf bei 360 px, keine Konsolenfehler, keine axe-core-Befunde (WCAG 2.1 AA + Best Practice), Rechner per Tastatur korrekt (24,90 €/500 g → 4,98 €). Screenshots 360/1280 px manuell gesichtet.
- Freigabesperre getestet: Build mit `PUBLIC_INDEXING=true` bricht ab („Ohne fachliche Prüfung nicht veröffentlichbar: kreatin“).

## Plankorrekturen (entschieden)
- Preisbasis Kreatin = **Kreatin-Monohydrat**, nicht „davon Kreatin“: Etiketten runden die Kreatinangabe unterschiedlich (ESN 3,5 g → „3,0 g“, rechnerisch 3,08 g); sonst ~3 % Verzerrung. Umrechnung ÷ 0,879 in Methodik.
- Vergleich zeigt den **ohne Code zahlbaren Preis** (Aktion, sonst regulär) und separat Streichpreis; Versand daneben, nicht eingerechnet.
- Systemschriften statt Webfonts (keine Drittanbieter-Requests, 0 €).
- Abhängigkeiten auf Versionen ≥ 2 Wochen gepinnt (astro 7.3.8, vitest 5.0.4, zod 4.6.7, axe-core 4.13.0).

## Offen / Blocker
- **Fachliche Prüfung** des Kreatin-Artikels durch qualifizierte Person (`reviewedBy`) – blockiert Indexierung.
- ESN zeigt keine Zutaten-/Allergenliste; „Alle Laboranalysen (PDF)“ nicht ausgewertet.
- Myprotein: Seite widerspricht sich (Portion 3 vs. 3,4 g; Allergene). Dokumentiert, nicht aufgelöst.
- Fließtext des Artikels hat noch keine Inline-Belege; Belege stehen in Claims-/Studienblöcken darunter.
- Betreiberangaben, Impressum, Datenschutz, Domain, Cloudflare – nicht begonnen (M4).
- `gh` CLI in der Cloud-Umgebung ohne gültiges Token; Push läuft über Git-Proxy, PR muss im Browser angelegt werden.

## Nächste Aufgabe
M3 beginnen: Protein-Cluster analog anlegen (Rechner „Preis pro 100 g Protein“, 2–4 echte Produkte), dazu 4–6 weitere Kreatin-Produkte erfassen. Vorher: Bewertungsrubrik-Entwurf Kreatin (1/5/10-Anker) als Entwurf, nicht öffentlich.
