import type { Paginated } from "@whop/template-kit";
import Whop from "@whop/sdk";
import { getRequest } from "@tanstack/react-start/server";

// Nothing in here may be reached from a route's module scope. A loader runs in
// the browser on client-side navigation, so anything touching node:fs or
// process has to sit behind a createServerFn handler - otherwise the first link
// click throws and only a refresh recovers.

// Short, bounded per-isolate deduplication for public product and plan reads.
// Transaction and member data must never enter this cache.
type PublicReadEntry = {
	expiresAt: number;
	promise: Promise<unknown>;
};

const PUBLIC_READ_TTL_MS = 10_000;
const PUBLIC_READ_MAX_ENTRIES = 48;
const publicReadCache = new Map<string, PublicReadEntry>();
const EDGE_READ_CACHE_CONTROL = "public, max-age=0, s-maxage=10";

type EdgeCacheTarget = { cache: Cache; request: Request };

function edgeCacheTarget(key: string): EdgeCacheTarget | null {
	try {
		const cacheStorage = (
			globalThis as typeof globalThis & {
				caches?: CacheStorage & { default?: Cache };
			}
		).caches;
		const cache = cacheStorage?.default;
		if (!cache) return null;

		const request = getRequest();
		const cacheUrl = new URL(
			`/_numinous_edge_cache/v1/${encodeURIComponent(key)}`,
			request.url,
		);
		return { cache, request: new Request(cacheUrl, { method: "GET" }) };
	} catch {
		return null;
	}
}

async function readPublicDataCache<T>(
	key: string,
	load: () => Promise<T>,
): Promise<T> {
	const target = edgeCacheTarget(key);
	if (target) {
		try {
			const hit = await target.cache.match(target.request);
			if (hit) {
				const envelope = (await hit.json()) as {
					expiresAt?: number;
					value?: T;
				};
				if (
					typeof envelope.expiresAt === "number" &&
					envelope.expiresAt > Date.now()
				) {
					return envelope.value as T;
				}
				await target.cache.delete(target.request);
			}
		} catch {
			// The per-isolate cache and live Whop read remain the safe fallback.
		}
	}

	const value = await load();
	if (target) {
		try {
			const body = JSON.stringify({
				expiresAt: Date.now() + PUBLIC_READ_TTL_MS,
				value,
			});
			if (body) {
				await target.cache.put(
					target.request,
					new Response(body, {
						headers: {
							"Cache-Control": EDGE_READ_CACHE_CONTROL,
							"Content-Type": "application/json; charset=utf-8",
						},
					}),
				);
			}
		} catch {
			// Edge cache writes are best-effort and contain public catalog data only.
		}
	}
	return value;
}

function rememberPublicRead<T>(key: string, load: () => Promise<T>): Promise<T> {
	const now = Date.now();
	const existing = publicReadCache.get(key);
	if (existing && (existing.expiresAt === 0 || existing.expiresAt > now)) {
		publicReadCache.delete(key);
		publicReadCache.set(key, existing);
		return existing.promise as Promise<T>;
	}
	if (existing) publicReadCache.delete(key);

	let entry!: PublicReadEntry;
	const promise = Promise.resolve()
		.then(() => readPublicDataCache(key, load))
		.then(
			(value) => {
				if (publicReadCache.get(key) === entry) {
					entry.expiresAt = Date.now() + PUBLIC_READ_TTL_MS;
				}
				return value;
			},
			(error: unknown) => {
				if (publicReadCache.get(key) === entry) publicReadCache.delete(key);
				throw error;
			},
		);
	entry = { expiresAt: 0, promise };
	publicReadCache.set(key, entry);
	while (publicReadCache.size > PUBLIC_READ_MAX_ENTRIES) {
		const oldest = publicReadCache.keys().next().value;
		if (typeof oldest !== "string") break;
		publicReadCache.delete(oldest);
	}
	return promise;
}

function whopClient(): Whop {
	return new Whop({
		apiKey: process.env.NUMINOUS_WHOP_API_KEY,
		baseURL: `${process.env.WHOP_API_ORIGIN ?? "https://api.whop.com"}/api/v1`,
	});
}

