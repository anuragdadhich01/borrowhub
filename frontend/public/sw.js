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

// Handle API requests with network-first strategy and enhanced retry logic
async function handleAPIRequest(request) {
  const maxRetries = 3;
  let retryCount = 0;
  const url = new URL(request.url);
  
  while (retryCount < maxRetries) {
    try {
      const networkResponse = await fetch(request.clone());
      
      // Handle specific HTTP status codes
      if (networkResponse.status === 503 || networkResponse.status === 502) {
        throw new Error(`Server temporarily unavailable: ${networkResponse.status}`);
      }
      
      // Cache successful GET responses
      if (networkResponse.status === 200 && request.method === 'GET') {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      retryCount++;
      console.log(`[SW] API request to ${url.pathname} failed (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount < maxRetries) {
        // Exponential backoff with jitter: wait 1s, 2s, 4s (±25% jitter)
        const baseDelay = Math.pow(2, retryCount) * 1000;
        const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
        const delay = baseDelay + jitter;
        
        console.log(`[SW] Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // All retries failed, try cache
      console.log('[SW] All retries failed, trying cache...');
      
      // Fallback to cache for GET requests
      if (request.method === 'GET') {
        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          // Add headers to indicate this is from cache
          const headers = new Headers(cachedResponse.headers);
          headers.set('X-Served-From-Cache', 'true');
          headers.set('X-Cache-Date', cachedResponse.headers.get('date') || 'unknown');
          headers.set('X-Network-Error', error.message);
          
          console.log(`[SW] Serving ${url.pathname} from cache due to network error`);
          
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: headers
          });
        }
      }
      
      // Return appropriate error response based on the endpoint
      const errorResponse = {
        error: 'NetworkError',
        message: getErrorMessage(url.pathname, error),
        offline: true,
        timestamp: new Date().toISOString(),
        retryCount: retryCount
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 
            'Content-Type': 'application/json',
            'X-Network-Error': 'true',
            'X-Retry-Count': retryCount.toString()
          }
        }
      );
    }
  }
}

// Get appropriate error message based on endpoint
function getErrorMessage(pathname, error) {
  if (pathname.includes('/health')) {
    return 'Health check failed. The service may be temporarily unavailable.';
  } else if (pathname.includes('/items')) {
    return 'Unable to load items. Please check your connection and try again.';
  } else if (pathname.includes('/auth') || pathname.includes('/login')) {
    return 'Authentication service is temporarily unavailable.';
  } else {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
}
        }),
        { 
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 
            'Content-Type': 'application/json',
            'X-Error-Type': 'network-failure'
          }
        }
      );
    }
  }
}

// Handle images with stale-while-revalidate strategy and retry logic
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background for revalidation with retry logic
  const fetchPromise = (async () => {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount < maxRetries) {
      try {
        const networkResponse = await fetch(request.clone());
        if (networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
        return networkResponse;
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        throw error;
      }
    }
  })().catch(() => {
    // Ignore network errors for background updates
    console.log('[SW] Background image fetch failed, using cache');
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  try {
    return await fetchPromise;
  } catch (error) {
    console.log('[SW] Image fetch failed:', error);
    // Return placeholder image for failed image loads
    return new Response(
      `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="14">
          Image Unavailable
        </text>
      </svg>`,
      { 
        headers: { 
          'Content-Type': 'image/svg+xml',
          'X-Fallback-Image': 'true'
        } 
      }
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

// Handle background sync for failed requests
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
    
    // Try to sync any pending offline actions
    await syncOfflineActions();
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    
    if (offlineActions.length > 0) {
      console.log(`[SW] Syncing ${offlineActions.length} offline actions...`);
      
      for (const action of offlineActions) {
        try {
          await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body
          });
          console.log('[SW] Successfully synced offline action:', action.type);
        } catch (error) {
          console.warn('[SW] Failed to sync offline action:', error);
          // Keep action for next sync attempt
          continue;
        }
      }
      
      // Clear synced actions
      localStorage.removeItem('offlineActions');
      
      // Notify main app about successful sync
      if (self.clients) {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'OFFLINE_SYNC_COMPLETE',
              count: offlineActions.length
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing offline actions:', error);
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