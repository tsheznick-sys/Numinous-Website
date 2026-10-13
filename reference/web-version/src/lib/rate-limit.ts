// Best-effort rate limiting for the site's first-party server endpoints.
//
// Honest scope: the Whop runtime runs this app as a Cloudflare Worker, so
// every isolate keeps its own counters and the platform edge enforces its
// own global protections on top. This layer exists so a flood from a single
// address degrades gracefully before that, and so abusive POSTs never reach
// Whop's API. See INFRASTRUCTURE-BLUEPRINT.md for the full ownership map.

export type RateTier = "strict" | "standard" | "loose";

const TIERS: Record<RateTier, { limit: number; windowMs: number }> = {
	// Form posts and anything that can create state.
	strict: { limit: 5, windowMs: 60_000 },
	// Whop-backed data reads (order previews).
	standard: { limit: 30, windowMs: 60_000 },
	// Fire-and-forget intake (client error beacons, one-shot per page).
	loose: { limit: 120, windowMs: 60_000 },
};

const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_TRACKED = 10_000;

export function clientIp(request: Request): string {
	const fwd =
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
	return fwd || "unknown";
}

// Non-reversible fingerprint for logs: an address can be compared across
// attempts without ever being stored.
export function ipFingerprint(request: Request): string {
	const raw = clientIp(request);
	let hash = 0x811c9dc5;
	for (let i = 0; i < raw.length; i++) {
		hash ^= raw.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(36);
}

export function rateLimit(
	key: string,
	tier: RateTier = "standard",
): { ok: boolean; retryAfter: number } {
	const { limit, windowMs } = TIERS[tier];
	const now = Date.now();

	// Shed stale buckets; under memory pressure fail open rather than take
	// the whole endpoint down.
	if (buckets.size > MAX_TRACKED) {
		for (const [k, b] of buckets) {
			if (b.resetAt <= now) buckets.delete(k);
		}
		if (buckets.size > MAX_TRACKED) buckets.clear();
	}

	const bucketKey = `${tier}:${key}`;
	const bucket = buckets.get(bucketKey);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
		return { ok: true, retryAfter: 0 };
	}
	bucket.count += 1;
	if (bucket.count > limit) {
		return {
			ok: false,
			retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
		};
	}
	return { ok: true, retryAfter: 0 };
}
