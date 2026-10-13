import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage } from "../components/layout/PolicyPage";
import { PRODUCT_ROUTES, SITE } from "../lib/site";
import { PUBLIC_DOCUMENT_CACHE_CONTROL } from "../lib/cache-policy";

export const Route = createFileRoute("/returns")({
	headers: () => ({ "Cache-Control": PUBLIC_DOCUMENT_CACHE_CONTROL }),
	head: () => ({
		links: [{ rel: "canonical", href: SITE.origin + "/returns" }],
		meta: [
			{ title: "Seven Nights · Numinous" },
			{
				name: "description",
				content:
					"The Watcher gives you seven nights. The Signal is free. Other works are final the moment they open.",
			},
			{ property: "og:title", content: "Seven Nights · Numinous" },
			{ property: "og:description", content: SITE.tagline },
			{ property: "og:image", content: SITE.card },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: ReturnsPage,
});

function ReturnsPage() {
	return (
		<PolicyPage
			kicker="Returns"
			title="Seven Nights"
			className="returns-page"
		>
			<div className="returns-pact">
				<span className="returns-mark" aria-hidden="true">VII</span>
				<p>
					Traveller, The Watcher gives you seven nights. If the room does not name
					what you saw, message within seven nights of the first payment and the
					full amount returns. Keep what you received.
				</p>
			</div>
			<div className="returns-terms">
				<p>
					The Signal is free, forever. After seven nights, Watcher payments are
					final for that cycle. You may cancel any moon. Access stays until the
					current 28-day cycle ends.
				</p>
				<p>
					Any other work, if one is later opened, is final the moment it opens.
				</p>
			</div>
			<nav className="returns-actions" aria-label="Continue">
				<Link
					to="/products/$slug"
					params={{ slug: PRODUCT_ROUTES.numinary }}
					className="btn btn-gold"
				>
					Take a seat in The Watcher <span className="ar">→</span>
				</Link>
				<Link
					to="/products/$slug"
					params={{ slug: PRODUCT_ROUTES.signal }}
					className="btn btn-ghost"
				>
					The Signal · $0, no renewal <span className="ar">→</span>
				</Link>
			</nav>
		</PolicyPage>
	);
}
