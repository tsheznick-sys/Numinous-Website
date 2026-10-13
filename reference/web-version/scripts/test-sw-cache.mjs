import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const listeners = new Map();
const stores = new Map();
let now = 1_800_000_000_000;

class TestDate extends Date {
	static now() {
		return now;
	}
}

function cacheKey(request) {
	return typeof request === "string" ? request : request.url;
}

function cacheFor(name) {
	if (!stores.has(name)) {
		const records = new Map();
		stores.set(name, {
			async match(request) {
				return records.get(cacheKey(request))?.clone();
			},
			async put(request, response) {
				const body = [204, 205, 304].includes(response.status)
					? null
					: await response.arrayBuffer();
				records.set(
					cacheKey(request),
					new Response(body, {
						status: response.status,
						statusText: response.statusText,
						headers: response.headers,
					}),
				);
			},
			async delete(request) {
				return records.delete(cacheKey(request));
			},
			async keys() {
				return [...records.keys()];
			},
			records,
		});
	}
	return stores.get(name);
}

const cacheStorage = {
	open: async (name) => cacheFor(name),
	keys: async () => [...stores.keys()],
	delete: async (name) => stores.delete(name),
};

const self = {
	location: { origin: "https://site.test" },
	addEventListener(type, listener) {
		listeners.set(type, listener);
	},
	skipWaiting() {},
	clients: { claim: async () => {} },
};

let fetchAssetCount = 0;
let fetchVideoCount = 0;
let fetchDocumentCount = 0;
let videoBytesPulled = 0;
let releaseVideoBody;
const videoBodyGate = new Promise((resolve) => {
	releaseVideoBody = resolve;
});

function videoResponse() {
	const bytes = Uint8Array.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
	let offset = 0;
	const body = new ReadableStream({
		async pull(controller) {
			if (offset > 0) await videoBodyGate;
			if (offset >= bytes.length) {
				controller.close();
				return;
			}
			const chunk = bytes.slice(offset, offset + 2);
			controller.enqueue(chunk);
			offset += chunk.length;
			videoBytesPulled += chunk.length;
		},
	});
	return new Response(body, {
		status: 200,
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Length": String(bytes.length),
			"Content-Type": "video/mp4",
			ETag: '"video-v1"',
		},
	});
}

async function mockFetch(request) {
	const url = new URL(typeof request === "string" ? request : request.url);
	if (url.pathname.endsWith(".mp4")) {
		fetchVideoCount += 1;
		return videoResponse();
	}
	if (url.pathname === "/assets/signal.jpg") {
		fetchAssetCount += 1;
		return new Response("image", {
			headers: { "Cache-Control": "public, max-age=60" },
		});
	}
	fetchDocumentCount += 1;
	if (url.pathname === "/private-document") {
		return new Response("private", {
			headers: { "Cache-Control": "no-store" },
		});
	}
	return new Response("public page", {
		headers: {
			"Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=15",
			"Content-Type": "text/html; charset=utf-8",
		},
	});
}

runInNewContext(source, {
	self,
	caches: cacheStorage,
	fetch: mockFetch,
	Request,
	Response,
	Headers,
	ReadableStream,
	URL,
	Date: TestDate,
	Number,
	Math,
});

function dispatch(request) {
	let responsePromise;
	const pending = [];
	const event = {
		request,
		respondWith(value) {
			responsePromise = Promise.resolve(value);
		},
		waitUntil(value) {
			pending.push(Promise.resolve(value));
		},
	};
	listeners.get("fetch")(event);
	return { responsePromise, pending };
}

function request(path, { range, mode = "cors" } = {}) {
	const headers = new Headers();
	if (range) headers.set("Range", range);
	return {
		method: "GET",
		url: `https://site.test${path}`,
		headers,
		mode,
	};
}

