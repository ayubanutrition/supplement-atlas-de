# Produkte und Studien erfassen – Checkliste

Gilt für jeden, der Daten ergänzt (Mensch, Claude, Codex). Ziel: nachvollziehbar, datiert, ohne Schätzungen. Die Regeln im Code (`pnpm validate`, `pnpm test`, `pnpm build`) fangen viele Fehler ab, ersetzen aber nicht diese Checkliste.

## Grundregeln
- **Nichts erfinden, nichts schätzen.** Unbekanntes bleibt `null` und steht auf der Seite als „nicht angegeben“. Eine selbst gerechnete Zahl (z. B. Summe EPA+DHA) wird als berechnet vermerkt.
- **Quelle + Zeitstempel je Angabe** (`data/sources.json`, `retrievedAt` in UTC). Ein Abruf = eine Quelle, auch für Preis und Versand.
- **Keine Umgehung von Schutzmechanismen.** Blockiert ein Shop (403, Sicherheitsprüfung, Proxy-Sperre), wird er übersprungen und in `docs/STATUS.md` als Lücke vermerkt.
- **Kein flächiges Scraping.** Nur die nötigen Seiten je Produkt abrufen; keine Bilder oder langen Texte kopieren.

## Ein Produkt anlegen
1. Eine konkrete Variante wählen (Geschmack, Packung). Wenn die Seite keine Sorte/Größe eindeutig zeigt oder sich widerspricht → Status `draft`.
2. **Quelle** anlegen (Produktseite; Impressum; Versandseite, falls Versand dort steht). Hinweis zu Besonderheiten ins Feld `note` (z. B. „Preis nur in strukturierten Daten“).
3. **Wirkstoffmenge** bestimmen:
   - Pulver: Füllmenge (`netWeightG`) × Anteil je 100 g (`activePer100g`). „100 %“ aus der Ein-Zutaten-Liste ist erlaubt, wird aber im Hinweis vermerkt.
   - Kapseln: Gesamtmenge je Packung (`activeTotalG`) = Kapseln × Wirkstoff je Kapsel. **Wert je Portion auf je Kapsel umrechnen** (z. B. 3 Kapseln = 1200 mg EPA → 400 mg je Kapsel).
4. **Preis**: Preis ohne Code in Cent. Aktion → `salePriceCents` + `saleConditions` + `saleEndsAt` (Datum, falls der Anbieter eines nennt, auch in strukturierten Daten). Durchgestrichener Preis → `regularPriceNote` („Ob er zuletzt verlangt wurde, ist nicht geprüft“). Versand getrennt erfassen.
5. **Zusammensetzung wörtlich** (`ingredients`), Allergenhinweis, Rohstoff (nur wenn auf der Seite genannt, mit Quelle), Prüfaussagen **wörtlich** und als Herstellerangabe.
6. **Hinweise (`labelNotes`)**: Widersprüche auf der Seite (Portion 3 g vs. 3,4 g; „ohne Zuckerzusatz“ vs. Zucker in der Tabelle), Lücken (keine Zutatenliste), nicht geöffnete Prüfberichte. Beginnt ein Hinweis mit `Vergleichbarkeit:`, erscheint er im Vergleich (z. B. Mischung mit Isolat, Marken-Rohstoff, andere Packungsgröße, anderer Geschmack).
7. `pnpm validate && pnpm test`; **Preis von Hand nachrechnen** und in `tests/real-data.test.ts` als Test festhalten (Formel im Kommentar).

## Wann `draft`?
Verfügbarkeit widersprüchlich · Gewicht oder Sorte unklar · Versand nicht lesbar · zentrale Angaben fehlen. Entwürfe werden nie gerendert; `pnpm release-check` listet sie.

## Studien und Rechtsvorschriften
- Zuerst systematische Übersichten und Metaanalysen; Einzelstudien nur, wenn sie Kernaussagen tragen. **PMID per PubMed prüfen.**
- Zahlen nur aus dem Abstract übernehmen und als `basis: abstract` kennzeichnen. Offensichtlich fehlerhafte Zahlen oder Einheiten nicht übernehmen.
- Finanzierung und Interessenkonflikte angeben, soweit im Abstract/Volltext genannt; sonst `null` („nicht geprüft“), nie „keine“.
- Medikamentenstudien (z. B. 4 g reines EPA als Arzneimittel) nicht auf Supplemente übertragen und im Text so einordnen.
- EU-Aussagen im Wortlaut aus der amtlichen **konsolidierten** Fassung (Cellar: `publications.europa.eu/resource/celex/<CELEX>` mit `Accept: application/xhtml+xml`, `Accept-Language: de`). Bedingungen (Mindestmenge, Zielgruppe) mitnehmen.
- Behördenaussagen, die sich unterscheiden (z. B. BfR 1,5 g vs. EFSA 5 g), nebeneinander nennen; keine Aussage verschweigen.

## Artikeltexte
- Jede Tatsachenaussage muss im Prüfpaket (`pnpm review-pack`) belegt sein. Keine schärferen Formulierungen als die Quelle („unverändert“ ↔ „nicht signifikant verändert, p = 0,06“).
- Änderungen nach einer bestätigten Fachprüfung in `docs/AENDERUNGEN-NACH-PRUEFUNG.md` festhalten.
- Neue Kategorien: Eintrag in `src/lib/categories.ts` (Bezugsstoff, Preisbasis `basisG`), Artikel als `status: draft`, Produkte als `draft`, bis die Fachprüfung vorliegt.

## Vor dem Commit
`pnpm build` (Datenprüfung, Tests, Seiten, Output-Prüfung), danach `node scripts/qa-browser.cjs http://localhost:<port>` gegen `node scripts/serve-dist.cjs <port>`; `docs/STATUS.md` aktualisieren.
