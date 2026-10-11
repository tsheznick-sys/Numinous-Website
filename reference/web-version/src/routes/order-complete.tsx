import { createFileRoute, Link } from "@tanstack/react-router";
import { GateBriefingFilm } from "../components/complete/GateBriefingFilm";
import { Reveal } from "../components/home/motion";
import { briefingForPlan, type GateBriefing } from "../lib/briefings";
import {
	defaultCheckoutUrl,
	GATE_CHAMBERS,
	storefrontCheckoutHref,
	WATCHER_CHECKOUT_HREF,
	PRODUCT_ROUTES,
	SITE,
} from "../lib/site";
import { NO_STORE_CACHE_CONTROL } from "../lib/cache-policy";

type CompleteSearch = {
	status?: string;
	payment_id?: string;
	plan?: string;
};

export const Route = createFileRoute("/order-complete")({
	headers: () => ({ "Cache-Control": NO_STORE_CACHE_CONTROL }),
	validateSearch: (search: Record<string, unknown>): CompleteSearch => ({
		status: typeof search.status === "string" ? search.status : undefined,
		payment_id:
			typeof search.payment_id === "string" ? search.payment_id : undefined,
		plan: typeof search.plan === "string" ? search.plan : undefined,
	}),
	loaderDeps: ({ search }) => ({
		plan: search.plan,
		status: search.status,
	}),
	loader: ({ deps }) => {
		const failed =
			deps.status === "failed" ||
			deps.status === "error" ||
			deps.status === "canceled";
		const retry =
			storefrontCheckoutHref(deps.plan) ??
			defaultCheckoutUrl({ planId: deps.plan }) ??
			WATCHER_CHECKOUT_HREF;
		return {
			failed,
			retry: failed ? retry : null,
			briefing: failed ? null : briefingForPlan(deps.plan),
		};
	},
	head: ({ loaderData }) => {
		const briefing = loaderData?.briefing;
		const title = briefing
			? `${briefing.productTitle} · Numinous`
			: "The gate has opened · Numinous";
		return {
			meta: [
				{ title },
				{ property: "og:title", content: title },
				{ property: "og:description", content: SITE.tagline },
				{ property: "og:image", content: SITE.card },
				{ name: "twitter:card", content: "summary_large_image" },
			],
		};
	},
	component: OrderComplete,
});

function OrderComplete() {
	const { failed, briefing, retry } = Route.useLoaderData();

	if (briefing) {
		return <BriefingComplete briefing={briefing} />;
	}

	return (
		<section className="complete-page">
			<Reveal className="complete-result">
				<img
					src="/assets/icon-192.png"
					alt=""
					className="hero-seal"
					style={{ width: 72, height: 72 }}
				/>
				<p className="kicker">{failed ? "The gate held" : "The gate opened"}</p>
				<div className="gold-rule" />
				<h1>
					{failed
						? "The offering did not pass."
						: "Traveller, you are inside."}
				</h1>
				<p className="sub" style={{ marginTop: "1rem" }}>
					{failed
						? "Nothing was taken. You may try the gate again, or return to the works."
						: "Your files and seats wait in your Whop library. If anything needs a human hand, numinous.support@gmail.com."}
				</p>
				<div className="hero-actions">
					{failed && retry ? (
						<a href={retry} className="btn btn-gold" rel="noopener">
							Try the gate again
						</a>
					) : (
						<Link to="/" reloadDocument className="btn btn-gold">
							Return to Numinous
						</Link>
					)}
					{failed ? (
						<Link to="/" reloadDocument className="btn btn-ghost">
							Return to Numinous
						</Link>
					) : (
						<Link
							to="/collections/$label"
							params={{ label: "all" }}
							className="btn btn-ghost"
						>
							The Works
						</Link>
					)}
				</div>
			</Reveal>
		</section>
	);
}

type NextStep = {
	title: string;
	copy: string;
	to?: string;
	params?: Record<string, string>;
	linkLabel?: string;
};

