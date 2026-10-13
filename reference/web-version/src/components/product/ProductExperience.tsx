import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { GateBriefingFilm } from "../complete/GateBriefingFilm";
import { magnetHandlers, Reveal, SplitTitle, useFinePointer } from "../home/motion";
import { inviteForPlan } from "../../lib/briefings";
import { useCartStore } from "../../lib/cart";
import {
	displayTitle,
	GATE_CHAMBERS,
	GATE_FLOW,
	GATE_META,
	MOON_WEEKS,
	PRODUCT_FAQS,
	PRODUCT_ROUTES,
	WORK_LAYOUT,
	defaultCheckoutUrl,
	track,
} from "../../lib/site";
import { WorkCard } from "./WorkCard";
import { MoonDial } from "./MoonDial";

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

export type ProductView = {
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

const WATCHER_HOSTS = new Set(["The Signal"]);

/** Ride utm_* (and ref) parameters along to the Whop checkout, for attribution. */
function withUtms(href: string): string {
	if (typeof window === "undefined") return href;
	const params = new URLSearchParams(window.location.search);
	const kept: string[] = [];
	for (const [key, value] of params) {
		if (key.startsWith("utm_") || key === "ref") {
			kept.push(`${key}=${encodeURIComponent(value)}`);
		}
	}
	if (kept.length === 0) return href;
	return `${href}${href.includes("?") ? "&" : "?"}${kept.join("&")}`;
}

function EnterGate({
	planId,
	slug,
	title,
	className,
	onClick,
	children,
	magnet,
	hover,
	cta,
	location,
	hrefOverride,
}: {
	planId: string;
	slug: string;
	title: string;
	className: string;
	onClick?: () => void;
	children: ReactNode;
	magnet?: ReturnType<typeof magnetHandlers>;
	hover?: boolean;
	cta?: string;
	location?: string;
	/** Exact href to use instead of the mapped checkout (the direct route). */
	hrefOverride?: string;
}) {
	const baseExternal = hrefOverride ?? defaultCheckoutUrl({ planId, slug, title });
	const [external, setExternal] = useState(baseExternal);
	useEffect(() => {
		setExternal(baseExternal ? withUtms(baseExternal) : "");
	}, [baseExternal]);
	const ctaProps = {
		...(cta ? { "data-cta": cta } : {}),
		...(location ? { "data-cta-location": location } : {}),
	};
	const hoverProps = hover
		? ({ "data-hover": true, "data-magnet": true } as const)
		: {};
	if (external) {
		return (
			<a
				href={external}
				className={className}
				onClick={onClick}
				rel="noopener"
				{...ctaProps}
				{...hoverProps}
				{...magnet}
			>
				{children}
			</a>
		);
	}
	return (
		<Link
			to="/checkout/$planId"
			params={{ planId }}
			search={{ quantity: 1, items: `${planId}:1` }}
			className={className}
			onClick={onClick}
			{...ctaProps}
			{...hoverProps}
			{...magnet}
		>
			{children}
		</Link>
	);
}

export function ProductExperience({ product }: { product: ProductView }) {
	const addLine = useCartStore((state) => state.addLine);
	const [selectedId, setSelectedId] = useState(product.plans[0]?.id ?? "");
	const [sticky, setSticky] = useState(false);
	const [footerVisible, setFooterVisible] = useState(false);
	const fine = useFinePointer();
	const magnet = magnetHandlers(fine);
	const plan =
		product.plans.find((entry) => entry.id === selectedId) ??
		product.plans[0] ??
		null;
	const gate = GATE_META[product.title];
	const layout = WORK_LAYOUT[product.title];
	const shown = displayTitle(product.title);
	const chambers = GATE_CHAMBERS[product.title];
	const flowNote = GATE_FLOW[product.title];
	const faqs = PRODUCT_FAQS[product.title] ?? [];
	const invite = inviteForPlan(plan?.id);
	const isFree = plan ? plan.free : false;
	const isNuminary = product.title === "The Numinary";
	const planDescription = (entry: PlanView) => {
		if (!isNuminary) return entry.description;
		return entry.billingPeriod === 365
			? "Annual Watcher membership, billed every 365 days."
			: "7-night trial, then $28 every 28 days.";
	};
	// The seat routes through the plan's own checkout URL exactly (Watcher and
	// Vault; the Vault's internal-link fallback encoded the items as %3A).
	const directCheckout = isNuminary || product.title === "Wallpaper Vault";
	const planHref =
		directCheckout && plan
			? `/checkout/${plan.id}?quantity=1&items=${plan.id}:1`
			: undefined;
	const limited = plan && !plan.unlimitedStock && typeof plan.stock === "number";
	const enterLabel = gate?.enter ?? "OPEN THE GATE";
	const ctaName = product.title === "The Signal" ? "signal" : "watcher";
	const cartLabel = gate?.cart ?? "CLAIM THIS WORK";
	const signalHref = defaultCheckoutUrl({
		planId: plan?.id,
		slug: product.slug,
		title: product.title,
	});

	// Structured data: Product + Offer, matching the offer ladder exactly.
	useEffect(() => {
		if (!plan || product.plans.length === 0) return;
		const data = {
			"@context": "https://schema.org",
			"@type": "Product",
			name: shown,
			description: product.headline ?? undefined,
			image: product.image ?? undefined,
			brand: { "@type": "Organization", name: "Numinous" },
			offers: {
				"@type": "Offer",
				price: plan.priceCents / 100,
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				url: typeof window !== "undefined" ? window.location.href : undefined,
			},
		};
		const el = document.createElement("script");
		el.type = "application/ld+json";
		el.text = JSON.stringify(data);
		document.head.appendChild(el);
		return () => {
			el.remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product.id, plan?.id]);

	useEffect(() => {
		if (!plan) return;
		track("view_content", {
			value: plan.price,
			currency: "USD",
			content_name: product.title,
		});
	}, [plan, product.title]);

	useEffect(() => {
		const buy = document.getElementById("pdpBuy");
		if (!buy) return;
		const io = new IntersectionObserver(
			([entry]) => setSticky(!entry.isIntersecting),
			{ threshold: 0 },
		);
		io.observe(buy);
		const foot = document.querySelector("footer");
		const io2 = foot
			? new IntersectionObserver(
					([entry]) => setFooterVisible(entry.isIntersecting),
					{ threshold: 0 },
				)
			: null;
		if (foot && io2) io2.observe(foot);
		return () => {
			io.disconnect();
			io2?.disconnect();
		};
	}, []);

	function addToCart() {
		if (!plan) return;
		addLine({
			planId: plan.id,
			title:
				product.plans.length > 1
					? `${shown} / ${plan.title}`
					: shown,
			priceCents: plan.priceCents,
			quantity: 1,
			image: product.image ?? undefined,
		});
		track("add_to_cart", {
			value: plan.price,
			currency: "USD",
			content_name: product.title,
		});
	}

	function trackEnter() {
		if (!plan) return;
		track("add_to_cart", {
			value: plan.price,
			currency: "USD",
			content_name: product.title,
		});
	}

	return (
		<section className={`pdp-cinematic${product.title === "The Signal" ? " pdp-signal" : ""}${isNuminary ? " pdp-watcher" : ""}`}>
			<div className="pdp-hero wrap">
				<div className="pdp-art-col">
					<p className="crumbs">
						<Link to="/" reloadDocument>Home</Link>
						{" / "}
						<Link to="/collections/$label" params={{ label: "all" }}>
							The Works
						</Link>
						{" / "}
						<span>{shown}</span>
					</p>
					<Reveal className="pdp-frame">
						{product.image ? (
							<img src={product.image} alt={shown} fetchPriority="high" />
						) : product.video ? (
							<video
								src={product.video}
								autoPlay
								muted
								loop
								playsInline
								aria-label={shown}
							/>
						) : (
							<div className="product-card-fallback">{shown}</div>
						)}
						{product.image && product.video ? (
							<video
								className="pdp-cinematic-video"
								src={product.video}
								poster={product.image}
								autoPlay
								muted
								loop
								playsInline
								aria-hidden="true"
							/>
						) : null}
						<span className="pdp-corners" aria-hidden="true" />
					</Reveal>
				</div>
				<div className="pdp-details">
					<Reveal className="eyebrow left">
						{isNuminary
							? "THE GATE · $28 A MOON · SEVEN-NIGHT TRIAL"
							: `${layout?.roman ?? "THE GATE"}${gate ? `\u00A0·\u00A0${gate.chapter}` : ""}`}
					</Reveal>
					<SplitTitle
						as="h1"
						className="pdp-title"
						text={shown.toUpperCase().replace(/ /g, "\u00A0")}
					/>
					<Reveal className="pdp-headline" delay="d1">
						{isNuminary
							? "The membership that runs on the moon."
							: product.headline}
					</Reveal>
					{plan ? (
						<Reveal className="pdp-price" delay="d1">
							{isFree ? "$0 · no renewal" : plan.priceLabel}
						</Reveal>
					) : null}
					{plan && !isFree && plan.billingPeriod === 365 ? (
						<p className="price-truth">{plan.priceLabel} · pay once.</p>
					) : null}
					{plan && !isFree && plan.planType === "renewal" && plan.billingPeriod !== 365 ? (
						<p className="price-truth">
							{plan.trialDays > 0
								? "Cancel any moon."
								: `${plan.priceLabel}. Cancel any moon.`}
						</p>
					) : null}
					{plan && isFree ? (
						<p className="price-truth">Free, forever. No card.</p>
					) : null}
					{limited && plan ? (
						<p className="stock-note">
							{plan.stock} remain. Once they are gone, they are gone.
						</p>
					) : null}
					{product.gateNote ? (
						<p className="gate-note">{product.gateNote}</p>
					) : null}
					{isNuminary ? (
						<Link to="/returns" className="pdp-policy-link">
							Read the Seven Nights policy <span aria-hidden="true">→</span>
						</Link>
					) : null}
					{product.plans.length > 1 ? (
						<div className="plan-list" role="group" aria-label="Choose a plan">
							{product.plans.map((entry) => (
								<button
									key={entry.id}
									type="button"
									className="plan-option"
									aria-pressed={entry.id === plan?.id}
									data-hover
									onClick={() => {
										setSelectedId(entry.id);
										track("plan:selected", { content_name: entry.title });
									}}
								>
									<span>
										<span className="plan-option-title">{entry.title}</span>
										{planDescription(entry) ? (
											<span className="plan-option-copy">{planDescription(entry)}</span>
										) : null}
									</span>
									<span>{entry.priceLabel}</span>
								</button>
							))}
						</div>
					) : null}
					{plan ? (
						<div className="pdp-actions" id="pdpBuy">
							<EnterGate
								planId={plan.id}
								slug={product.slug}
								title={product.title}
								className="btn btn-gold"
								onClick={trackEnter}
								magnet={magnet}
								hover
								cta={ctaName}
								location="hero"
								hrefOverride={planHref}
							>
								{enterLabel} <span className="ar">→</span>
							</EnterGate>
						{!isFree && !isNuminary ? (
							<button
								type="button"
								className="btn btn-ghost"
								data-hover
								data-cta={ctaName}
								data-cta-location="hero"
								data-cta-kind="cart"
								onClick={addToCart}
							>
								{cartLabel === enterLabel ? "HOLD THIS WORK" : cartLabel}
							</button>
						) : null}
						</div>
					) : null}
					{flowNote ? <p className="pdp-flow-note">{flowNote}</p> : null}
					{WATCHER_HOSTS.has(product.title) ? (
						<div className="upsell-band">
							<p className="kicker">The room beside this gate</p>
							<p>
								7-night trial, then $28 every 28 days. Cancel any moon. The Vault, twelve studio cards, and fifteen realms live inside.
							</p>
							<Link
								to="/products/$slug"
								params={{ slug: PRODUCT_ROUTES.numinary }}
								className="btn btn-ghost btn-sm"
								data-cta="watcher"
								data-cta-location="upsell"
								onClick={() =>
									track("upsell:watcher", { content_name: product.title })
								}
							>
								TAKE A SEAT <span className="ar">→</span>
							</Link>
						</div>
					) : null}
				</div>
			</div>

			{invite && plan ? (
				<div className="pdp-film wrap">
					<Reveal className="eyebrow">THE GATE · HOW IT WORKS</Reveal>
					<GateBriefingFilm
						briefing={invite}
						watchedEvent="invite:watched_full"
						endCta={
							signalHref
								? {
										kind: "library",
										href: signalHref,
										label: enterLabel,
									}
								: {
										kind: "checkout",
										planId: plan.id,
										label: enterLabel,
									}
						}
					/>
					<details className="complete-read pdp-read">
						<summary>Read the invitation</summary>
						<ol>
							{invite.scenes.map((scene) => (
								<li key={scene.id}>
									<p className="film-kicker">{scene.kicker}</p>
									<h2>{scene.title}</h2>
									<p>{scene.copy}</p>
								</li>
							))}
						</ol>
					</details>
				</div>
			) : null}

			{isNuminary ? (
				<div className="pdp-lore wrap" id="room">
					<Reveal className="eyebrow">INSIDE THE ROOM</Reveal>
					<SplitTitle
						className="sec-title"
						text={"WHAT\u00A0WATCHER\u00A0HOLDS"}
					/>
					<p className="pdp-faq-sub">
						One 28-day cycle, delivered in four weekly chapters.
					</p>
					<ul className="room-list">
						{MOON_WEEKS.map((week) => (
							<li key={week.roman} className="room-item">
								{week.title}: {week.copy}
							</li>
						))}
					</ul>
				</div>
			) : chambers ? (
				<div className="pdp-lore wrap">
					<Reveal className="eyebrow">THE LORE</Reveal>
					<ul className="pdp-chambers">
						{chambers.map((chamber) => (
							<li key={chamber.roman} className="pdp-chamber">
								<span className="pdp-chamber-roman">{chamber.roman}</span>
								<div>
									<h3>{chamber.title}</h3>
									<p>{chamber.copy}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			) : product.description ? (
				<div className="pdp-lore wrap">
					<Reveal className="eyebrow">THE LORE</Reveal>
					<div className="pdp-copy">{product.description}</div>
				</div>
			) : null}

			{product.title === "The Numinary" ? (
				<div className="pdp-dial wrap">
					<Reveal className="eyebrow">THE CYCLE</Reveal>
					<SplitTitle
						className="sec-title"
						text={"ONE\u00A0MOON.\u00A0FOUR\u00A0WEEKS."}
					/>
					<p className="pdp-faq-sub">
						Twenty-eight nights, one tick each. A new being every moon. Cancel
						any moon.
					</p>
					<MoonDial />
					<ul className="pdp-chambers cycle-weeks">
						{MOON_WEEKS.map((week) => (
							<li key={week.roman} className="pdp-chamber">
								<span className="pdp-chamber-roman">{week.roman}</span>
								<div>
									<h3>{week.title}</h3>
									<p>{week.copy}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			) : null}

			{isNuminary && product.plans.length > 1 ? (
				<div className="pdp-lore wrap" id="take-a-seat">
					<Reveal className="eyebrow">TAKE A SEAT</Reveal>
					<SplitTitle
						className="sec-title"
						text={"CHOOSE\u00A0YOUR\u00A0MOON"}
					/>
					<p className="pdp-faq-sub">
						Same seat, same room. The year is one payment.
					</p>
					<div className="plan-list" role="group" aria-label="Choose a plan">
						{product.plans.map((entry) => (
							<button
								key={entry.id}
								type="button"
								className="plan-option"
								aria-pressed={entry.id === plan?.id}
								data-hover
								onClick={() => {
									setSelectedId(entry.id);
									track("plan:selected", { content_name: entry.title });
								}}
							>
								<span>
									<span className="plan-option-title">{entry.title}</span>
									{planDescription(entry) ? (
										<span className="plan-option-copy">{planDescription(entry)}</span>
									) : null}
								</span>
								<span>{entry.priceLabel}</span>
							</button>
						))}
					</div>
					{plan ? (
						<div className="pdp-actions">
							<EnterGate
								planId={plan.id}
								slug={product.slug}
								title={product.title}
								className="btn btn-gold"
								onClick={trackEnter}
								magnet={magnet}
								hover
								cta={ctaName}
								location="take-a-seat"
								hrefOverride={planHref}
							>
								{enterLabel} <span className="ar">→</span>
							</EnterGate>
						</div>
					) : null}
				</div>
			) : null}

			{faqs.length > 0 ? (
				<div className="pdp-faq wrap">
					<Reveal className="eyebrow">CHAPTER IV · QUESTIONS</Reveal>
					<SplitTitle
						className="sec-title"
						text={"QUESTIONS\u00A0TRAVELLERS\u00A0ASK"}
					/>
					<p className="pdp-faq-sub">Asked at the gates. Answered plainly.</p>
					<div className="pdp-faq-list">
						{faqs.map((item) => (
							<details
								className="pdp-qa"
								key={item.question}
								onToggle={(event) => {
									if ((event.target as HTMLDetailsElement).open) {
										track("faq:open", { content_name: item.question });
									}
								}}
							>
								<summary>
									{item.question.toUpperCase()}
									<span className="pdp-qa-mark" aria-hidden="true" />
								</summary>
								<div className="pdp-qa-ans">{item.answer}</div>
							</details>
						))}
					</div>
				</div>
			) : null}

			{isNuminary ? (
				<div className="pdp-related wrap quieter-gate">
					<p className="pdp-faq-sub">
						Not ready to sit?{" "}
						<Link
							to="/products/$slug"
							params={{ slug: PRODUCT_ROUTES.signal }}
							data-cta="signal"
							data-cta-location="quieter-gate"
						>
							The Signal · Free
						</Link>{" "}
						remains the quieter gate.
					</p>
				</div>
			) : product.related.length > 0 ? (
				<div className="pdp-related wrap">
					<div className="sec-head">
						<Reveal className="eyebrow">FURTHER GATES</Reveal>
						<SplitTitle className="sec-title" text={"WALK\u00A0ON"} />
					</div>
					<div className="works-grid pdp-related-grid">
						{product.related.map((item) => (
							<WorkCard key={item.id} item={item} />
						))}
					</div>
				</div>
			) : null}

			{sticky && !footerVisible && plan ? (
				<div className="pdp-sticky">
					<span className="pdp-sticky-title">{shown.toUpperCase()}</span>
					<span className="pdp-sticky-price">{plan.priceLabel}</span>
					<EnterGate
						planId={plan.id}
						slug={product.slug}
						title={product.title}
						className="btn btn-gold btn-sm"
						onClick={trackEnter}
						cta={ctaName}
						location="sticky"
						hrefOverride={planHref}
					>
						{enterLabel}
					</EnterGate>
				</div>
			) : null}
		</section>
	);
}