const firstRange = dispatch(
	request("/assets/briefing/films/test.mp4", { range: "bytes=2-5" }),
);
assert.ok(firstRange.responsePromise, "video range request should be intercepted");
const firstResponse = await Promise.race([
	firstRange.responsePromise,
	new Promise((_, reject) =>
		setTimeout(() => reject(new Error("range response waited for the full video")), 150),
	),
]);
assert.ok(videoBytesPulled < 10, "range headers must return before the full video is read");
assert.equal(firstResponse.status, 206);
assert.equal(firstResponse.headers.get("content-range"), "bytes 2-5/10");
assert.equal(firstResponse.headers.get("content-length"), "4");
assert.equal(firstResponse.headers.get("x-served-by"), "sw-range-stream");
releaseVideoBody();
assert.deepEqual(
	[...new Uint8Array(await firstResponse.arrayBuffer())],
	[12, 13, 14, 15],
);
await Promise.all(firstRange.pending);
assert.equal(videoBytesPulled, 10, "the immutable full object should finish caching in the background");
assert.equal(fetchVideoCount, 1, "first range should make one upstream request");

const cachedRange = dispatch(
	request("/assets/briefing/films/test.mp4", { range: "bytes=6-8" }),
);
const cachedResponse = await cachedRange.responsePromise;
assert.equal(cachedResponse.status, 206);
assert.equal(cachedResponse.headers.get("content-range"), "bytes 6-8/10");
assert.equal(cachedResponse.headers.get("x-served-by"), "sw-range-cache");
assert.deepEqual(
	[...new Uint8Array(await cachedResponse.arrayBuffer())],
	[16, 17, 18],
);
assert.equal(fetchVideoCount, 1, "a later range should use the stored full object");

const badRange = dispatch(
	request("/assets/briefing/films/test.mp4", { range: "bytes=30-40" }),
);
const badResponse = await badRange.responsePromise;
assert.equal(badResponse.status, 416);
assert.equal(badResponse.headers.get("content-range"), "bytes */10");

const firstAsset = dispatch(request("/assets/signal.jpg"));
const firstAssetResponse = await firstAsset.responsePromise;
assert.equal(firstAssetResponse.headers.get("x-served-by"), "sw-network");
await Promise.all(firstAsset.pending);
const cachedAsset = dispatch(request("/assets/signal.jpg"));
const cachedAssetResponse = await cachedAsset.responsePromise;
assert.equal(cachedAssetResponse.headers.get("x-served-by"), "sw-cache");
assert.equal(fetchAssetCount, 1);
now += 61_000;
const expiredAsset = dispatch(request("/assets/signal.jpg"));
const expiredAssetResponse = await expiredAsset.responsePromise;
assert.equal(expiredAssetResponse.headers.get("x-served-by"), "sw-network");
assert.equal(fetchAssetCount, 2, "mutable assets should expire at origin max-age");
await Promise.all(expiredAsset.pending);

const publicPage = dispatch(request("/products/the-signal-e6", { mode: "navigate" }));
const publicPageResponse = await publicPage.responsePromise;
assert.equal(publicPageResponse.headers.get("x-served-by"), "sw-doc");
await Promise.all(publicPage.pending);
assert.ok(cacheFor("numinous-pages-v4").records.size === 1);

const privatePage = dispatch(request("/private-document", { mode: "navigate" }));
const privatePageResponse = await privatePage.responsePromise;
assert.equal(privatePageResponse.headers.get("x-served-by"), "sw-doc");
await Promise.all(privatePage.pending);
assert.equal(cacheFor("numinous-pages-v4").records.size, 1);

for (const path of [
	"/order-complete?status=success&payment_id=private",
	"/checkout/plan_test",
	"/api/health",
]) {
	const bypassed = dispatch(request(path, { mode: "navigate" }));
	assert.equal(bypassed.responsePromise, undefined, `${path} should bypass the worker`);
}

assert.equal(fetchDocumentCount, 2);
console.log("Service-worker cache and streaming-range checks passed.");
