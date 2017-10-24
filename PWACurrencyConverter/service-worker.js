var dataCacheName = 'currencyData-v1';
var cacheName = 'currencyPWA-1';
var filesToCache = [
  '/',
  '/PWACurrencyConverter/index.htm',
  '/PWACurrencyConverter/favicon.ico',
  '/PWACurrencyConverter/js/app.js',
  '/PWACurrencyConverter/js/phonon.min.js',
  '/PWACurrencyConverter/css/phonon.min.css',
  '/PWACurrencyConverter/fonts/material-design-icons.eot',
  '/PWACurrencyConverter/fonts/material-design-icons.svg',
  '/PWACurrencyConverter/fonts/material-design-icons.ttf',
  '/PWACurrencyConverter/fonts/material-design-icons.woff',
  '/PWACurrencyConverter/img/icon-128x128.png',
  '/PWACurrencyConverter/img/icon-144x144.png',
  '/PWACurrencyConverter/img/icon-152x152.png',
  '/PWACurrencyConverter/img/icon-192x192.png',
  '/PWACurrencyConverter/img/icon-256x256.png',
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
      caches.open(cacheName).then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
      })
    );
  });

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== cacheName && key !== dataCacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
    );
    
    return self.clients.claim();
  });

  self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://api.fixer.io/latest?base=USD ';
    if (e.request.url.indexOf(dataUrl) > -1) {
      e.respondWith(
        caches.open(dataCacheName).then(function(cache) {
          return fetch(e.request).then(function(response){
            cache.put(e.request.url, response.clone());
            return response;
          });
        })
      );
    } else {
      e.respondWith(
        caches.match(e.request).then(function(response) {
          return response || fetch(e.request);
        })
      );
    }
  });