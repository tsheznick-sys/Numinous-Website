export const SITE = {
	name: "Numinous",
	tagline: "Witness the impossible.",
	description:
		"Cinematic visions of the divine and mythical. New realms every week.",
	instagram: "https://www.instagram.com/numinous2.0/",
	instagramHandle: "@numinous2.0",
	card: "https://jointhenuminouses.whop.site/og.png",
	origin: "https://jointhenuminouses.whop.site",
};

/** Direct checkout routes (the exact hrefs the storefront CTAs use). The
    app serves these URLs and 307s them to Whop's hosted checkout. */
export const WATCHER_CHECKOUT_HREF =
	"/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1";
export const VAULT_CHECKOUT_HREF =
	"/checkout/plan_Aew5DdipP3fKY?quantity=1&items=plan_Aew5DdipP3fKY:1";
export const ANNUAL_CHECKOUT_HREF =
	"/checkout/plan_Imfk0oedwYn7v?quantity=1&items=plan_Imfk0oedwYn7v:1";

export const VAULT_PLAN_ID = "plan_Aew5DdipP3fKY";

export const WORK_CARD_CONTENT: Record<
	string,
	{ badge: string; line: string; cta: string; ctaHref?: string }
> = {
	"The Signal": {
		badge: "FREE",
		line: "Every realm drops here first.",
		cta: "ENTER THE SIGNAL",
	},
	"The Numinary": {
		badge: "$28 / MOON",
		line: "The membership that runs on the moon.",
		cta: "TAKE A SEAT",
		ctaHref: WATCHER_CHECKOUT_HREF,
	},
	"Wallpaper Vault": {
		badge: "$12",
		line: "Fifteen realms, cropped for every screen.",
		cta: "ENTER THE VAULT",
		ctaHref: VAULT_CHECKOUT_HREF,
	},
};

export const WORKS_ORDER = [
	"The Signal",
	"The Numinary",
	"Wallpaper Vault",
] as const;

export const PRODUCT_ROUTES = {
	signal: "the-signal-e6",
	vault: "the-vault-c7",
	premium: "premium-edition-b1",
	wallpaper: "wallpaper-vault-f0",
	numinary: "the-numinary-3e",
} as const;

export const SIGNAL_PLAN_ID = "plan_5IYhtCsv2Buv1";

export const SIGNAL_WHOP_PAGE =
	"https://whop.com/thenuminouses/products/the-signal-e6/";

/** Whop checkout for The Signal. After Get access, Whop sends the traveller to the briefing. */
export const SIGNAL_CHECKOUT =
	"https://whop.com/checkout/ch_wYXFulML0v6LIoJ/";

/** The Watcher's Whop-default checkout. Bound to the existing plan (never recreated);
    redirects back to /order-complete after purchase, mirroring the Signal. */
export const NUMINARY_PLAN_ID = "plan_PQnMYNixMTjRQ";

export const NUMINARY_CHECKOUT =
	"https://whop.com/checkout/ch_vrkSRxgzQ23IzXH/";

/** The Annual Watcher: same membership, one payment for the year. Hosted
    checkout is Whop's plan-direct link (serves the checkout page directly). */
export const ANNUAL_PLAN_ID = "plan_Imfk0oedwYn7v";
export const ANNUAL_CHECKOUT =
	"https://whop.com/checkout/plan_Imfk0oedwYn7v";

/** The Wallpaper Vault's hosted Whop checkout (plan-direct). The in-app
    /checkout route 307s here, so vault buyers always land on Whop's own
    checkout instead of the in-app fallback. */
export const VAULT_HOSTED_CHECKOUT =
	"https://whop.com/checkout/plan_Aew5DdipP3fKY?quantity=1&items=plan_Aew5DdipP3fKY:1";

export const SIGNAL_ORDER_COMPLETE = `${SITE.origin}/order-complete?plan=${SIGNAL_PLAN_ID}`;

/** Whop-default checkout for every public gate: the Signal and the Watcher
    both leave the site for Whop's hosted checkout and return via
    /order-complete. Unknown plans return null (in-app checkout remains the
    fallback). */
