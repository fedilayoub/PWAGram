self.addEventListener('install',function(event){
    console.log('[Service Worker]installing service worker ...',event);
});
self.addEventListener('activate',function(event){
    console.log('[Service Worker]activating service worker ...',event);
    return self.clients.claim();

});
self.addEventListener('fetch',function(event){
    console.log('[Service Worker]fetching something ...',event);
    event.respondWith(fetch(event.request));
})