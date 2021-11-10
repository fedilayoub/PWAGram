self.addEventListener('install',function(event){
    console.log('[Service Worker]installing service worker ...',event);
    event.waitUntil(
        caches.open('static')
            .then(cache => {
                console.log('[Service Worker] Precaching App shell');
                cache.add('/src/js/app.js');
            })
        );
});
self.addEventListener('activate',function(event){
    console.log('[Service Worker]activating service worker ...',event);
    return self.clients.claim();

});
self.addEventListener('fetch',function(event){
    event.respondWith(fetch(event.request));
})