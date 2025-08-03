// Service Worker for BorrowHub PWA
// Implements caching strategies for performance optimization

const CACHE_NAME = 'borrowhub-v1.0.0';
const STATIC_CACHE_NAME = 'borrowhub-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'borrowhub-dynamic-v1.0.0';
const API_CACHE_NAME = 'borrowhub-api-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // We'll create this fallback page
  // Assets will be added dynamically by build process
];

// API endpoints to cache with specific strategies
const API_ENDPOINTS = [
  '/api/items',
  '/items',
  '/api/profile',
  '/profile'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first', 
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static asset
function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/);
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

// Check if request is for image
function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/);
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    // Return fallback if available
    const cache = await caches.open(STATIC_CACHE_NAME);
    return cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache...');
    
    // Fallback to cache for GET requests
    if (request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline response for failed API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature is not available offline' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle images with stale-while-revalidate strategy
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background for revalidation
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors for background updates
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  try {
    return await fetchPromise;
  } catch (error) {
    // Return placeholder image for failed image loads
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle dynamic requests (HTML pages) with network-first
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for dynamic request, trying cache...');
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  console.log('[SW] Performing background sync...');
  
  // Here you could retry failed API requests
  // For now, we'll just clean up old cache entries
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove old entries (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (responseDate < oneHourAgo) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Message handling for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(event.data.url));
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Update specific cache entry
async function updateCache(url) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = await fetch(url);
    
    if (response.status === 200) {
      await cache.put(url, response);
      console.log('[SW] Cache updated for:', url);
    }
  } catch (error) {
    console.error('[SW] Cache update failed for:', url, error);
  }
}

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupCaches());
  }
});

// Clean up old cache entries
async function cleanupCaches() {
  const cacheNames = [DYNAMIC_CACHE_NAME, API_CACHE_NAME];
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // Keep only the 50 most recent entries per cache
      if (requests.length > 50) {
        const requestsToDelete = requests.slice(0, requests.length - 50);
        await Promise.all(
          requestsToDelete.map(request => cache.delete(request))
        );
      }
    } catch (error) {
      console.error('[SW] Cache cleanup failed for:', cacheName, error);
    }
  }
}