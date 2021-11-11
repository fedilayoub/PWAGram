var STATIC_KEY = 'static-v4';
var DYNAMIC_KEY = 'dynamic-v2';
self.addEventListener('install',function(event){
    console.log('[Service Worker]installing service worker ...',event);
    event.waitUntil( /* we added waitUntil() because SW works with async
     code because it runs in the bg and it's event driven */
        caches.open(STATIC_KEY) //caches.open() tries to open the chache, if it doesn't exist, it will create it
            .then( function(cache) { 
                // Remember: just slash is a different request(URL) we need to cache it too
              return  cache.addAll([
                '/', 
                '/index.html',
                '/offline.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/promise.js',
                '/src/js/fetch.js',
                '/src/js/material.min.js',
                '/src/css/feed.css',
                '/src/css/app.css',
                '/src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]); 
                            }
                )
        );
});
self.addEventListener('activate',function(event){
    console.log('[Service Worker]activating service worker ...',event);
    event.waitUntil(
        caches.keys().then(keyList => {
            // Promise.all() transforms the strings arrayto promises array
            return Promise.all(keyList.map(key =>
                {  
                if(key !== STATIC_KEY  && key !== DYNAMIC_KEY){
                    console.log('[service worker] removing old cache', key);
                    return caches.delete(key)
                }
            }))
        })
    )
    return self.clients.claim();

});
 /* there is cache and caches, caches refers to the overall cache storage,
         it allows us to open sub-cache and also call the match() methode*/
          // the key of cache is resuest, never a string
          // we intercept the request and see if it's available in cache, if not the response will be null
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== STATIC_KEY && key !== DYNAMIC_KEY) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(DYNAMIC_KEY)
                  .then(function(cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function(err) {
                return caches.open(STATIC_KEY)
                  .then(function(cache) {
                    return cache.match('/offline.html'); //in case we didn't cache assets yes 
                  });
              });
          }
        })
    );
  });
//if the request doesn't exist we return the request fetch
/* res (response in general) is consumed once then it will be empty that's why we use res.clone(), it stores a clone of res in cache  */
/* if we didn't return both returns we gonna make the request, intercept it,store cache but never give the response back to the HTML file
 it would succeed next time we try because then it'would be in cache but directly loading it from the network would never work*/