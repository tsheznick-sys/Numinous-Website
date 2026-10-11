import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Reveal, SplitTitle } from "../components/home/motion";
import { WorkCard } from "../components/product/WorkCard";
import { SITE, shopProducts, sortWorks } from "../lib/site";
import { PUBLIC_DOCUMENT_CACHE_CONTROL } from "../lib/cache-policy";
import {
	formatPlanPrice,
	planProductId,
	productLabels,
	productSlug,
} from "../lib/storefront-account";
import {
	cheapestPlan,
	listAllPlans,
	listAllProducts,
	storefrontAccountId,
} from "../whop.server";

type CollectionItem = {
	id: string;
	title: string;
	slug: string;
	image: string | null;
	priceLabel: string | null;
	headline: string | null;
};

const loadCollection = createServerFn({ method: "GET" })
	.inputValidator((label: string) => label)
	.handler(
		async ({
			data: rawLabel,
		}): Promise<{ label: string; items: CollectionItem[] }> => {
			const label = rawLabel.toLowerCase();
			const accountId = storefrontAccountId();
			const products = shopProducts(await listAllProducts(accountId));
			const list = sortWorks(
				products.filter((product) => {
					if (label === "all") return true;
					return productLabels(product).includes(label);
				}),
			);
			const plans = await listAllPlans(
				accountId,
				list.map((product) => product.id),
			);

			const plansByProduct = new Map<string, typeof plans>();
			for (const plan of plans) {
				const productId = planProductId(plan);
				if (!productId) continue;
				const forProduct = plansByProduct.get(productId) ?? [];
				forProduct.push(plan);
				plansByProduct.set(productId, forProduct);
			}

			const priceByProduct = new Map<string, string>();
			for (const [productId, forProduct] of plansByProduct) {
				const plan = cheapestPlan(forProduct);
				if (!plan) continue;
				// The label is the price, never a "From" teaser: a trial plan
				// must not read "From 7 nights free" (FROM FREE is banned).
				priceByProduct.set(productId, formatPlanPrice(plan));
			}

			return {
				label,
				items: list.map((product) => ({
					id: product.id,
					title: product.title,
					slug: productSlug(product),
					image: product.gallery_images?.[0]?.url ?? null,
					priceLabel: priceByProduct.get(product.id) ?? null,
					headline: product.headline ?? null,
				})),
			};
		},
	);

export const Route = createFileRoute("/collections/$label")({
	headers: () => ({ "Cache-Control": PUBLIC_DOCUMENT_CACHE_CONTROL }),
	loader: ({ params }) => loadCollection({ data: params.label }),
	head: ({ loaderData }) => {
		const name =
			loaderData?.label === "all"
				? "The Works"
				: (loaderData?.label ?? "Collection").replace(/-/g, " ");
		const canonical = SITE.origin + "/collections/" + (loaderData?.label ?? "all");
		const itemList = loaderData?.items?.length
			? {
					"@context": "https://schema.org",
					"@type": "ItemList",
					itemListElement: loaderData.items.map((item, index) => ({
						"@type": "ListItem",
						position: index + 1,
						name: item.title,
						url: SITE.origin + "/products/" + item.slug,
					})),
				}
			: null;
		return {
			links: [{ rel: "canonical", href: canonical }],
			scripts: itemList
				? [{ type: "application/ld+json", children: JSON.stringify(itemList) }]
				: undefined,
			meta: [
				{ title: `${name} · Numinous` },
				{ name: "description", content: SITE.description },
				{ property: "og:title", content: `${name} · Numinous` },
				{ property: "og:description", content: SITE.tagline },
				{ property: "og:image", content: SITE.card },
				{ name: "twitter:card", content: "summary_large_image" },
			],
		};
	},
	component: CollectionPage,
});

function CollectionPage() {
	const { label, items } = Route.useLoaderData();
	const title = label === "all" ? "The Works" : label.replace(/-/g, " ");
	// The eyebrow states the true count of open gates, always.
	const words = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"];
	const countWord = words[items.length] ?? String(items.length);

	return (
		<section className="collection-page" id="works">
			<div className="sec-head">
				<Reveal className="eyebrow">
					{`CHAPTER\u00A0I\u00A0·\u00A0${countWord}\u00A0GATES`}
				</Reveal>
				<SplitTitle
					as="h1"
					className="sec-title"
					text={title.toUpperCase().replace(/ /g, " ")}
				/>
				<Reveal className="sec-sub" delay="d1">
					{items.length === 0
						? "This chamber is empty, traveller."
						: "Every gate that is open now."}
				</Reveal>
			</div>
			<div className="works-grid">
				{items.map((item, index) => (
					<WorkCard key={item.id} item={item} eager={index < 3} />
				))}
			</div>
		</section>
	);
}
