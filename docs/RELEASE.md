# Release-Anleitung (M4)

Alles Technische ist vorbereitet. Offen sind nur Schritte, die Angaben oder Anmeldungen des Eigentümers brauchen. `pnpm release-check` zeigt jederzeit, was noch fehlt.

## 1. Inhalte freigeben (Eigentümer)
1. **Fachliche Prüfung:** `pnpm review-pack` erzeugt `docs/PRUEFPAKET.md` (Artikeltext, EU-Aussagen, Studien, Quellen und Preisrechnung je Artikel zum Abhaken). Eine qualifizierte Person liest `content/wirkstoffe/kreatin.md` und `whey-protein.md` samt Evidenzdaten und trägt Namen/Qualifikation in `reviewedBy` ein. Ungeklärte Aussagen als `status: draft` zurückhalten.
2. **Impressum:** `data/operator.json` mit echten Angaben füllen (Name, Anschrift, E-Mail, Verantwortlicher; ggf. Register, USt-ID). Nichts erfinden.
3. **Datenschutz:** Text auf `/datenschutz/` rechtlich prüfen lassen, Hosting-Anbieter ergänzen, dann `privacyReviewedBy` setzen.
4. **Preise** frisch erfassen, wenn sie älter als 30 Tage sind (`pnpm release-check` meldet das).
5. Kennzeichnung prüfen: Affiliate-Links gibt es nicht; falls später ergänzt, auf `/ueber-uns/` und an den Links kennzeichnen.

## 2. Domain (Eigentümer, kostet Geld)
Erst Marken-/Namensprüfung, dann Erstjahrespreis, Verlängerung und Steuern konkret prüfen, dann kaufen. Bis dahin reicht die kostenlose `*.workers.dev`-Vorschau.

## 3. Cloudflare – kostenlose Vorschau (Eigentümer meldet sich an)
Node 22 (`.node-version`), pnpm 10 und Wrangler 4.151.3 sind im Repo festgelegt; `npx wrangler deploy --dry-run` wurde lokal geprüft.
Dashboard → Workers & Pages → Create application → GitHub → Repo `supplement-atlas-de` → Production-Branch `main`.
- Build-Befehl: `pnpm build` (enthält Datenprüfung und Tests)
- Deploy-Befehl: `npx wrangler deploy` (nutzt `wrangler.jsonc`, Ausgabe `dist`)
- Variablen für die **Vorschau**: keine (Seite bleibt `noindex`, robots sperrt).
- Vorschau prüfen: Statuscodes, Mobilansicht, Inhalte, robots/noindex. Ein privates Repo macht die Vorschau nicht privat.

## 4. Veröffentlichung
Erst wenn `pnpm release-check` keine Blocker mehr meldet:
1. In Cloudflare setzen: `SITE_URL=https://<domain>` und `PUBLIC_INDEXING=true` (der Build bricht sonst bewusst ab).
2. Domain verbinden, HTTPS, Canonicals, Weiterleitungen (www → apex) testen.
3. `/sitemap.xml` kontrollieren, Search Console einrichten, Sitemap einreichen.
4. Rückweg: letzte gute Deploy-Version in Cloudflare behalten; Git-Commit ist reproduzierbar (`pnpm install --frozen-lockfile`).

## Nach dem Start
Preise alle 30 Tage prüfen, Änderungen im Änderungsprotokoll der Produktseite vermerken, falsche Daten sofort zurückziehen (Status `draft`).
