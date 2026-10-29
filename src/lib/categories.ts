// Kategorie-Konfiguration: Texte und Bezugsgrößen je Wirkstoff.
// Neue Kategorie = ein Eintrag hier + Daten + Artikel (content/wirkstoffe).
export interface Category {
  substanceId: string;
  /** URL-Segment: /wirkstoffe/<slug>/ und /vergleich/<slug>/ */
  slug: string;
  name: string;
  /** Bezugsstoff für den Preisvergleich, wie auf Etiketten deklariert. */
  unit: string;
  /** Kurzform für Tabellen. */
  unitShort: string;
  /** Preisbasis: Menge Wirkstoff in g, auf die der Preis umgerechnet wird (100 oder 1). */
  basisG: number;
  /** Text der Preisbasis, z. B. „100 g“ oder „1 g“. */
  basisLabel: string;
  calculatorPath: string;
  /** Hinweis unter dem Vergleich: wann Preis/100 g Pulver ≠ Preis/100 g Wirkstoff. */
  basisNote: string;
}

export const CATEGORIES: Category[] = [
  {
    substanceId: 'kreatin',
    slug: 'kreatin',
    name: 'Kreatin',
    unit: 'Kreatin-Monohydrat',
    unitShort: 'Kreatin-Monohydrat',
    basisG: 100,
    basisLabel: '100 g',
    calculatorPath: '/rechner/kreatinpreis/',
    basisNote:
      'Alle erfassten Produkte bestehen laut Anbieter zu 100 % aus Kreatin-Monohydrat, deshalb entspricht der Preis pro 100 g Pulver dem Preis pro 100 g Kreatin-Monohydrat.',
  },
  {
    substanceId: 'whey-protein',
    slug: 'whey-protein',
    name: 'Whey-Protein',
    unit: 'Protein',
    unitShort: 'Protein',
    basisG: 100,
    basisLabel: '100 g',
    calculatorPath: '/rechner/proteinpreis/',
    basisNote:
      'Whey-Pulver enthält neben Eiweiß auch Kohlenhydrate, Fett und Aromen. Darum rechnen wir den Preis auf 100 g enthaltenes Protein laut Nährwerttabelle um, nicht auf 100 g Pulver. Zusammensetzung (reines Konzentrat oder Mischung mit Isolat), Geschmack und Packungsgröße unterscheiden sich; siehe „Wie vergleichbar sind die Produkte?“.',
  },
];

export const categoryBySubstance = (id: string): Category => {
  const c = CATEGORIES.find((x) => x.substanceId === id);
  if (!c) throw new Error(`Keine Kategorie-Konfiguration für ${id}`);
  return c;
};
