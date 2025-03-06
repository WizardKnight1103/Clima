const CACHE_NAME = 'app-cache-v6'; // Incrementa la versión del caché
const URLS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './icons/Limpio.json',
    './icons/Lluvia.json',
    './icons/Nublado.json',
    './icons/Nieve.json',
    './icons/Parcialmente-Nublado.json',
    './icons/Tormenta.json',
    './icons/cargar.png',
    './manifest.json',
];

self.addEventListener('install', event => {
    console.log('Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            let cachePromises = URLS_TO_CACHE.map(async url => {
                try {
                    let response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return cache.put(url, response);
                } catch (error) {
                    console.error(`Error cacheando ${url}:`, error);
                }
            });

            return Promise.all(cachePromises);
        })
    );
});

// Activación del Service Worker y limpieza de caché antigua
self.addEventListener('activate', event => {
    console.log('Service Worker activado.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interceptar solicitudes y servir desde caché primero
self.addEventListener('fetch', event => {
    console.log('Fetch solicitado para:', event.request.url);

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Sirviendo desde caché:', event.request.url);
                    return response;
                }
                return fetch(event.request).then(fetchResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
            .catch(() => caches.match('./index.html')) 
    );
});

// Manejar mensajes para mostrar notificaciones
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification("¡No te pierdas el pronóstico!", {
            body: "Mantente al día con el clima. ¿Listo para saber si necesitas un paraguas o unas gafas de sol? ¡Entra ahora!",
            icon: "./img/icon2.png"
        });
    }
});