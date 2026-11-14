/* Ondes : fonctionnement hors-ligne */
const V='ondes-app-v1',IMGC='ondes-img-v1',MAX=500;
const SHELL=['./','./index.html','./test.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==IMGC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function trim(c){const ks=await c.keys();for(let i=0;i<ks.length-MAX;i++)await c.delete(ks[i]);}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // Spotify (connexion, API) et Deezer : toujours en direct
  if(/(^|\.)spotify\.com$/.test(u.hostname)||u.hostname==='api.deezer.com')return;
  // Pages de l'app : réseau d'abord (toujours à jour), sinon la copie gardée
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}return res;})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return;}
  // Pochettes, photos, polices, librairies : copie gardée d'abord
  if(/scdn\.co$|dzcdn\.net$|fonts\.googleapis\.com$|fonts\.gstatic\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname)&&r.mode!=='cors'||/fonts\.gstatic\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname)){
    e.respondWith(caches.open(IMGC).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){c.put(r,res.clone());trim(c);}return res;}).catch(()=>m||Response.error()))));}
});
