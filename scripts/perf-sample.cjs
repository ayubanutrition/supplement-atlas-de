// Performance-Stichprobe (Laborwerte, kein Ersatz für reale Nutzerdaten).
// Misst FCP, LCP, CLS und Transfergröße bei Mobil-Emulation mit gedrosseltem CPU/Netz.
// Aufruf: node scripts/perf-sample.cjs [baseUrl]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4322';
const PAGES = ['/', '/wirkstoffe/kreatin/', '/vergleich/whey-protein/', '/produkte/esn-designer-whey-908g/', '/rechner/proteinpreis/'];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true });
  const rows = [];
  for (const u of PAGES) {
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let bytes = 0;
    cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength));
    await p.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0 };
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await p.goto(BASE + u, { waitUntil: 'load' });
    await p.waitForTimeout(800);
    const m = await p.evaluate(() => ({ ...window.__m, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0 }));
    rows.push({ url: u, fcp: Math.round(m.fcp), lcp: Math.round(m.lcp), cls: +m.cls.toFixed(3), kb: +(bytes / 1024).toFixed(1) });
    await p.close();
  }
  await b.close();
  console.table(rows);
  const bad = rows.filter((r) => r.lcp > 2500 || r.cls > 0.1);
  if (bad.length) { console.log('Über Schwelle (LCP > 2,5 s oder CLS > 0,1):', bad.map((r) => r.url).join(', ')); process.exit(1); }
  console.log('Alle Seiten unter den Schwellen (Labor, gedrosselt: 4× CPU, 1,6 Mbit/s, 150 ms).');
})();
