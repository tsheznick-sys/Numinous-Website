import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "../components/layout/PolicyPage";
import { SITE } from "../lib/site";
import { PUBLIC_DOCUMENT_CACHE_CONTROL } from "../lib/cache-policy";

export const Route = createFileRoute("/privacy")({
	headers: () => ({ "Cache-Control": PUBLIC_DOCUMENT_CACHE_CONTROL }),
	head: () => ({
		links: [{ rel: "canonical", href: SITE.origin + "/privacy" }],
		meta: [
			{ title: "Privacy · Numinous" },
			{
				name: "description",
				content: "What Numinous keeps when you enter a gate.",
			},
			{ property: "og:title", content: "Privacy · Numinous" },
			{ property: "og:description", content: SITE.tagline },
			{ property: "og:image", content: SITE.card },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<PolicyPage kicker="The record" title="Privacy">
			<p>
				When you enter The Signal or The Watcher, Whop collects what the payment
				needs: your email, the gate you entered, and the name you choose to
				bind, if the work asks for one. Card details never sit on this site.
				Whop processes the offering.
			</p>
			<p>
				The Herald form on this site does not store your email. Submitting it
				opens The Signal. The cookie bar writes one small choice to your
				browser. Whop injects its own first-party pixel into every page before our code runs.
			</p>
			<p>
				We use that record to deliver files and seats, and to answer you if you
				write. We do not sell it.
			</p>
			<p>
				This site is hosted on Whop. Whop&apos;s own records of visits,
				payments, and memberships apply in addition to these words.
			</p>
			<p>
				The watching continues on Instagram at {SITE.instagramHandle}. That
				house has its own rules.
			</p>
		</PolicyPage>
	);
}