const NEXT_STEPS: Record<string, NextStep[]> = {
	signal: [
		{
			title: "Open your library",
			copy: "The Signal room and every file wait in your Whop library. This page was only the threshold.",
		},
		{
			title: "Meet The Numinary Agent",
			copy: "When the Creator is away, The Numinary Agent is your primary AI assistant in Numinous Community. Consult it directly about myth, symbols, and the realms; it does not speak for the Creator.",
		},
		{
			title: "Read The First Vision tonight",
			copy: "Ten pages. If it names what you saw, the Watcher gate will be here when you are ready.",
		},
		{
			title: "Find the sealed editions",
			copy: "The e-books of the house never touch the open feed. They are found inside The Numinary, shown to those who joined the Signal.",
			to: "/products/$slug",
			params: { slug: PRODUCT_ROUTES.numinary },
			linkLabel: "Walk to The Numinary",
		},
		{
			title: "Write if you need a hand",
			copy: "numinous.support@gmail.com - answered by a person, not a form.",
		},
	],
	watcher: [
		{
			title: "Open your seat",
			copy: "Week I, The Realm, is live the moment you sit. The month's new being is already waiting.",
		},
		{
			title: "Meet The Numinary Agent",
			copy: "When the Creator is away, The Numinary Agent is your primary AI assistant in Numinous Community. Consult it directly about myth, symbols, and the realms; it does not speak for the Creator.",
		},
		{
			title: "Walk the cycle",
			copy: "Four weeks: The Realm, The Process, The Records, The Session. A new being every 28 days. Cancel any moon.",
		},
		{
			title: "Find the sealed editions",
			copy: "The numbered e-books are shown inside the rooms, never on the feed. Your library points the way.",
		},
		{
			title: "Write if you need a hand",
			copy: "numinous.support@gmail.com - answered by a person, not a form.",
		},
	],
};

function chambersFor(briefing: GateBriefing) {
	if (briefing.id === "watcher") return GATE_CHAMBERS["The Numinary"] ?? null;
	return GATE_CHAMBERS[briefing.productTitle] ?? null;
}

function BriefingComplete({ briefing }: { briefing: GateBriefing }) {
	const chambers = chambersFor(briefing);
	const steps = NEXT_STEPS[briefing.id] ?? [];
	return (
		<section className="complete-page complete-briefing">
			<p className="kicker">{briefing.productTitle}</p>
			<div className="gold-rule" />
			<h1>Traveller, you are inside.</h1>
			<GateBriefingFilm briefing={briefing} />
			<p className="complete-library-note">
				The rooms live in your Whop library, not on this storefront.
			</p>
			<div className="hero-actions">
				<a href={briefing.library} className="btn btn-gold">
					{briefing.cta}
				</a>
				<Link to="/" reloadDocument className="btn btn-ghost">
					Return to Numinous
				</Link>
			</div>

			{chambers ? (
				<Reveal className="complete-holdings">
					<p className="kicker">What you hold</p>
					<div className="holdings-grid">
						{chambers.map((chamber) => (
							<div className="holding" key={chamber.roman}>
								<span className="holding-roman">{chamber.roman}</span>
								<h3>{chamber.title}</h3>
								<p>{chamber.copy}</p>
							</div>
						))}
					</div>
				</Reveal>
			) : null}

			{steps.length ? (
				<Reveal className="complete-next" delay="d1">
					<p className="kicker">What happens next</p>
					<ol className="next-steps">
						{steps.map((step, i) => (
							<li key={step.title}>
								<span className="next-roman">
									{["I", "II", "III", "IV", "V"][i]}
								</span>
								<div>
									<h3>{step.title}</h3>
									<p>{step.copy}</p>
									{step.to ? (
										<Link
											to={step.to}
											params={step.params}
											className="btn btn-ghost btn-sm next-link"
											data-cta="watcher"
											data-cta-location="closing"
										>
											{step.linkLabel}
										</Link>
									) : null}
								</div>
							</li>
						))}
					</ol>
				</Reveal>
			) : null}

			<details className="complete-read">
				<summary>Read the briefing</summary>
				<ol>
					{briefing.scenes.map((scene) => (
						<li key={scene.id}>
							<p className="film-kicker">{scene.kicker}</p>
							<h2>{scene.title}</h2>
							<p>{scene.copy}</p>
						</li>
					))}
				</ol>
			</details>
		</section>
	);
}