// The SDK's page type only declares `end_cursor`, but template-kit's Paginated
// wants the full page_info. The API sends the other fields; fill them in from
// the untyped response with safe fallbacks.
function toPaginated<T>(page: {
	data: T[];
	page_info: { end_cursor?: string };
}): { data: T[]; page_info: Paginated<T>["page_info"] } {
	const info = page.page_info as Partial<Paginated<T>["page_info"]>;
	return {
		data: page.data,
		page_info: {
			has_next_page: info.has_next_page ?? Boolean(info.end_cursor),
			has_previous_page: info.has_previous_page ?? false,
			start_cursor: info.start_cursor ?? null,
			end_cursor: info.end_cursor ?? null,
		},
	};
}

type ListProductsParams = Parameters<Whop["products"]["list"]>[0];
type ListPlansParams = Parameters<Whop["plans"]["list"]>[0];

export const serverAPI = {
	listProducts: async (params: ListProductsParams) =>
		toPaginated(await whopClient().products.list(params ?? {})),
	retrieveProduct: ({ product_id }: { product_id: string }) =>
		rememberPublicRead(
			`product:${storefrontAccountId()}:${product_id}`,
			() => whopClient().products.retrieve(product_id),
		),
	listPlans: async (params: ListPlansParams) =>
		toPaginated(await whopClient().plans.list(params ?? {})),
	retrievePlan: ({ plan_id }: { plan_id: string }) =>
		whopClient().plans.retrieve(plan_id),
};

type ListedProduct = Awaited<
	ReturnType<(typeof serverAPI)["listProducts"]>
>["data"][number];
type ListedPlan = Awaited<
	ReturnType<(typeof serverAPI)["listPlans"]>
>["data"][number];

// The SDK's list promises paginate themselves under `for await`, so these
// return the whole catalog. A grid or a slug lookup built on one page starts
// 404ing the moment the store outgrows the page size.
//
// Only `visible` products: the account can also hold hidden or archived ones,
// and a shopper reaching those through a grid or a product URL is a leak.
export async function listAllProducts(
	accountId: string,
): Promise<ListedProduct[]> {
	const products = await rememberPublicRead(
		`products:${accountId}`,
		async () => {
			const rows: ListedProduct[] = [];
			for await (const product of whopClient().products.list({
				account_id: accountId,
				visibilities: ["visible"],
			})) {
				rows.push(product);
			}
			return rows;
		},
	);
	return [...products];
}

export async function listAllPlans(
	accountId: string,
	productIds: string[],
): Promise<ListedPlan[]> {
	const ids = [...new Set(productIds)].sort();
	if (ids.length === 0) return [];
	const plans = await rememberPublicRead(
		`plans:${accountId}:${ids.join(",")}`,
		async () => {
			const rows: ListedPlan[] = [];
			for await (const plan of whopClient().plans.list({
				account_id: accountId,
				product_ids: ids,
				visibilities: ["visible"],
			})) {
				rows.push(plan);
			}
			return rows;
		},
	);
	return [...plans];
}

// API order is not price order, so the first plan back is an arbitrary variant.
// Storefront tiles and the product page both advertise a "from" price, so both
// pick the cheapest - otherwise the page shows one amount and charges another.
// Compare by the price a shopper actually pays to stay: the renewal when the
// plan renews, otherwise the initial price. Sorting by initial_price alone
// ties every trial plan at $0 and picks an arbitrary variant.
function effectivePrice(plan: {
	initial_price?: number;
	renewal_price?: number;
}): number {
	if (typeof plan.renewal_price === "number" && plan.renewal_price > 0) {
		return plan.renewal_price;
	}
	return typeof plan.initial_price === "number" ? plan.initial_price : 0;
}

export function cheapestPlan<
	T extends { initial_price?: number; renewal_price?: number },
>(plans: T[]): T | undefined {
	return plans.reduce<T | undefined>((cheapest, plan) => {
		if (!cheapest) return plan;
		return effectivePrice(plan) < effectivePrice(cheapest) ? plan : cheapest;
	}, undefined);
}

export function storefrontAccountId(): string {
	const accountId =
		process.env.WHOP_ACCOUNT_ID ??
		process.env.WHOP_COMPANY_ID ??
		process.env.COMPANY_ID;
	if (!accountId) {
		throw new Error(
			"WHOP_ACCOUNT_ID is not set. Whop hosting and `whop apps dev` provide it; when running the server any other way, set it to the store's biz_ id so storefront routes can load products.",
		);
	}
	return accountId;
}
