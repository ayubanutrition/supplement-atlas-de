// Browser-QA gegen eine laufende Vorschau (pnpm preview).
// Prüft: Statuscodes interner Links, horizontales Überlaufen bei 360 px,
// Konsolenfehler, axe-core-Befunde, Rechner per Tastatur.
// Benötigt Playwright (in der Claude-Cloud-Umgebung vorinstalliert).
// Aufruf: node scripts/qa-browser.cjs [baseUrl] [screenshotDir]
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.argv[2] || 'http://localhost:4321';
const SHOTS = process.argv[3] || null;
const AXE = fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const START = ['/', '/wirkstoffe/kreatin/', '/vergleich/kreatin/', '/rechner/kreatinpreis/', '/methodik/', '/ueber-uns/'];
const problems = [];

(async () => {
  const browser = await chromium.launch();
  const seen = new Set();
  const queue = [...START];
  const results = [];

  for (const width of [360, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, locale: 'de-DE' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    const pages = width === 360 ? queue : [...seen];
    for (let i = 0; i < pages.length; i++) {
      const url = pages[i];
      if (width === 360) seen.add(url);
      const res = await page.goto(BASE + url, { waitUntil: 'load' });
      const status = res.status();
      if (status !== 200) problems.push(`${url}: HTTP ${status}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) problems.push(`${url} @${width}px: horizontaler Überlauf ${overflow}px`);
      if (width === 360) {
        const links = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href').split('#')[0]));
        for (const l of links) if (!seen.has(l) && !queue.includes(l)) queue.push(l);
        await page.addScriptTag({ content: AXE });
        const axe = await page.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] });
          return r.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}×): ${v.help}`);
        });
        axe.forEach((a) => problems.push(`${url} axe: ${a}`));
        const meta = await page.evaluate(() => ({
          title: document.title,
          robots: document.querySelector('meta[name=robots]')?.content,
          h1: document.querySelectorAll('h1').length,
        }));
        if (meta.h1 !== 1) problems.push(`${url}: ${meta.h1} h1-Elemente`);
        results.push({ url, status, ...meta });
      }
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${width}${url.replace(/\//g, '_') || '_'}.png`), fullPage: true });
    }
    errors.forEach((e) => problems.push(`Konsole @${width}px: ${e}`));
    await ctx.close();
  }

  // 404 muss echten Statuscode liefern
  const p404 = await browser.newPage();
  const r404 = await p404.goto(BASE + '/gibt-es-nicht/');
  if (r404.status() !== 404) problems.push(`/gibt-es-nicht/: erwartet 404, erhalten ${r404.status()}`);

  // Rechner nur per Tastatur bedienen
  const kp = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await kp.goto(BASE + '/rechner/kreatinpreis/');
  await kp.keyboard.press('Tab'); // Skip-Link
  let guard = 0;
  while ((await kp.evaluate(() => document.activeElement?.id)) !== 'price' && guard++ < 20) await kp.keyboard.press('Tab');
  await kp.keyboard.type('24,90');
  await kp.keyboard.press('Tab');
  await kp.keyboard.type('500');
  const r100 = (await kp.textContent('#r100')).replace(/ /g, ' ');
  const r1 = (await kp.textContent('#r1')).replace(/ /g, ' ');
  if (r100 !== '4,98 €') problems.push(`Rechner: erwartet 4,98 € pro 100 g, erhalten ${r100}`);
  if (r1 !== '0,05 €') problems.push(`Rechner: erwartet 0,05 € pro g, erhalten ${r1}`);
  await kp.keyboard.press('Tab');
  await kp.keyboard.press('Control+A');
  await kp.keyboard.type('120');
  const err = await kp.isVisible('#out-error');
  if (!err) problems.push('Rechner: ungültiger Anteil (120) zeigt keinen Fehler');

  // Dunkelmodus und stark reduzierte Bewegung: axe (inkl. Kontrast) auf allen gefundenen Seiten
  {
    const dctx = await browser.newContext({ viewport: { width: 360, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce' });
    const dp = await dctx.newPage();
    for (const url of seen) {
      await dp.goto(BASE + url, { waitUntil: 'load' });
      await dp.addScriptTag({ content: AXE });
      const dark = await dp.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] });
        return r.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}×)`);
      });
      dark.forEach((a) => problems.push(`${url} [dunkel] axe: ${a}`));
      if (SHOTS && ['/', '/vergleich/kreatin/'].includes(url)) await dp.screenshot({ path: path.join(SHOTS, `dark${url.replace(/\//g, '_') || '_'}.png`), fullPage: true });
    }
    await dctx.close();
  }

  // Sortierschalter im Vergleich: Standard alphabetisch, per Tastatur auf Preis umstellbar
  const sp = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await sp.goto(BASE + '/vergleich/whey-protein/');
  const names = async () => sp.$$eval('figure.bars:first-of-type .bar-label', (els) => els.map((e) => e.textContent.trim().split('\n')[0]));
  const alpha = await names();
  if (JSON.stringify(alpha) !== JSON.stringify([...alpha].sort((a, b) => a.localeCompare(b, 'de')))) problems.push('Vergleich: Standardsortierung nicht alphabetisch');
  await sp.focus('#sortbar button[data-sort="pay"]');
  await sp.keyboard.press('Enter');
  const byPay = await names();
  if (!byPay[0].startsWith('Bodylab24')) problems.push(`Vergleich: Sortierung nach Preis, erwartet Bodylab24 zuerst, erhalten ${byPay[0]}`);
  if ((await sp.getAttribute('#sortbar button[data-sort="pay"]', 'aria-pressed')) !== 'true') problems.push('Vergleich: aria-pressed nicht gesetzt');
  await sp.focus('#sortbar button[data-sort="reg"]');
  await sp.keyboard.press('Space');
  const byReg = await names();
  if (!byReg[0].startsWith('Bulk')) problems.push(`Vergleich: Sortierung nach Listenpreis, erwartet Bulk zuerst, erhalten ${byReg[0]}`);

  // Proteinrechner: 37,90 € / 1000 g bei 75 g Protein je 100 g = 5,05 € pro 100 g
  const pp = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await pp.goto(BASE + '/rechner/proteinpreis/');
  await pp.fill('#price', '37,90');
  await pp.fill('#weight', '1000');
  await pp.fill('#share', '75');
  const p100 = (await pp.textContent('#r100')).replace(/\u00a0/g, ' ');
  if (p100 !== '5,05 €') problems.push(`Proteinrechner: erwartet 5,05 €, erhalten ${p100}`);
  await pp.fill('#shipping', '4,90');
  const pShip = (await pp.textContent('#r100')).replace(/\u00a0/g, ' ');
  if (pShip !== '5,71 €') problems.push(`Proteinrechner mit Versand: erwartet 5,71 €, erhalten ${pShip}`);

  // Omega-3-Rechner: ESN 16,90 € / 60 Kapseln à 400 + 300 mg = 42 g → 4,02 € pro 10 g
  const op = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await op.goto(BASE + '/rechner/omega3preis/');
  await op.fill('#price', '16,90'); await op.fill('#count', '60'); await op.fill('#epa', '400'); await op.fill('#dha', '300');
  const o10 = (await op.textContent('#r10')).replace(/\u00a0/g, ' ');
  if (o10 !== '4,02 €') problems.push(`Omega-3-Rechner: erwartet 4,02 €, erhalten ${o10}`);
  await op.fill('#epa', '1200'); await op.fill('#dha', '900');
  if (!(await op.isVisible('#out-error'))) problems.push('Omega-3-Rechner: Wert je Portion (2100 mg je Kapsel) wird nicht beanstandet');

  await browser.close();
  console.log(JSON.stringify(results, null, 1));
  console.log(`Rechner per Tastatur: ${r100} pro 100 g, ${r1} pro g; Fehlermeldung bei ungültigem Anteil: ${err}`);
  if (problems.length) {
    console.log(`\n${problems.length} Befund(e):`);
    problems.forEach((p) => console.log(' - ' + p));
    process.exit(1);
  }
  console.log('\nKeine Befunde.');
})();
