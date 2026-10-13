import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage } from "../components/layout/PolicyPage";
import { SITE } from "../lib/site";
import { PUBLIC_DOCUMENT_CACHE_CONTROL } from "../lib/cache-policy";

export const Route = createFileRoute("/terms")({
	headers: () => ({ "Cache-Control": PUBLIC_DOCUMENT_CACHE_CONTROL }),
	head: () => ({
		links: [{ rel: "canonical", href: SITE.origin + "/terms" }],
		meta: [
			{ title: "Terms · Numinous" },
			{
				name: "description",
				content: "How the two gates of Numinous open, and what stays closed.",
			},
			{ property: "og:title", content: "Terms · Numinous" },
			{ property: "og:description", content: SITE.tagline },
			{ property: "og:image", content: SITE.card },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: TermsPage,
});

function TermsPage() {
	return (
		<PolicyPage kicker="The pact" title="Terms">
			<p>
				Numinous has two public gates. The Signal is free, forever. The Watcher
				is $28 every 28 days. Files and seats arrive in your Whop library when
				the gate opens.
			</p>
			<p>
				The Watcher is covered by the <Link to="/returns">Seven Nights</Link>.
				The Signal is free. Any other work, if one is later opened, is final the
				moment it opens.
			</p>
			<p>
				Watcher renews with the moon until you cancel. You may leave any cycle.
				Access stays until that moon ends.
			</p>
			<p>
				You may not resell, republish, or share a seat. The vision is licensed
				to you, not given away.
			</p>
			<p>
				Payments, refunds, and seats run through Whop. If a gate fails to open
				after a completed offering, write through the store and the record will
				be read.
			</p>
		</PolicyPage>
	);
}
