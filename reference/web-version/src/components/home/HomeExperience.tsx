import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { PRODUCT_ROUTES } from "../../lib/site";
import { Sigil } from "../brand/Sigil";
import { WorkCard, type WorkItem } from "../product/WorkCard";
import { ChapterNav } from "./ChapterNav";
import {
	magnetHandlers,
	Reveal,
	SplitTitle,
	useFinePointer,
	useReveal,
} from "./motion";

export type ShopItem = WorkItem;

const WEEKS = [
	{
		week: "WEEK I",
		title: "THE REALM",
		copy: "The month's new being, met for the first time.",
	},
	{
		week: "WEEK II",
		title: "THE PROCESS",
		copy: "Behind the veil: how the vision was made.",
	},
	{
		week: "WEEK III",
		title: "THE RECORDS",
		copy: "The lore deep-dive.",
	},
	{
		week: "WEEK IV",
		title: "THE SESSION",
		copy: "Live build, your questions, the vote.",
	},
];

const MARQUEE =
	"WITNESS THE IMPOSSIBLE ✦ NEW REALMS EVERY WEEK ✦ THE SIGNAL ✦ WATCHER $28 A MOON ✦ FIFTEEN BEINGS ✦ THE SEVEN-NIGHT PACT ✦ ";

function NuminaryOrbit({ onWeek }: { onWeek: (index: number) => void }) {
	const [active, setActive] = useState(0);
	const reduced =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	useEffect(() => {
		if (reduced) return;
		let ang = 0;
		let target = 0;
		let holdUntil = 0;
		let frame = 0;
		let last = 0;
		const moons = document.querySelector(".orbit-moons") as HTMLElement | null;
		const loop = (t: number) => {
			if (t > holdUntil && Math.abs(target - ang) < 0.5) target = ang + 0.075;
			ang += (target - ang) * 0.06;
			if (moons) moons.style.transform = `rotate(${ang}deg)`;
			const idx = Math.floor(((((ang % 360) + 360) % 360) / 90) % 4);
			if (idx !== last) {
				last = idx;
				setActive(idx);
				onWeek(idx);
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		const onClick = (event: Event) => {
			const button = event.currentTarget as HTMLElement;
			const i = Number(button?.dataset.w ?? 0);
			target = ang + ((((i * 90 - (ang % 360)) + 360) % 360) || i * 90);
			if (target === ang) target = ang + 360;
			holdUntil = performance.now() + 9000;
		};
		const nodes = Array.from(document.querySelectorAll("#orbit .onode"));
		nodes.forEach((node) => node.addEventListener("click", onClick));
		return () => {
			cancelAnimationFrame(frame);
			nodes.forEach((node) => node.removeEventListener("click", onClick));
		};
	}, [reduced, onWeek]);

	const positions = [
		{ left: "50%", top: "6%" },
		{ left: "94%", top: "50%" },
		{ left: "50%", top: "94%" },
		{ left: "6%", top: "50%" },
	];

	return (
		<div className="orbit-wrap" id="orbit" aria-label="The four weeks of the cycle">
			<div className="orbit-ring2" />
			<div className="orbit-ring" />
			<div className="orbit-moons">
				<i />
			</div>
			<div className="orbit-core">
				<Sigil size="56%" />
			</div>
			{WEEKS.map((week, i) => (
				<button
					key={week.week}
					type="button"
					className={`onode ${active === i ? "active" : ""}`}
					style={positions[i]}
					data-w={i}
					data-hover
					onClick={() => {
						setActive(i);
						onWeek(i);
					}}
				>
					<span className="wk">{week.week}</span>
					<span className="lbl">{week.title}</span>
					<span className="dot" />
				</button>
			))}
		</div>
	);
}

function GoldButton({
	to,
	params,
	children,
	className = "btn btn-gold",
}: {
	to: "/products/$slug" | "/returns";
	params?: { slug: string };
	children: ReactNode;
	className?: string;
}) {
	const fine = useFinePointer();
	const magnet = magnetHandlers(fine);
	if (to === "/returns") {
		return (
			<Link to="/returns" className={className} data-hover data-magnet {...magnet}>
				{children}
			</Link>
		);
	}
	return (
		<Link
			to="/products/$slug"
			params={params ?? { slug: PRODUCT_ROUTES.signal }}
			className={className}
			data-hover
			data-magnet
			{...magnet}
		>
			{children}
		</Link>
	);
}

export function HomeExperience({ items }: { items: ShopItem[] }) {
	const byTitle = (title: string) => items.find((item) => item.title === title);
	const signal = byTitle("The Signal");
	const numinary = byTitle("The Numinary");

	const works = ["The Signal", "The Numinary", "Wallpaper Vault"]
		.map((title) => byTitle(title))
		.filter((item): item is ShopItem => Boolean(item));
	const [week, setWeek] = useState(0);
	const { ref: pactRef, on: pactOn } = useReveal<HTMLDivElement>();
	const fine = useFinePointer();

	useEffect(() => {
		if (!fine) return;
		const bg = document.getElementById("heroBg");
		if (!bg) return;
		const onMove = (event: MouseEvent) => {
			const x = (event.clientX / window.innerWidth - 0.5) * 28;
			const y = (event.clientY / window.innerHeight - 0.5) * 18;
			bg.style.setProperty("--px", `${x}px`);
			bg.style.setProperty("--py", `${y}px`);
		};
		window.addEventListener("mousemove", onMove, { passive: true });
		return () => window.removeEventListener("mousemove", onMove);
	}, [fine]);

	return (
		<>
			<a className="skip" href="#works">
				Skip to content
			</a>
			<ChapterNav />

			<section id="hero" aria-label="Numinous, the realms opened">
				<div className="hero-bg" id="heroBg">
					<div className="hero-bg-inner" />
				</div>
				<div className="hero-fade" />
				<div className="hero-motes" aria-hidden="true">
					{Array.from({ length: 18 }).map((_, i) => (
						<i key={i} />
					))}
				</div>
				<div className="hero-rail" style={{ left: "2.2rem" }}>
					WITNESS&nbsp;&nbsp;THE&nbsp;&nbsp;IMPOSSIBLE
				</div>
				<div
					className="hero-rail"
					style={{
						right: "2.2rem",
						transform: "translateY(-50%) rotate(180deg)",
					}}
				>
					EST&nbsp;.&nbsp;MMXXVI
				</div>

				<Reveal className="hero-sigil">
					<img
						src="/assets/logo_alpha.webp"
						alt="The sigil of Numinous, a winged eye within a mandala of sacred geometry"
						width={196}
						height={196}
						onError={(event) => {
							const img = event.currentTarget;
							img.onerror = null;
							img.src = "/assets/icon-192.png";
							img.style.mixBlendMode = "screen";
							img.style.filter = "none";
						}}
					/>
				</Reveal>
				<Reveal className="hero-kicker" delay="d1">
					THE&nbsp;REALMS,&nbsp;OPENED
				</Reveal>
				<SplitTitle as="h1" className="hero-title" id="heroTitle" text="NUMINOUS" />
				<Reveal className="hero-tag" delay="d2">
					Witness the <em>impossible</em>.
				</Reveal>
				<Reveal className="hero-desc" delay="d3">
					Cinematic visions of the divine and mythical.
					<br />
					New realms every week.
				</Reveal>
				<Reveal className="hero-cta" delay="d4">
					{signal ? (
						<GoldButton to="/products/$slug" params={{ slug: signal.slug }}>
							ENTER THE SIGNAL <span className="ar">→</span>
						</GoldButton>
					) : null}
				</Reveal>
				<Reveal className="hero-foot" delay="d4">
					<div className="tri">SIGNAL&nbsp;&nbsp;·&nbsp;&nbsp;WATCHER</div>
					<div className="scroller" aria-hidden="true">
						<i />
					</div>
				</Reveal>
			</section>

			<div className="marquee" aria-hidden="true">
				<div className="track">
					<span>
						{MARQUEE}
						<b>✦</b>
					</span>
					<span>
						{MARQUEE}
						<b>✦</b>
					</span>
					<span>
						{MARQUEE}
						<b>✦</b>
					</span>
					<span>
						{MARQUEE}
						<b>✦</b>
					</span>
				</div>
			</div>

			<section id="works" aria-label="The Works">
				<div className="wrap">
					<div className="sec-head">
						<Reveal className="eyebrow">CHAPTER&nbsp;I&nbsp;·&nbsp;THREE&nbsp;WORKS</Reveal>
						<SplitTitle className="sec-title" text={"THE\u00A0WORKS"} />
						<Reveal className="sec-sub" delay="d1">
							Traveller, three works: The Signal is free, Watcher is a 28-day
							membership, and Wallpaper Vault is a one-time $12 purchase.
						</Reveal>
					</div>
					<div className="works-grid">
						{works.map((item) => (
							<WorkCard key={item.id} item={item} />
						))}
					</div>
				</div>
			</section>

			<section id="path" aria-label="How to enter">
				<div className="wrap">
					<div className="sec-head">
						<Reveal className="eyebrow">THE&nbsp;RECOMMENDED&nbsp;PATH</Reveal>
						<SplitTitle className="sec-title" text={"HOW\u00A0TO\u00A0ENTER"} />
						<Reveal className="sec-sub" delay="d1">
							Two gates, in this order. Start free. Walk further only if the
							first vision names what you saw.
						</Reveal>
					</div>
					<div className="path-grid">
						{[signal, numinary].map((item, i) =>
							item ? (
								<Reveal key={item.id} delay={i === 1 ? "d1" : i === 2 ? "d2" : undefined}>
									<Link
										to="/products/$slug"
										params={{ slug: item.slug }}
										className="path-card"
										data-hover
									>
										<span className="path-roman">
											{["I", "II"][i]}
										</span>
										<h3>{item.title.toUpperCase()}</h3>
										<p>{item.headline ?? ""}</p>
										<em>{(item.priceLabel ?? "").toUpperCase()}</em>
										<span className="go">
											OPEN THE GATE <span className="ar">→</span>
										</span>
									</Link>
								</Reveal>
							) : null,
						)}
					</div>
				</div>
			</section>

			<section id="interlude" aria-label="Interlude">
				<svg
					className="eye-bg"
					viewBox="0 0 64 64"
					fill="none"
					stroke="#d4af37"
					strokeWidth=".5"
					aria-hidden="true"
				>
					<circle cx="32" cy="32" r="30" />
					<circle cx="32" cy="32" r="24" strokeDasharray="1 3" />
					<path d="M8 32 Q32 12 56 32 Q32 52 8 32 Z" />
					<circle cx="32" cy="32" r="8" />
					<circle cx="32" cy="32" r="3" fill="#d4af37" stroke="none" />
				</svg>
				<div className="wrap">
					<Reveal>
						<blockquote>
							“Cinematic visions of the <b>divine</b> and <b>mythical</b>,
							<br />
							rendered like relics, released like omens.”
						</blockquote>
					</Reveal>
					<Reveal className="" delay="d1">
						<cite>THE&nbsp;NUMINOUS&nbsp;CREED</cite>
					</Reveal>
				</div>
			</section>

			<section id="numinary" aria-label="Watcher membership">
				<div className="wrap">
					<div className="num-grid">
						<div className="num-copy">
							<Reveal className="eyebrow left">
								CHAPTER&nbsp;II&nbsp;·&nbsp;WATCHER
							</Reveal>
							<SplitTitle
								className="sec-title"
								text={"WATCHER"}
							/>
							<Reveal className="lede" delay="d1">
								The membership that runs on the moon. Every <b>28 days</b>, one
								full cycle of the realms: a new being, the veil lifted, the lore
								opened, and a seat at the live table.
							</Reveal>
							<Reveal className="cycle" delay="d2">
								<b>28</b>
								<span>DAYS&nbsp;·&nbsp;ONE&nbsp;CYCLE&nbsp;·&nbsp;FOUR&nbsp;MOONS</span>
							</Reveal>
							<Reveal className="week-tabs" delay="d2">
								{WEEKS.map((entry, i) => (
									<button
										key={`tab-${entry.week}`}
										type="button"
										className={week === i ? "on" : ""}
										data-hover
										onClick={() => setWeek(i)}
									>
										{entry.week}
									</button>
								))}
							</Reveal>
							<Reveal className="num-panel" delay="d2">
								{WEEKS.map((entry, i) => (
									<div
										key={entry.week}
										className={`num-item ${week === i ? "on" : ""}`}
									>
										<h4>
											<small>{entry.week}</small>
											{entry.title}
										</h4>
										<p>{entry.copy}</p>
									</div>
								))}
							</Reveal>
							<Reveal delay="d3">
								{numinary ? (
									<>
										<GoldButton
											to="/products/$slug"
											params={{ slug: numinary.slug }}
										>
											TAKE A SEAT <span className="ar">→</span>
										</GoldButton>
										<span className="num-price">
											{(numinary.priceLabel ?? "$28 / MOON").toUpperCase()}
										</span>
									</>
								) : null}
							</Reveal>
						</div>
						<Reveal delay="d1">
							<NuminaryOrbit onWeek={setWeek} />
						</Reveal>
					</div>
					<Reveal className="" delay="">
						<div
							style={{ marginTop: "clamp(3rem,6vw,5rem)" }}
							className="num-art"
						>
							<img
								src={
									numinary?.image ??
									"https://assets-2-prod.whop.com/public/uploads/2026-09-12/d35aab33-4d1c-4a27-a1cb-14056670173e/image.png"
								}
								alt="Watcher, art of the membership that runs on the moon"
								loading="lazy"
							/>
							<span className="chip">EVERY&nbsp;28&nbsp;DAYS</span>
						</div>
					</Reveal>
				</div>
			</section>

			<section id="pact" aria-label="The Seven Nights guarantee">
				<div className="wrap">
					<div
						ref={pactRef}
						className={`pact-card rv ${pactOn ? "in" : ""}`}
						id="pactCard"
					>
						<div className="pact-stars" aria-hidden="true">
							{Array.from({ length: 7 }).map((_, i) => (
								<svg key={i} viewBox="0 0 24 24" fill={i === 3 ? "#f0d98c" : "#d4af37"}>
									<path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" />
								</svg>
							))}
						</div>
						<div className="eyebrow" style={{ marginBottom: "1.2rem" }}>
							THE&nbsp;SEVEN&nbsp;NIGHTS
						</div>
						<h2>
							ENTER. IF IT NAMES NOTHING,
							<br />
							<span className="g">RETURN.</span>
						</h2>
						<p className="text">
							Enter, and the first vision is yours. If it names nothing, keep
							what you received: <b>the Signal is free, forever</b>.
						</p>
						<svg className="pact-seal" viewBox="0 0 100 100" aria-hidden="true">
							<circle
								cx="50"
								cy="50"
								r="46"
								fill="#170f04"
								stroke="#b8912a"
								strokeWidth="2"
							/>
							<circle
								cx="50"
								cy="50"
								r="39"
								fill="none"
								stroke="#d4af37"
								strokeWidth="1"
								strokeDasharray="2 3"
							/>
							<path
								d="M20 50 Q50 28 80 50 Q50 72 20 50 Z"
								fill="none"
								stroke="#f0d98c"
								strokeWidth="1.8"
							/>
							<circle
								cx="50"
								cy="50"
								r="9"
								fill="none"
								stroke="#f0d98c"
								strokeWidth="1.8"
							/>
							<circle cx="50" cy="50" r="3.2" fill="#f0d98c" />
							<path
								d="M50 32v-6M64 37l4-5M36 37l-4-5"
								stroke="#d4af37"
								strokeWidth="1.6"
							/>
						</svg>
						<div className="pact-sig">the pact of the seven nights</div>
						<GoldButton to="/returns" className="btn btn-ghost btn-sm">
							READ THE PACT <span className="ar">→</span>
						</GoldButton>
					</div>
				</div>
			</section>

			<section id="finale" aria-label="Enter the realms">
				<svg
					className="eye-bg"
					viewBox="0 0 64 64"
					fill="none"
					stroke="#d4af37"
					strokeWidth=".4"
					aria-hidden="true"
				>
					<circle cx="32" cy="32" r="30" />
					<circle cx="32" cy="32" r="24" strokeDasharray="1 3" />
					<path d="M8 32 Q32 12 56 32 Q32 52 8 32 Z" />
					<circle cx="32" cy="32" r="8" />
					<circle cx="32" cy="32" r="3" fill="#d4af37" stroke="none" />
				</svg>
				<div className="wrap">
					<Reveal className="eyebrow">THE&nbsp;SIGNAL&nbsp;IS&nbsp;OPEN</Reveal>
					<SplitTitle className="" text={"THE\u00A0REALMS\u00A0ARE\u00A0OPEN."} />
					<Reveal delay="d1">
						<p>
							New realms every week. Start free. Walk further only if the first
							vision names what you saw.
						</p>
					</Reveal>
					<Reveal className="cta" delay="d2">
						{signal ? (
							<GoldButton to="/products/$slug" params={{ slug: signal.slug }}>
								ENTER THE SIGNAL <span className="ar">→</span>
							</GoldButton>
						) : null}
					</Reveal>
				</div>
			</section>
		</>
	);
}
