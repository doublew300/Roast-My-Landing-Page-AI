
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through for now. 
    // For full offline support, we would cache assets here.
    // This satisfies the PWA "Service Worker" requirement.
});
