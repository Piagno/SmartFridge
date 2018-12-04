// This script is the service worker. The service worker is responsible for caching network results, for a seamless offline and better "bad connection" experience.
// The source is: https://serviceworke.rs/strategy-cache-and-update.html
var CACHE = 'hardCache'

self.addEventListener('install', function(evt){
	console.log('The service worker is being installed.')
	evt.waitUntil(precache())
})

self.addEventListener('fetch', function(evt){
	console.log('The service worker is serving the asset.')
	evt.respondWith(fromCache(evt.request))
	evt.waitUntil(update(evt.request))
})

function precache() {
	return caches.open(CACHE).then(function (cache){
		return cache.addAll([
			'./',
			'./index.html',
			'./manifest.json',
			'./service-worker.js',
			'./connector.js',
			'./logic.js',
			'./assets/favicon.png',
			'./assets/Logo.svg',
			'./assets/logo_192.png'
		])
	})
}

function fromCache(request) {
	return caches.open(CACHE).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject('no-match')
		})
	})
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response)
    })
  })
}