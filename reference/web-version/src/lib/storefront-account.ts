// Everything here has to be safe in the browser: a route that renders a price
// or a label pulls this module into the client bundle. Anything reading the
// filesystem or the environment belongs in whop.server.ts instead.

export function productLabels(product: unknown): string[] {
	if (typeof product !== "object" || product === null) return [];
	const labels = (product as { labels?: unknown }).labels;
	if (!Array.isArray(labels)) return [];
	return labels
		.filter((label): label is string => typeof label === "string")
		.map((label) => label.toLowerCase());
}

export function planProductId(plan: { product?: unknown }): string | undefined {
	const product = plan.product;
	if (typeof product !== "object" || product === null) return undefined;
	if (!("id" in product)) return undefined;
	return typeof product.id === "string" ? product.id : undefined;
}

function formatAmount(amount: number): string {
	return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

type PlanPriceFields = {
	initial_price?: number;
	renewal_price?: number;
	billing_period?: number | null;
	trial_period_days?: number | null;
	plan_type?: string;
};

// The price truth. "Free" is reserved for a plan that is actually $0 with no
// renewal (The Signal). A trial is not free: the renewal names the price. A
// $0 initial_price on a renewal plan is not free either: the first charge is
// the renewal. Every card and page label goes through this.
export function isFreePlan(plan: PlanPriceFields): boolean {
	const renewal =
		typeof plan.renewal_price === "number" ? plan.renewal_price : 0;
	const initial =
		typeof plan.initial_price === "number" ? plan.initial_price : 0;
	return renewal <= 0 && initial <= 0;
}

function renewalInterval(billingPeriod: number | null | undefined): string {
	if (billingPeriod === 365) return "year";
	if (billingPeriod === 28 || billingPeriod === 30) return "moon";
	return "cycle";
}

export function formatPlanPrice(plan: PlanPriceFields): string {
	const renewal =
		typeof plan.renewal_price === "number" ? plan.renewal_price : 0;
	const initial =
		typeof plan.initial_price === "number" ? plan.initial_price : 0;
	const trial =
		typeof plan.trial_period_days === "number" ? plan.trial_period_days : 0;
	if (renewal > 0 && trial > 0) {
		return `7 nights free, then ${formatAmount(renewal)} / ${plan.billing_period ?? 28} days`;
	}
	if (renewal > 0) {
		const price = formatAmount(renewal);
		return `${price} / ${renewalInterval(plan.billing_period)}`;
	}
	if (renewal <= 0 && initial <= 0) return "Free";
	return formatAmount(initial);
}

export function planPriceCents(plan: PlanPriceFields): number {
	const renewal =
		typeof plan.renewal_price === "number" ? plan.renewal_price : 0;
	if (renewal > 0) return Math.round(renewal * 100);
	const amount = plan.initial_price;
	if (typeof amount !== "number") return 0;
	return Math.round(amount * 100);
}

export function formatCents(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export function productSlug(product: {
	id: string;
	route?: string | null;
	metadata?: unknown;
}): string {
	const metadata = product.metadata;
	if (metadata && typeof metadata === "object" && "source_slug" in metadata) {
		const slug = (metadata as { source_slug?: unknown }).source_slug;
		if (typeof slug === "string" && slug.length > 0) return slug;
	}
	if (typeof product.route === "string" && product.route.length > 0) {
		return product.route;
	}
	return product.id;
}

export function matchesSlug(
	product: { id: string; route?: string | null; metadata?: unknown },
	slug: string,
): boolean {
	return productSlug(product) === slug || product.id === slug;
}
