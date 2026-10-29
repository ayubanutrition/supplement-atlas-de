// Testserver: liefert dist/ mit den Headern aus public/_headers (wie Cloudflare).
// Aufruf: node scripts/serve-dist.cjs [port]  (Standard 4322; zuerst pnpm build)
const http=require('http'),fs=require('fs'),path=require('path');
const root=require('path').join(__dirname,'..','dist');
const hdr={};fs.readFileSync(root+'/_headers','utf8').split('\n').slice(1).forEach(l=>{const m=l.trim().match(/^([^:]+):\s*(.+)$/);if(m)hdr[m[1]]=m[2];});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
http.createServer((q,r)=>{
  let p; try { p=decodeURIComponent(q.url.split('?')[0]); } catch { r.writeHead(400); return r.end('Bad request'); }
  let f=path.resolve(root,'.'+path.posix.normalize('/'+p));
  if(!f.startsWith(root+path.sep)&&f!==root){ r.writeHead(403); return r.end('Forbidden'); }
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  const ok=fs.existsSync(f);if(!ok)f=path.join(root,'404.html');
  r.writeHead(ok?200:404,{...hdr,'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));
}).listen(Number(process.argv[2])||4322,'127.0.0.1');
