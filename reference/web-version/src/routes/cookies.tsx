import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage } from "../components/layout/PolicyPage";
import { SITE } from "../lib/site";
import { PUBLIC_DOCUMENT_CACHE_CONTROL } from "../lib/cache-policy";

export const Route = createFileRoute("/cookies")({
	headers: () => ({ "Cache-Control": PUBLIC_DOCUMENT_CACHE_CONTROL }),
	head: () => ({
		links: [{ rel: "canonical", href: SITE.origin + "/cookies" }],
		meta: [
			{ title: "Cookies · Numinous" },
			{
				name: "description",
				content: "The Realm keeps its record light. This page is what the banner means.",
			},
			{ property: "og:title", content: "Cookies · Numinous" },
			{ property: "og:description", content: SITE.tagline },
			{ property: "og:image", content: SITE.card },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: CookiesPage,
});

function CookiesPage() {
	return (
		<PolicyPage kicker="THE RECORD" title="Cookies">
			<p>The Realm keeps its record light. This page is what the banner means.</p>
			<p>
				The gold bar at the gate writes one small choice to your browser: Accept
				or Decline. That choice lives in this site only. It does not sell, and
				it does not follow you off these pages.
			</p>
			<p>
				This site is hosted on Whop. Whop injects its own first-party pixel into
				every page before our code runs. That pixel sets a visitor id (
				<code>_wuid</code>) and records page views so a visit can be tied to a
				later checkout. Those records are not turned off by Decline. Checkout
				views, purchases, subscriptions, and trials are also written by Whop on
				the server, whether or not the bar was answered.
			</p>
			<p>
				Accept does not install a second tracker. It only lets this site’s own{" "}
				<code>whop.track</code> calls run after you agree. Decline keeps those
				extra calls off. Do not block Whop domains in the browser. That breaks
				the gate, not the record.
			</p>
			<p>
				The Herald form does not store your email on this site. Submitting it
				opens The Signal. Card details never sit here. Whop processes the
				offering.
			</p>
			<p>
				The watching continues on Instagram at @numinous2.0. That house has its
				own rules.
			</p>
			<p>
				These words sit beside the <Link to="/privacy">Privacy Policy</Link>.
				Whop’s own records of visits, payments, and memberships apply in
				addition to them.
			</p>
		</PolicyPage>
	);
}
