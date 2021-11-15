// importing idb package
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');


const STATIC_CACHE = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v2';
const STATIC_ASSETS = [
  '/', 
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/feed.css',
  '/src/css/app.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
  ];

// this function allows deleting assets in dynamic cache and keep it strict to certain length
  // const trimCache = (cacheName,maxItems) =>{
  //   caches.open(cacheName)
  //   .then(cache => {
  //      return cache.keys()
  //      .then(keys =>{
  //        if(keys.length > maxItems){
  //          cache.delete(keys[0])
  //          .then( ()=>trimCache(cacheName,maxItems));
  //        }
  //      })
  //   })
  // }

self.addEventListener('install',function(event){
    console.log('[Service Worker]installing service worker ...',event);
    event.waitUntil( /* we added waitUntil() because SW works with async
     code because it runs in the bg and it's event driven */
        caches.open(STATIC_CACHE) //caches.open() tries to open the cache, if it doesn't exist, it will create it
            .then( function(cache) { 
                // Remember: just slash is a different request(URL) we need to cache it too
              return  cache.addAll(STATIC_ASSETS); 
                            }
                )
        );
});
self.addEventListener('activate',function(event){
    console.log('[Service Worker]activating service worker ...',event);
    event.waitUntil(
        caches.keys().then(keyList => {
            // Promise.all() transforms the strings array to promises array
            return Promise.all(keyList.map(key =>
                {  
                if(key !== STATIC_CACHE  && key !== DYNAMIC_CACHE){
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
          // the key of cache is request, never a string
          // we intercept the request and see if it's available in cache, if not the response will be null

 //cache then nework 
  // self.addEventListener('fetch', function(event) {
  //   event.respondWith(
  //     caches.match(event.request)
  //       .then(function(response) {
  //         if (response) {
  //           return response;
  //         } else {
  //           return fetch(event.request)
  //             .then(function(res) {
  //               return caches.open(DYNAMIC_CACHE)
  //                 .then(function(cache) {
  //                   cache.put(event.request.url, res.clone());
  //                   return res;
  //                 })
  //             })
  //             .catch(function(err) {
  //               return caches.open(STATIC_CACHE)
  //                 .then(function(cache) {
  //                   return cache.match('/offline.html'); //in case we didn't cache assets yes we need a fallback page.
  //                 });
  //             });
  //         }
  //       })
  //   );
  // });
  const isInArray = (string,array)=>{
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
      console.log('matched ', string);
      cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
      cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
  }


  self.addEventListener('fetch', function(event) {
    let url = 'https://pwagram-85170-default-rtdb.firebaseio.com/posts';
    //cache then network
    if(event.request.url.indexOf(url) > -1){ 
      event.respondWith(
            fetch(event.request)
        .then(res => {
          let clonedRes = res.clone();
          clearAllData('posts')
          .then(()=>{
           return  clonedRes.json();
         
          }) .then(data=>{
            for (let key in data){
             writeData('posts',data[key])
            }
          })
          return res;
        })
      )
  } else if (isInArray(event.request.url, STATIC_ASSETS) ){
    //cache only
    event.respondWith(
          caches.match(event.request)
        );
  }
  else{
    //cache with network fallback
    event.respondWith(       
       caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    // trimCache(DYNAMIC_CACHE,3);
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function(err) {
                return caches.open(STATIC_CACHE)
                  .then(function(cache) {
                    if(event.request.url.indexOf('/help')){ //it doesn't make sense to replace a CSS file with offline.html file
                      return cache.match('/offline.html'); //in case we didn't cache assets yes we need a fallback page.
                    }
                  });
              });
          }
        })
        );
  }
  });

  //Network with cache fallback and dynamic caching
  //   self.addEventListener('fetch', function(event) {
  //   event.respondWith(
  //     fetch(event.request)
  //     .then( res =>{
  //      return  caches.open(DYNAMIC_CACHE)
  //       .then(cache => {
  //         cache.put(event.request.url, res.clone());
  //         return res;
  //       })
  //     }
  //     )
  //     .catch( err =>{
  //         return caches.match(event.request) 
  //       })
  //   );
  // });
  //cache only strategy
  // self.addEventListener('fetch', function(event) {
  //   event.respondWith(
  //     caches.match(event.request)
  //   );
  // });
  //Network only
  // self.addEventListener('fetch', function(event) {
  //   event.respondWith(
  //    fetch(event.request)
  //   );
  // });
//if the request doesn't exist we return the request fetch
/* res (response in general) is consumed once, then it will be empty, that's why we use res.clone(), it stores a clone of res in cache  */
/* if we didn't return both returns we gonna make the request, intercept it,store cache but never give the response back to the HTML file
 it would succeed next time we try because then it'would be in cache but directly loading it from the network would never work*/