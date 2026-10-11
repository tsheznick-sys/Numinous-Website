/* Numinous same-origin cache and offline resilience.
 *
 * The Whop edge remains the shared CDN. This worker adds only a browser-local
 * cache: public documents are network-first, assets obey their response TTL,
 * and checkout, API, and transaction-return requests are never intercepted.
 *
 * The tested video origin advertises ranges but answers them with a full 200.
 * This worker converts that stream to 206 without waiting for a whole-file
 * arrayBuffer. Immutable full videos are cached in the background for later
 * seeks; mutable assets are evicted when their origin max-age expires.
 */
const ASSETS = "numinous-assets-v3";
const PAGES = "numinous-pages-v4";
const CACHE_STAMP = "x-numinous-stored-at";
const MAX_RANGE_CACHE_BYTES = 12_000_000;
const FONTS = [
	"/fonts/Cinzel-400-latin.woff2",
	"/fonts/Cinzel-700-latin.woff2",
	"/fonts/Cinzel-900-latin.woff2",
	"/fonts/CormorantGaramond-400-latin.woff2",
	"/fonts/CormorantGaramond-400i-latin.woff2",
	"/fonts/CormorantGaramond-500-latin.woff2",
	"/fonts/CormorantGaramond-500i-latin.woff2",
	"/fonts/CormorantGaramond-600-latin.woff2",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(ASSETS);
			await Promise.all(
				FONTS.map(async (path) => {
					const request = new Request(new URL(path, self.location.origin));
					try {
						await cacheAsset(cache, request, await fetch(request));
					} catch {
						// A font miss must not prevent the worker from installing.
					}
				}),
			);
		})(),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(key) =>
							((key.startsWith("numinous-assets-") && key !== ASSETS) ||
								(key.startsWith("numinous-pages-") && key !== PAGES)),
						)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

function isAssetPath(pathname) {
	return pathname.startsWith("/assets/") || pathname.startsWith("/fonts/");
}

function isVideoPath(pathname) {
	return (
		pathname.startsWith("/assets/briefing/films/") &&
		pathname.endsWith(".mp4")
	);
}

function assetTtlMs(response) {
	const control = (response.headers.get("cache-control") || "").toLowerCase();
	if (/(?:^|,)\s*(?:no-store|private)(?:\s*(?:=|,|$))/i.test(control)) {
		return 0;
	}
	if (/(?:^|,)\s*immutable(?:\s*(?:,|$))/i.test(control)) {
		return Number.POSITIVE_INFINITY;
	}
	const maxAge = /(?:^|,)\s*max-age=(\d+)/i.exec(control);
	return maxAge ? Number(maxAge[1]) * 1000 : 0;
}

function isPublicImmutableAsset(response) {
	const control = (response.headers.get("cache-control") || "").toLowerCase();
	return (
		response.ok &&
		/(?:^|,)\s*public(?:\s*(?:,|$))/i.test(control) &&
		assetTtlMs(response) === Number.POSITIVE_INFINITY
	);
}

async function cacheAsset(cache, request, response) {
	if (!response || !response.ok || assetTtlMs(response) <= 0) return;
	const stored = response.clone();
	const headers = new Headers(stored.headers);
	headers.set(CACHE_STAMP, String(Date.now()));
	await cache.put(
		request,
		new Response(stored.body, {
			status: stored.status,
			statusText: stored.statusText,
			headers,
		}),
	);
}

