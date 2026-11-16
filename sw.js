// Ondes service worker v37 : réseau d'abord pour la page (toujours la dernière version), cache en secours hors ligne
const APP='ondes-app-v37', IMG='ondes-img-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys()){if(k!==APP&&k!==IMG)await caches.delete(k);}
  await self.clients.claim();
})());});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith((async()=>{
      try{const f=await fetch(r,{cache:'no-store'});if(f.ok){const c=await caches.open(APP);c.put(r,f.clone());}return f;}
      catch(err){const m=await caches.match(r)||await caches.match('./');if(m)return m;throw err;}
    })());
    return;
  }
  if(/deezer|dzcdn|scdn\.co|mzstatic/.test(u.host)){
    e.respondWith((async()=>{
      const c=await caches.open(IMG),m=await c.match(r);if(m)return m;
      try{const f=await fetch(r);if(f.ok||f.type==='opaque')c.put(r,f.clone());return f;}catch(err){throw err;}
    })());
  }
});
