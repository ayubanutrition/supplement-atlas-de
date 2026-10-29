# Nächste Schritte für den Eigentümer

Kurz: Die Seite ist technisch und inhaltlich fertig vorbereitet. Es fehlen vier Dinge, die nur du entscheiden oder eintragen kannst. Alles läuft im Browser.

Stand prüfen: In Claude Code `pnpm release-check` ausführen lassen. Jeder offene Punkt steht dort als „✗“.

## 1. Impressum-Angaben (Pflicht vor der Veröffentlichung)
**Was:** Wer ist Betreiber der Seite? Das Impressum darf nicht erfunden werden.
**Schick mir:** Name (oder Firma samt Rechtsform), Straße und Hausnummer, PLZ und Ort, E-Mail-Adresse, Verantwortliche/r für den Inhalt; falls vorhanden Telefon, Handelsregister, USt-IdNr.
**Dann:** Ich trage es in `data/operator.json` ein. Die Seite `/impressum/` füllt sich damit selbst.

## 2. Datenschutz prüfen lassen
**Was:** Der Text auf `/datenschutz/` beschreibt nur, was die Seite technisch tut (keine Cookies, kein Tracking, nichts von Drittanbietern). Er ist ein Entwurf und muss rechtlich geprüft werden, außerdem fehlt der Hosting-Anbieter.
**Schick mir:** „Datenschutz geprüft von &lt;Name&gt;, &lt;Datum&gt;“ und die gewünschten Änderungen.
**Dann:** Ich passe den Text an und trage die Prüfung ein (`privacyReviewedBy`).

## 3. Fachprüfung der Omega-3- und Magnesium-Seite
**Was:** Kreatin und Whey-Protein sind als geprüft eingetragen. Die Artikel zu Omega-3 und Magnesium sind noch Entwürfe und werden nicht angezeigt.
**Ablauf:** Die prüfende Person liest `docs/PRUEFPAKET.md` (wird mit `pnpm review-pack` neu erzeugt), Abschnitte „Omega-3“ und „Magnesium“. Zu den bereits geprüften Artikeln sind nachträgliche Abschwächungen in `docs/AENDERUNGEN-NACH-PRUEFUNG.md` zusammengefasst.
**Schick mir:** Name, Qualifikation und Datum der Prüfung (die Qualifikation fehlt auch bei den ersten beiden Artikeln) sowie Änderungswünsche.
**Dann:** Ich setze Artikel, Substanz und je 4 Produkte von `draft` auf `published`, erfasse die Preise neu und prüfe alles.

## 4. Vorschau ins Netz stellen (kostenlos)
**Was:** Die Seite kostet 0 €. Eine eigene Domain brauchst du dafür nicht.
**Du machst (im Browser, ca. 10 Minuten):**
1. Bei Cloudflare anmelden → Workers & Pages → Create application → GitHub → Repository `supplement-atlas-de` wählen.
2. Branch auswählen (zuerst der Branch aus dem offenen Pull Request, später `main`).
3. Build-Befehl `pnpm build`, Deploy-Befehl `npx wrangler deploy`.
4. Fertig: Cloudflare nennt dir eine Adresse, die auf `workers.dev` endet.

**Dann:** Schick mir die Adresse. Ich prüfe Statuscodes, Handy-Ansicht, Hell/Dunkel und `noindex`. Die Seite bleibt dabei unsichtbar für Suchmaschinen.
**Hinweis:** `noindex` ist keine Zugriffssperre; jeder mit dem Link kann die Vorschau ansehen.

## Erst danach: echte Veröffentlichung
Nur wenn `pnpm release-check` „Keine Blocker“ meldet **und** du es ausdrücklich willst:
- Domain wählen und kaufen (vorher Namens-/Markenprüfung und Preis prüfen; ich lege dir Erstjahr, Verlängerung und Steuern vor).
- In Cloudflare `SITE_URL` und `PUBLIC_INDEXING=true` setzen, Domain verbinden, Search Console einrichten.
Einzelheiten: `docs/RELEASE.md`.

## Wiederkehrende Pflege
- Preise nach spätestens 30 Tagen neu erfassen und die Seite neu bauen lassen (nach jedem Aktionsende ebenfalls). Aktuell laufen aus: nu3 am 30.10.2026, Bulk am 03.11.2026.
- `pnpm release-check` zeigt auslaufende Aktionen 7 Tage im Voraus.

## Vorlage zum Weitermachen (in Claude Code einfügen)
> Setze am verifizierten Repo-Stand fort. Lies CLAUDE.md und docs/STATUS.md; prüfe Branch und offene Änderungen. Hier sind meine Angaben: …  (Impressum / Datenschutzprüfung / Fachprüfung Omega-3 und Magnesium / Cloudflare-Adresse). Trage sie ein, führe `pnpm build` und `pnpm release-check` aus, committe und berichte den Stand.