function markedResponse(response, marker, removeStamp = false) {
	if (
		!response ||
		response.type === "opaque" ||
		response.type === "opaqueredirect" ||
		response.status === 304
	) {
		return response;
	}
	const headers = new Headers(response.headers);
	if (removeStamp) headers.delete(CACHE_STAMP);
	if (marker) headers.set("x-served-by", marker);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

async function cacheFirst(request, event) {
	const cache = await caches.open(ASSETS);
	const hit = await cache.match(request, { ignoreVary: true });
	if (hit) {
		const ttl = assetTtlMs(hit);
		const storedAt = Number(hit.headers.get(CACHE_STAMP));
		const fresh =
			ttl === Number.POSITIVE_INFINITY ||
			(ttl > 0 && Number.isFinite(storedAt) && storedAt > 0 && Date.now() - storedAt < ttl);
		if (fresh) return markedResponse(hit, "sw-cache", true);
		await cache.delete(request);
	}

	const fresh = await fetch(request);
	if (fresh && fresh.ok && assetTtlMs(fresh) > 0) {
		event.waitUntil(cacheAsset(cache, request, fresh).catch(() => {}));
	}
	return markedResponse(fresh, "sw-network");
}

function parseByteRange(header, total) {
	const match = /^bytes=(\d*)-(\d*)$/i.exec(header.trim());
	if (!match || (!match[1] && !match[2])) return null;

	let start;
	let end;
	if (!match[1]) {
		const suffix = Number(match[2]);
		if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
		start = Math.max(total - suffix, 0);
		end = total - 1;
	} else {
		start = Number(match[1]);
		end = match[2] ? Number(match[2]) : total - 1;
		if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
	}

	if (start < 0 || end < start || start >= total) {
		return { unsatisfiable: true };
	}
	return { start, end: Math.min(end, total - 1) };
}

function sliceStream(body, start, end) {
	const reader = body.getReader();
	let offset = 0;
	return new ReadableStream({
		async pull(controller) {
			try {
				while (offset <= end) {
					const { done, value } = await reader.read();
					if (done) {
						controller.close();
						return;
					}
					const chunkStart = offset;
					offset += value.byteLength;
					const from = Math.max(0, start - chunkStart);
					const to = Math.min(value.byteLength, end + 1 - chunkStart);
					if (to > from) controller.enqueue(value.subarray(from, to));
					if (offset > end) {
						controller.close();
						void reader.cancel().catch(() => {});
						return;
					}
				}
				controller.close();
			} catch (error) {
				controller.error(error);
			}
		},
		cancel(reason) {
			return reader.cancel(reason);
		},
	});
}

function rangeNotSatisfiable(total) {
	return new Response(null, {
		status: 416,
		headers: { "Content-Range": `bytes */${total}`, "Accept-Ranges": "bytes" },
	});
}

function ifRangeMatches(request, full) {
	const validator = request.headers.get("if-range");
	if (!validator) return true;
	return validator === full.headers.get("etag") || validator === full.headers.get("last-modified");
}

function makeRangeResponse(full, range, total, marker) {
	const headers = new Headers(full.headers);
	headers.delete(CACHE_STAMP);
	headers.set("Content-Range", `bytes ${range.start}-${range.end}/${total}`);
	headers.set("Content-Length", String(range.end - range.start + 1));
	headers.set("Accept-Ranges", "bytes");
	headers.set("x-served-by", marker);
	return new Response(sliceStream(full.body, range.start, range.end), {
		status: 206,
		headers,
	});
}

async function rangeResponse(request, event) {
	const url = new URL(request.url);
	const cache = await caches.open(ASSETS);
	let full = await cache.match(url.href, { ignoreVary: true });
	if (full && !isPublicImmutableAsset(full)) {
		await cache.delete(url.href);
		full = undefined;
	}

	if (full) {
		if (!ifRangeMatches(request, full)) return markedResponse(full, "sw-range-full");
		const total = Number(full.headers.get("content-length"));
		if (!Number.isSafeInteger(total) || total < 0 || !full.body) {
			return markedResponse(full, "sw-range-full");
		}
		const range = parseByteRange(request.headers.get("range") || "", total);
		if (!range) return markedResponse(full, "sw-range-full");
		if (range.unsatisfiable) return rangeNotSatisfiable(total);
		return makeRangeResponse(full, range, total, "sw-range-cache");
	}

	const fresh = await fetch(request);
	if (!fresh || !fresh.ok || fresh.status !== 200 || !fresh.body) {
		return fresh;
	}
	const total = Number(fresh.headers.get("content-length"));
	if (!Number.isSafeInteger(total) || total < 0) return fresh;
	const range = parseByteRange(request.headers.get("range") || "", total);
	if (!range) return fresh;
	if (range.unsatisfiable) return rangeNotSatisfiable(total);

	if (isPublicImmutableAsset(fresh) && total <= MAX_RANGE_CACHE_BYTES) {
		event.waitUntil(cache.put(url.href, fresh.clone()).catch(() => {}));
	}
	return makeRangeResponse(fresh, range, total, "sw-range-stream");
}

function isPublicDocument(response) {
	const control = (response.headers.get("cache-control") || "").toLowerCase();
	if (!response.ok || /(?:^|,)\s*(?:no-store|private)(?:\s*(?:=|,|$))/i.test(control)) {
		return false;
	}
	return /(?:^|,)\s*public(?:\s*(?:,|$))/i.test(control);
}

async function networkFirstDocument(request, event) {
	const cache = await caches.open(PAGES);
	try {
		const fresh = await fetch(request);
		if (fresh && fresh.type === "opaqueredirect") return fresh;
		if (isPublicDocument(fresh)) {
			event.waitUntil(cache.put(request, fresh.clone()).catch(() => {}));
		}
		return markedResponse(fresh, "sw-doc");
	} catch (error) {
		const hit = await cache.match(request, { ignoreVary: true });
		if (hit) return markedResponse(hit, "sw-offline");
		throw error;
	}
}

self.addEventListener("fetch", (event) => {
	const request = event.request;
	if (request.method !== "GET") return;
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;
	if (url.pathname.startsWith("/api/")) return;
	if (url.pathname.startsWith("/checkout/")) return;
	if (url.pathname === "/order-complete" || url.pathname.startsWith("/order-complete/")) return;
	if (url.pathname === "/sw.js") return;

	if (request.headers.get("range")) {
		if (isVideoPath(url.pathname)) {
			event.respondWith(rangeResponse(request, event));
		}
		return;
	}
	if (isAssetPath(url.pathname)) {
		event.respondWith(cacheFirst(request, event));
		return;
	}
	if (request.mode === "navigate") {
		event.respondWith(networkFirstDocument(request, event));
	}
});