export function defaultCheckoutUrl(input: {
	planId?: string;
	slug?: string;
	title?: string;
}): string | null {
	// Plan-specific checks first: a product-level title/slug match must not
	// swallow a different plan of the same product (Annual Watcher).
	if (input.planId === ANNUAL_PLAN_ID) {
		return ANNUAL_CHECKOUT;
	}
	if (
		input.planId === VAULT_PLAN_ID ||
		input.slug === PRODUCT_ROUTES.wallpaper ||
		input.title === "Wallpaper Vault"
	) {
		return VAULT_HOSTED_CHECKOUT;
	}
	if (
		input.planId === SIGNAL_PLAN_ID ||
		input.slug === PRODUCT_ROUTES.signal ||
		input.title === "The Signal"
	) {
		return SIGNAL_CHECKOUT;
	}
	if (
		input.planId === NUMINARY_PLAN_ID ||
		input.slug === PRODUCT_ROUTES.numinary ||
		input.title === "The Numinary" ||
		input.title === "Watcher"
	) {
		return NUMINARY_CHECKOUT;
	}
	return null;
}

/** The exact storefront checkout href for a public plan (the relative form
    the CTAs carry). Null for anything else. */
export function storefrontCheckoutHref(planId?: string): string | null {
	if (planId === NUMINARY_PLAN_ID) return WATCHER_CHECKOUT_HREF;
	if (planId === VAULT_PLAN_ID) return VAULT_CHECKOUT_HREF;
	if (planId === ANNUAL_PLAN_ID) return ANNUAL_CHECKOUT_HREF;
	return null;
}

export function signalCheckoutUrl(input: {
	planId?: string;
	slug?: string;
	title?: string;
}): string | null {
	return defaultCheckoutUrl(input) === SIGNAL_CHECKOUT
		? SIGNAL_CHECKOUT
		: null;
}

export const WORK_LAYOUT: Record<
	string,
	{ roman: string; cls: string; delay?: string }
> = {
	"The Signal": { roman: "I / III", cls: "c-signal" },
	"The Numinary": { roman: "II / III", cls: "c-watcher", delay: "d1" },
	"Wallpaper Vault": { roman: "III / III", cls: "c-vault", delay: "d2" },
};

export const GATE_META: Record<
	string,
	{ chapter: string; enter: string; cart: string }
> = {
	"The Signal": {
		chapter: "THE FIRST GATE",
		enter: "ENTER THE SIGNAL",
		cart: "ENTER THE SIGNAL",
	},
	"The Numinary": {
		chapter: "WATCHER · $28 A MOON",
		enter: "TAKE A SEAT",
		cart: "TAKE A SEAT",
	},
	"Wallpaper Vault": {
		chapter: "OPEN NOW",
		enter: "ENTER THE VAULT",
		cart: "HOLD THIS WORK",
	},
};

export function displayTitle(title: string): string {
	return title === "The Numinary" ? "Watcher" : title;
}

/**
 * The four weeks of the Watcher moon, in order. Names are law (brief section 2).
 */
export const MOON_WEEKS: { roman: string; title: string; copy: string }[] = [
	{
		roman: "I",
		title: "The Realm",
		copy: "The month's new being, met for the first time.",
	},
	{
		roman: "II",
		title: "The Process",
		copy: "Behind the veil, how the vision was made.",
	},
	{
		roman: "III",
		title: "The Records",
		copy: "The lore, laid deep.",
	},
	{
		roman: "IV",
		title: "The Session",
		copy: "A live build. Your questions. The vote.",
	},
];

export const GATE_FLOW: Record<string, string> = {
	"The Signal":
		"After you enter, a briefing opens the rooms. They wait in your library.",
	"The Numinary":
		"After you take a seat, a briefing opens the moon. The rooms wait in your library.",
};

export const GATE_CHAMBERS: Record<
	string,
	{ roman: string; title: string; copy: string }[]
> = {
	"The Signal": [
		{
			roman: "I",
			title: "THE OPEN GATE",
			copy: "Every realm drops here twenty-four hours before the feed. Free, forever.",
		},
		{
			roman: "II",
			title: "THE FIRST VISION",
			copy: "A ten-page gift. The Signal, The Realm, The Process, The Records, The Session, Field Journal.",
		},
		{
			roman: "III",
			title: "THE CALENDAR",
			copy: "The moon calendar, the domain polls, the founding windows. Announced in the Signal first.",
		},
		{
			roman: "IV",
			title: "NO CARD",
			copy: "The gate stays open. Nothing is asked of the card.",
		},
	],
	"The Numinary": [
		{
			roman: "I",
			title: "THE REALM",
			copy: "Week I. The month's new being, met for the first time.",
		},
		{
			roman: "II",
			title: "THE PROCESS",
			copy: "Week II. Behind the veil: how the vision was made.",
		},
		{
			roman: "III",
			title: "THE RECORDS",
			copy: "Week III. The lore deep-dive.",
		},
		{
			roman: "IV",
			title: "THE SESSION",
			copy: "Week IV. Live build, your questions, the vote.",
		},
		{
			roman: "V",
			title: "INSIDE THE ROOM",
			copy: "The Vault, twelve studio cards, fifteen realms of wallpaper, the rooms, and Member Files. $28 a moon.",
		},
	],
};


