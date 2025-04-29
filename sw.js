// 缓存名称
const CACHE_NAME = 'carbon-footprint-cache-v1';

// 需要缓存的资源
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/styles.css',
  '/script.js',
  '/login.js',
  '/register.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// 安装Service Worker并缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截请求，优先使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request).then(
          response => {
            // 检查是否是有效的响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是流，只能使用一次
            const responseToCache = response.clone();
            
            // 将新响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
});

// 激活Service Worker，清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 