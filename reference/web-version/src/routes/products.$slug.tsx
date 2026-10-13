import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ProductExperience } from "../components/product/ProductExperience";
import { displayTitle, SITE, shopProducts, sortWorks } from "../lib/site";
import { PUBLIC_DOCUMENT_CACHE_CONTROL } from "../lib/cache-policy";
import {
	formatPlanPrice,
	isFreePlan,
	matchesSlug,
	planPriceCents,
	planProductId,
	productSlug,
} from "../lib/storefront-account";
import {
	listAllPlans,
	listAllProducts,
	serverAPI,
	storefrontAccountId,
} from "../whop.server";

type PlanView = {
	id: string;
	title: string;
	description: string | null;
	priceLabel: string;
	priceCents: number;
	price: number;
	free: boolean;
	trialDays: number;
	billingPeriod: number | null;
	planType: string | null;
	stock: number | null;
	unlimitedStock: boolean;
};

type RelatedItem = {
	id: string;
	title: string;
	slug: string;
	image: string | null;
	priceLabel: string | null;
	headline: string | null;
};

type ProductView = {
	id: string;
	title: string;
	headline: string | null;
	description: string | null;
	image: string | null;
	video: string | null;
	slug: string;
	plans: PlanView[];
	related: RelatedItem[];
	gateNote: string | null;
};

const GATE_NOTES: Record<string, string> = {
	"The Signal":
		"Free forever. No card. The first vision waits in your library.",
	"The Numinary":
		"Seven nights. If the room does not name what you saw, message within seven nights of the first payment and the full amount returns. Keep what you received.",
};

function firstImage(
	gallery: { url?: string | null; content_type?: string | null }[] | undefined,
): string | null {
	if (!gallery?.length) return null;
	const still = gallery.find((item) =>
		(item.content_type ?? "").startsWith("image/"),
	);
	return still?.url ?? gallery[0]?.url ?? null;
}

function firstVideo(
	gallery: { url?: string | null; content_type?: string | null }[] | undefined,
): string | null {
	if (!gallery?.length) return null;
	const moving = gallery.find((item) =>
		(item.content_type ?? "").startsWith("video/"),
	);
	return moving?.url ?? null;
}

const loadProduct = createServerFn({ method: "GET" })
	.inputValidator((slug: string) => slug)
	.handler(async ({ data: slug }): Promise<ProductView> => {
		const accountId = storefrontAccountId();
		const products = shopProducts(await listAllProducts(accountId));
		const match = products.find((entry) => matchesSlug(entry, slug));
		if (!match) throw notFound();

		const others = sortWorks(products.filter((entry) => entry.id !== match.id));
		const [product, allPlans] = await Promise.all([
			serverAPI.retrieveProduct({ product_id: match.id }),
			listAllPlans(
				accountId,
				products.map((entry) => entry.id),
			),
		]);
		const plans = allPlans.filter((plan) => planProductId(plan) === match.id);
		const relatedPlans = allPlans.filter(
			(plan) => planProductId(plan) !== match.id,
		);
		const sorted = [...plans].sort((a, b) => {
			const periodOf = (plan: typeof a) =>
				plan.plan_type === "renewal" && typeof plan.billing_period === "number"
					? plan.billing_period
					: 9_999;
			if (periodOf(a) !== periodOf(b)) return periodOf(a) - periodOf(b);
			const left = typeof a.initial_price === "number" ? a.initial_price : 0;
			const right = typeof b.initial_price === "number" ? b.initial_price : 0;
			return left - right;
		});

		const cheapestByProduct = new Map<string, string>();
		for (const other of others) {
			const forProduct = relatedPlans.filter(
				(plan) => planProductId(plan) === other.id,
			);
			const cheapest = forProduct.reduce<(typeof relatedPlans)[number] | undefined>(
				(current, plan) => {
					if (typeof plan.initial_price !== "number") return current;
					if (!current || typeof current.initial_price !== "number") {
						return plan;
					}
					return plan.initial_price < current.initial_price ? plan : current;
				},
				undefined,
			);
			if (cheapest) cheapestByProduct.set(other.id, formatPlanPrice(cheapest));
		}

		const gallery = product.gallery_images ?? [];

		return {
			id: product.id,
			title: product.title,
			headline: product.headline ?? null,
			description: product.description ?? null,
			image: firstImage(gallery),
			video: firstVideo(gallery),
			slug: productSlug(product),
			plans: sorted.map((plan) => ({
				id: plan.id,
				title: plan.title ?? product.title,
				description: plan.description ?? null,
				priceLabel: formatPlanPrice(plan),
				priceCents: planPriceCents(plan),
				price: typeof plan.initial_price === "number" ? plan.initial_price : 0,
				free: isFreePlan(plan),
				trialDays:
					typeof plan.trial_period_days === "number"
						? plan.trial_period_days
						: 0,
				billingPeriod:
					typeof plan.billing_period === "number" ? plan.billing_period : null,
				planType: plan.plan_type ?? null,
				stock: typeof plan.stock === "number" ? plan.stock : null,
				unlimitedStock: Boolean(plan.unlimited_stock),
			})),
			related: others.slice(0, 4).map((entry) => ({
				id: entry.id,
				title: entry.title,
				slug: productSlug(entry),
				image: entry.gallery_images?.[0]?.url ?? null,
				priceLabel: cheapestByProduct.get(entry.id) ?? null,
				headline: entry.headline ?? null,
			})),
			gateNote: GATE_NOTES[product.title] ?? null,
		};
	});

export const Route = createFileRoute("/products/$slug")({
	headers: () => ({ "Cache-Control": PUBLIC_DOCUMENT_CACHE_CONTROL }),
	loader: ({ params }) => loadProduct({ data: params.slug }),
	head: ({ loaderData }) => {
		const product = loaderData;
		const shown = product ? displayTitle(product.title) : "Numinous";
		const title = product ? `${shown} · Numinous` : "Numinous";
		const canonical = product
			? `${SITE.origin}/products/${product.slug}`
			: `${SITE.origin}/products`;
		const jsonLd = product
			? {
					"@context": "https://schema.org",
					"@type": "Product",
					name: shown,
					description: product.headline ?? product.description ?? SITE.description,
					image: product.image ?? SITE.card,
					brand: { "@type": "Brand", name: SITE.name },
					url: canonical,
					offers: {
						"@type": "Offer",
						price: ((product.plans[0]?.priceCents ?? 0) / 100).toFixed(2),
						priceCurrency: "USD",
						availability: "https://schema.org/InStock",
						url: canonical,
						description: product.plans[0]?.priceLabel ?? undefined,
					},
				}
			: null;
		return {
			links: [
				{ rel: "canonical", href: canonical },
				{ rel: "preconnect", href: "https://whop.com" },
				{ rel: "dns-prefetch", href: "https://whop.com" },
			],
			scripts: jsonLd
				? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }]
				: undefined,
			meta: [
				{ title },
				{
					name: "description",
					content: product?.headline ?? SITE.description,
				},
				{ property: "og:title", content: product ? shown : SITE.name },
				{
					property: "og:description",
					content: product?.headline ?? SITE.tagline,
				},
				{
					property: "og:image",
					content: product?.image ?? SITE.card,
				},
				{ name: "twitter:card", content: "summary_large_image" },
			],
		};
	},
	component: ProductPage,
});

function ProductPage() {
	const product = Route.useLoaderData();
	return <ProductExperience product={product} />;
}
