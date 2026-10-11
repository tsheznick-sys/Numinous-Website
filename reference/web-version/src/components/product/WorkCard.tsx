import { Link } from "@tanstack/react-router";
import {
	displayTitle,
	GATE_META,
	WORK_CARD_CONTENT,
	WORK_LAYOUT,
} from "../../lib/site";
import { Reveal, tiltHandlers, useFinePointer } from "../home/motion";

export type WorkItem = {
	id: string;
	title: string;
	slug: string;
	image: string | null;
	priceLabel: string | null;
	headline: string | null;
};

export function WorkCard({
	item,
	reveal = true,
	eager = false,
}: {
	item: WorkItem;
	reveal?: boolean;
	eager?: boolean;
}) {
	const layout = WORK_LAYOUT[item.title] ?? {
		roman: "",
		cls: "c-work",
	};
	const fine = useFinePointer();
	const tilt = tiltHandlers(fine);
	const isFree = (item.priceLabel ?? "").toLowerCase() === "free";
	const shown = displayTitle(item.title);
	const enter = GATE_META[item.title]?.enter ?? "OPEN THE GATE";
	// The three open gates carry curated badges, lines, and CTAs so every
	// card sits the same way: image, badge, title, line, call.
	const curated = WORK_CARD_CONTENT[item.title];
	const badge = curated ? "\u2726\u00A0\u00A0" + curated.badge : null;
	const line = curated ? curated.line : (item.headline ?? "");
	const cta = curated ? curated.cta : enter;
	const rotated = !curated;
	// Curated open gates route straight to checkout from the card.
	const checkoutHref = curated?.ctaHref ?? null;

	const cardClass = `card ${layout.cls} tilt`;
	const cardProps = {
		className: cardClass,
		"data-hover": true,
		...tilt,
	};
	const cardInner = (
		<>
			<span className="frame" />
			<div className={`art ${rotated ? "r45" : ""}`}>
				{item.image ? (
					<img
						src={item.image}
						alt={shown}
						loading={eager ? "eager" : "lazy"}
						fetchPriority={eager ? "high" : undefined}
					/>
				) : (
					<div className="product-card-fallback">{shown}</div>
				)}
			</div>
			<div className="body">
				{badge ? <span className="badge">{badge}</span> : null}
				<h2>{shown.toUpperCase()}</h2>
				<p>{line}</p>
				<span className="go">
					{cta} <span className="ar">→</span>
				</span>
			</div>
			{layout.roman ? <span className="num">{layout.roman}</span> : null}
			{item.priceLabel && !curated ? (
				<span className={`price ${isFree ? "free" : ""}`}>
					{item.priceLabel.toUpperCase()}
				</span>
			) : null}
			<span className="glowline" />
		</>
	);

	const card = checkoutHref ? (
		<a href={checkoutHref} {...cardProps}>
			{cardInner}
		</a>
	) : (
		<Link to="/products/$slug" params={{ slug: item.slug }} {...cardProps}>
			{cardInner}
		</Link>
	);

	if (!reveal) return card;

	return (
		<Reveal className={layout.cls} delay={layout.delay}>
			{card}
		</Reveal>
	);
}
