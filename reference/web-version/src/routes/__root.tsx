import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { Atmosphere } from "../components/atmosphere/Atmosphere";
import { CartDrawer } from "../components/cart/CartDrawer";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { useCartStore } from "../lib/cart";
import { SITE } from "../lib/site";
import styles from "../styles.css?url";

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<a href="#main-content" className="skip-link">
					Skip to content
				</a>
				{children}
				{/* Client error beacon: one shot per page, no PII, lands in the
				    platform's worker logs via /api/errors. */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){var s=false;function r(m){if(s)return;s=true;try{fetch('/api/errors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,message:String(m).slice(0,600)})});}catch(e){}}window.addEventListener('error',function(e){r(e.message)});window.addEventListener('unhandledrejection',function(e){r(e.reason)});})();`,
					}}
				/>
				{/* Browser-local cache and offline fallback for same-origin pages and assets. */}
				<script
					dangerouslySetInnerHTML={{
						__html: `if('serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});}`,
					}}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<section className="complete-page">
			<div>
				<p className="kicker">This chamber is empty</p>
				<div className="gold-rule" />
				<h1>The path does not open here.</h1>
				<p className="sub" style={{ marginTop: "1rem" }}>
					Return to the works, traveller.
				</p>
				<div className="hero-actions">
					<Link to="/" reloadDocument className="btn btn-gold">
						Home
					</Link>
					<Link
						to="/collections/$label"
						params={{ label: "all" }}
						className="btn btn-ghost"
					>
						The Works
					</Link>
				</div>
			</div>
		</section>
	);
}

function RootLayout() {
	const [cartOpen, setCartOpen] = useState(false);
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isCheckout = pathname.startsWith("/checkout/");
	const cartCount = useCartStore((state) =>
		state.lines.reduce((total, line) => total + line.quantity, 0),
	);
	const openTick = useCartStore((state) => state.openTick);

	useEffect(() => {
		void useCartStore.persist.rehydrate();
	}, []);

	useEffect(() => {
		if (openTick > 0) setCartOpen(true);
	}, [openTick]);

	if (isCheckout) {
		return <Outlet />;
	}

	return (
		<div className={`site-shell ${pathname === "/" ? "is-home" : ""}`}>
			<Atmosphere />
			<Header onCartOpen={() => setCartOpen(true)} cartCount={cartCount} />
			<main className="site-main" id="main-content">
				<Outlet />
			</main>
			<Footer />
			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
		</div>
	);
}

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ title: "NUMINOUS · The Realms, Opened" },
			{ name: "description", content: SITE.description },
			{ property: "og:title", content: "NUMINOUS · The Realms, Opened" },
			{ property: "og:description", content: SITE.tagline },
			{ property: "og:image", content: SITE.card },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "theme-color", content: "#05060a" },
			{ name: "referrer", content: "strict-origin-when-cross-origin" },
			{ httpEquiv: "Content-Security-Policy", content: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.whop.com https://static.whop.com https://t.whop.tw https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.whop.com https://content.whop.com https://img-v2-prod.whop.com https://assets-2-prod.whop.com; media-src 'self' https://assets-2-prod.whop.com; font-src 'self' data:; connect-src https://t.whop.tw https://static.cloudflareinsights.com 'self' https://api.whop.com https://www.whop.com; frame-src https://www.whop.com https://js.whop.com https://challenges.cloudflare.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests" },
		],
		links: [
			{ rel: "stylesheet", href: styles },
			{ rel: "manifest", href: "/manifest.webmanifest" },
			{ rel: "icon", href: "/assets/icon-192.png" },
			{ rel: "apple-touch-icon", href: "/assets/icon-192.png" },
			{ rel: "preload", href: "/fonts/Cinzel-900-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "" },
				{ rel: "preload", href: "/fonts/CormorantGaramond-400-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "" },
		],
	}),
	component: RootLayout,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});
