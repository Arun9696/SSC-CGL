// Cache version — increment this to force update on all devices
const CACHE_VERSION = 'ssc-cgl-v' + Date.now();
const CACHE_NAME = CACHE_VERSION;

// On install — cache nothing, just activate immediately
self.addEventListener('install', function(e){
  self.skipWaiting(); // activate immediately
});

// On activate — delete ALL old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.map(function(k){ 
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k); 
        })
      );
    }).then(function(){
      return self.clients.claim(); // take control immediately
    })
  );
});

// Fetch — NETWORK FIRST, fallback to cache
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(function(r){
        // Cache fresh copy
        if(r && r.status === 200){
          var clone = r.clone();
          caches.open(CACHE_NAME).then(function(cache){ 
            cache.put(e.request, clone); 
          });
        }
        return r;
      })
      .catch(function(){
        // Offline fallback
        return caches.match(e.request);
      })
  );
});
