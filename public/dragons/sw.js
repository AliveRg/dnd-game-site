// Only offline notice and icons are cached; never HTML containing session/user data, API, or forms.
const CACHE='dragons-static-v1'
const STATIC=['/dragons/offline.html','/dragons/icon-192.png','/dragons/icon-512.png','/dragons/icon-180.png']
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)));self.skipWaiting()})
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('dragons-static-')&&key!==CACHE).map(key=>caches.delete(key)))))})
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url)
 if(url.origin!==self.location.origin||event.request.method!=='GET'||url.pathname.startsWith('/api/'))return
 if(STATIC.includes(url.pathname)){event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));return}
 if(event.request.mode==='navigate'&&(url.pathname==='/dragons'||url.pathname.startsWith('/dragons/')))event.respondWith(fetch(event.request).catch(()=>caches.match('/dragons/offline.html')))
})
