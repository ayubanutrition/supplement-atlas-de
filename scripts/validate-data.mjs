// Prüft alle Daten in /data gegen Schema und Querverweise.
// Läuft vor jedem Build (pnpm build) und bricht bei Fehlern ab.
import { loadDataset } from '../src/lib/load.ts';

const { data, errors } = loadDataset();
if (errors.length) {
  console.error(`Datenprüfung fehlgeschlagen (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
const pub = (xs) => xs.filter((x) => x.status === 'published').length;
console.log(
  `Datenprüfung ok: ${data.sources.length} Quellen, ${data.products.length} Produkte ` +
    `(${pub(data.products)} veröffentlicht), ${data.brands.length} Marken, ${data.duels.length} Duelle.`,
);