export type ProductFaq = { question: string; answer: string };

export const PRODUCT_FAQS: Record<string, ProductFaq[]> = {
	"The Signal": [
		{
			question: "Is The Signal truly free?",
			answer:
				"Yes. Forever. No card. Every realm drops here twenty-four hours before the feed.",
		},
		{
			question: "What waits inside?",
			answer:
				"The Signal, The Realm, The Process, The Records, The Session, Field Journal, and The First Vision, a ten-page gift.",
		},
		{
			question: "Do I have to buy anything else?",
			answer:
				"No. Walk further only if the first vision names what you saw.",
		},
		{
			question: "Where do the files go?",
			answer:
				"Straight into your library after you enter. Nothing is shipped.",
		},
	],
	"The Numinary": [
		{
			question: "What is inside Watcher?",
			answer:
				"One 28-day cycle in four weekly parts: The Realm, The Process, The Records, and The Session. The Session is a live build, your questions, and the vote.",
		},
		{
			question: "Why $28 a moon?",
			answer:
				"The membership runs on the moon: one cycle every 28 days. $28 is that number. Cancel any moon.",
		},
		{
			question: "What name do I give at the gate?",
			answer:
				"The name entered at checkout is the name written into the Volume II credits.",
		},
	],
	"The Vault": [
		{
			question: "What is The Vault?",
			answer:
				"The process behind every realm: the core formula, eight ready-to-use prompts, the generation settings, and the three rules. PDF and EPUB.",
		},
		{
			question: "Is this a prompt list?",
			answer:
				"No. A system. Learn the skeleton once. Never need anyone's prompts again.",
		},
		{
			question: "Can this come back?",
			answer: "No. Sales are final.",
		},
	],
	"Premium Edition": [
		{
			question: "What is inside the Premium Edition?",
			answer:
				"The Vault, plus twelve large-type studio cards: the Core Formula, the eight realms, the Generation Settings, the Naming Domains, and the Three Rules.",
		},
		{
			question: "Why $56?",
			answer: "56 is the witness doubled. Built to sit open beside your editor.",
		},
		{
			question: "Can this come back?",
			answer: "No. Sales are final.",
		},
	],
	"Wallpaper Vault": [
		{
			question: "What do I receive?",
			answer:
				"Forty-five wallpapers. Each of the fifteen realms in three formats: phone, portrait, and desktop.",
		},
		{
			question: "Do they work on any screen?",
			answer: "Yes. Already cropped for phone, tablet, and desktop.",
		},
		{
			question: "Can this come back?",
			answer: "No. Sales are final.",
		},
		{
			question: "Who answers if I need a hand?",
			answer: "Write to numinous.support@gmail.com - answered by a person, not a form.",
		},
	],
	"The Keeper": [
		{
			question: "How do I receive this work?",
			answer: "Instant, in your library. Nothing is shipped.",
		},
		{
			question: "Is a card required?",
			answer: "No. This gate is free.",
		},
		{
			question: "Where does it live?",
			answer: "Inside Numinous. The public store does not list this gate.",
		},
	],
};

const HIDDEN_SHOP_IDS = new Set([
	"prod_H0YVcwFgRmZ1m",
	"prod_MndZ46k5rVIls",
	"prod_9e8uMRkiUADz2",
	"prod_RURvKJMQhil5q",
	"prod_lY8QSDmSkBLqn",
	"prod_oLNmLURGYn7dJ",
]);

export function shopProducts<T extends { id: string }>(products: T[]): T[] {
	return products.filter((product) => !HIDDEN_SHOP_IDS.has(product.id));
}

export function sortWorks<T extends { title: string }>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const left = WORKS_ORDER.indexOf(a.title as (typeof WORKS_ORDER)[number]);
		const right = WORKS_ORDER.indexOf(b.title as (typeof WORKS_ORDER)[number]);
		return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
	});
}

export function track(
	event: string,
	data?: Record<string, unknown>,
): void {
	if (typeof window === "undefined") return;
	// App-authored analytics remains off until the visitor explicitly accepts.
	try {
		if (window.localStorage.getItem("numinous-consent") !== "accepted") return;
	} catch {
		return;
	}
	window.whop?.track(event, data);
}

declare global {
	interface Window {
		whop?: {
			track: (event: string, data?: Record<string, unknown>) => void;
		};
	}
}
