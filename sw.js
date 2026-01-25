
const CACHE_NAME = 'school-late-record-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/lucide-react@^0.563.0',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/xlsx@^0.18.5'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Try to cache core assets. If some fail (like external CDNs with strict CORS),
      // the app might still work if online, but we attempt to cache what we can.
      // We use addAll but catch errors so one failure doesn't stop the whole installation.
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => console.warn('Failed to cache:', url, err));
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network first strategy for ESM modules and HTML to ensure fresh code,
  // falling back to cache if offline.
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            // Only cache valid http/https requests
            if(event.request.url.startsWith('http')) {
               cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
