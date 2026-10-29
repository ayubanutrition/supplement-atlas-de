# Bewertungsrubrik – ENTWURF (nicht öffentlich, nicht in der Seite verwendet)

Stand: 29.10.2026 · Status: Entwurf zur Kalibrierung. Bis diese Rubrik an mehreren echten Produkten erprobt und fachlich geprüft ist, zeigt die Seite **keine Punktnoten**.

Gilt je Kategorie (zuerst Kreatin-Monohydrat-Pulver, Whey-Konzentrat). Skala 1–10 pro Achse, **kein Gesamtscore**. Fehlt die Datengrundlage: „nicht bewertbar“, nie 0 oder Durchschnitt.

## Achse A – Dokumentierte Zusammensetzung
Frage: Wie vollständig und nachvollziehbar sind die Etikettangaben?
- 10: Zutatenliste, Wirkstoffmenge je 100 g **und** je Portion, Allergenangabe, Rohstoffherkunft, alles konsistent auf der Anbieterseite.
- 5: Zutaten und Wirkstoffmenge vorhanden, ein Merkmal fehlt (z. B. keine Allergenangabe) oder kleiner Widerspruch.
- 1: Wirkstoffmenge nicht ermittelbar oder mehrere Widersprüche.
- Nicht bewertbar: Seite nicht abrufbar.

## Achse B – Nachvollziehbarkeit von Prüfunterlagen
Frage: Gibt es belegbare Prüfunterlagen? (Wir prüfen die Analysen nicht selbst.)
- 10: Chargenbezogene Analyse eines akkreditierten Labors öffentlich abrufbar, aktuelles Datum, Prüfumfang genannt (z. B. Reinheit/Schwermetalle).
- 7: Konkrete Aussage zu regelmäßigen externen Tests mit Labor-/Akkreditierungsnennung, Unterlagen nicht frei abrufbar.
- 4: Allgemeine Aussage („getestet“) ohne Labor und Umfang.
- 1: Keine Angabe – **kein Hinweis auf Qualitätsmangel**, nur fehlender Nachweis; im UI als „keine Angabe gefunden“.
- Zertifikate (z. B. Informed Sport) nur werten, wenn für genau diese Variante belegt.

## Achse C – Preis (normalisiert)
Frage: Wie teuer ist der Wirkstoff im Vergleich zu den erfassten Produkten derselben Kategorie?
- Basis: Preis pro 100 g Wirkstoff ohne Code und ohne Versand, Stand ≤ 30 Tage.
- Skalierung relativ innerhalb der Kategorie-Stichprobe: 10 = günstigstes, 1 = teuerstes erfasstes Produkt, linear dazwischen. Mindestens 5 Produkte nötig, sonst „nicht bewertbar“.
- Aktionspreise gesondert ausweisen; Bewertung auf regulärem bzw. Streichpreis **und** Aktionspreis zeigen, nicht mischen.
- Offene Frage: relative Skala hängt von der Auswahl ab – oder feste Ankerpreise je Kategorie festlegen.

## Achse D – Produktspezifische Merkmale (nur belegt)
Kreatin: Rohstoff mit Herkunftsangabe (z. B. Marken-Rohstoff), Mikronisierung angegeben, Zusätze (nein = besser, da Preis pro Wirkstoff).
Whey: Proteinanteil je 100 g, Anteil Zucker/Fett, Süßungsmittel/Zusätze, Aminogramm angegeben.
- Gewichtung und Ankerwerte werden nach der Kalibrierung festgelegt.

## Nicht bewertet (bewusst)
Geschmack, Löslichkeit, Verträglichkeit: nur mit tatsächlich durchgeführter, beschriebener Erhebung. Wirkung: separat über Wirkstoff-Evidenz, nie als Produktnote.

## Kalibrierung vor Veröffentlichung
1. Mindestens 6 Produkte je Kategorie erfassen.
2. Jede Achse unabhängig von zwei Personen bewerten lassen; Abweichungen > 2 Punkte klären.
3. Randfälle testen: fehlende Angaben, Widersprüche, Aktion vs. Regulär, Marken-Rohstoff.
4. Sensitivitätsprüfung: Ändert ein anderes Preis-Ankersystem die Reihenfolge?
5. Fachliche Prüfung der Rubrik, dann auf /methodik/ veröffentlichen, erst danach Noten anzeigen.

---

## Kalibrierungsergebnis 29.10.2026 (`node scripts/rubric-sim.mjs [kreatin|whey-protein]`)

Der Entwurf wurde auf den echten Daten simuliert (Kreatin n=7, Whey n=5). **Ergebnis: In dieser Form darf keine Note veröffentlicht werden.**

| Befund | Zahl | Folge |
|---|---|---|
| Preisrang hängt von der Preisbasis ab (Aktionspreis vs. Streich-/Listenpreis) | Kreatin: 3 von 7 Produkten wechseln den Rang, Whey: **5 von 5** (Bodylab24 Rang 1 → 5) | Eine einzelne Preisnote ist instabil. Preis nur als Zahl je 100 g mit beiden Basen zeigen, nicht als 1–10. |
| Preisachse bestraft Produkte mit Marken-Rohstoff | nu3 (Creapure) = 1/10, Weider (Creapure) = 3,4/10 | Preis und Produktmerkmal (Achse D) dürfen nicht ohne Gegengewicht in getrennten Noten stehen; sonst wirkt „teuer“ wie „schlecht“. |
| Achse A (Zusammensetzung) unterscheidet bei Standardprodukten kaum | Whey: Spannweite 1 Punkt; bei Kreatin bewertet sie das Fehlen von Allergen- und Rohstoffangaben, nicht die Qualität der Dokumentation | Als Checkliste (✓ / – / unbekannt) zeigen statt als Note. Rohstoffherkunft gehört zu Achse D. |
| Achse B vermischt „keine Angabe“ mit „schlecht“ | 3 von 7 (Kreatin) bzw. 1 von 5 (Whey) bekommen 1/10 nur wegen fehlender Angabe | Fehlende Angaben als „keine Angabe gefunden“ ohne Zahl. Keine Unterlagen wurden geöffnet; höchstens die Aussage „nennt akkreditiertes Labor“ ist belegbar. |
| Relative Preisskala hängt von der Stichprobe ab | Neues Produkt verschiebt alle Noten | Entweder feste Ankerpreise je Kategorie oder keine Preisnote. |

### Konsequenz (Rubrik v2, Vorschlag)
1. **Keine 1–10-Noten zum Start.** Stattdessen: Preis je 100 g Wirkstoff (beide Basen, Rangänderung offen benennen), Checkliste zu Zusammensetzung und Prüfangaben (✓ / – / keine Angabe), Hinweis auf Marken-Rohstoff.
2. Noten erst, wenn (a) die Rangfolge unter beiden Preisbasen stabil ist oder die Basis fest definiert und begründet ist, (b) Achsen unabhängig bewertet wurden und (c) eine Sensitivitätsprüfung vorliegt.
3. Eigene Erhebungen (Geschmack, Löslichkeit) bleiben ausgeschlossen, solange sie nicht durchgeführt und beschrieben sind.

Der Methodik-Text („keine Noten“) bleibt damit zutreffend. Die Kalibrierung ist ein internes Werkzeug: `scripts/rubric-sim.mjs`.
