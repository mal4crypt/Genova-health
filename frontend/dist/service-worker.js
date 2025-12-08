// Service Worker for Progressive Web App
// Provides offline support, caching, and background sync

const CACHE_NAME = 'genova-health-v1';
const RUNTIME_CACHE = 'genova-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/src/assets/styles/global.css'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        }).then((cachesToDelete) => {
            return Promise.all(cachesToDelete.map((cacheToDelete) => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // API requests - network first, cache fallback
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Static assets - cache first, network fallback
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-prescriptions') {
        event.waitUntil(syncPrescriptions());
    } else if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncPrescriptions() {
    try {
        // Get pending prescription requests from IndexedDB
        const db = await openDatabase();
        const pendingRequests = await db.getAll('pendingPrescriptions');

        for (const request of pendingRequests) {
            try {
                const response = await fetch('http://localhost:5000/api/prescriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${request.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request.data)
                });

                if (response.ok) {
                    await db.delete('pendingPrescriptions', request.id);
                }
            } catch (error) {
                console.error('Failed to sync prescription:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function syncMessages() {
    try {
        const db = await openDatabase();
        const pendingMessages = await db.getAll('pendingMessages');

        for (const message of pendingMessages) {
            try {
                const response = await fetch(`http://localhost:5000/api/chat/${message.roomId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${message.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message.text })
                });

                if (response.ok) {
                    await db.delete('pendingMessages', message.id);
                }
            } catch (error) {
                console.error('Failed to sync message:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Genova Health',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Genova Health', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function to open IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('GenovaHealthDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('pendingPrescriptions')) {
                db.createObjectStore('pendingPrescriptions', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('pendingMessages')) {
                db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Periodic background sync (for medication reminders)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-medications') {
        event.waitUntil(checkMedicationReminders());
    }
});

async function checkMedicationReminders() {
    // Check if any medications are due
    // This would integrate with your medication reminder system
    console.log('Checking medication reminders...');
}

console.log('Service Worker loaded');
