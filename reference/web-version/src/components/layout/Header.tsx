import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sigil } from "../brand/Sigil";
import { magnetHandlers, useFinePointer } from "../home/motion";
import {
	PRODUCT_ROUTES,
	VAULT_CHECKOUT_HREF,
	WATCHER_CHECKOUT_HREF,
} from "../../lib/site";

type HeaderProps = {
	onCartOpen: () => void;
	cartCount: number;
};

export function Header({ onCartOpen, cartCount }: HeaderProps) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const home = pathname === "/";
	// Per-gate header CTAs: the seat on the Watcher's page, the Vault on its
	// page, the free Signal everywhere else.
	const numinary = pathname === `/products/${PRODUCT_ROUTES.numinary}`;
	const vault = pathname === `/products/${PRODUCT_ROUTES.wallpaper}`;
	const fine = useFinePointer();
	const magnet = magnetHandlers(fine);
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		let lastY = window.scrollY;
		let frame = 0;
		const update = () => {
			frame = 0;
			if (document.hidden) return;
			const y = window.scrollY;
			setScrolled(y > 40);
			setHidden(y > lastY && y > 420 && !open);
			lastY = y;
		};
		const schedule = () => {
			if (frame || document.hidden) return;
			frame = requestAnimationFrame(update);
		};
		const onVisibility = () => {
			if (document.hidden) {
				if (frame) cancelAnimationFrame(frame);
				frame = 0;
				return;
			}
			schedule();
		};
		window.addEventListener("scroll", schedule, { passive: true });
		document.addEventListener("visibilitychange", onVisibility);
		schedule();
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [open]);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	function close() {
		setOpen(false);
	}

	return (
		<>
			<header
				id="nav"
				className={`${scrolled ? "scrolled" : ""} ${hidden ? "nav-away" : ""}`.trim()}
			>
				<Link to="/" reloadDocument className="brand" data-hover aria-label="Numinous home">
					<Sigil size={38} />
					<b>NUMINOUS</b>
				</Link>
				<nav className="nav-links" aria-label="Primary">
					{home ? (
						<a href="#works" data-hover>
							THE WORKS
						</a>
					) : (
						<Link
							to="/collections/$label"
							params={{ label: "all" }}
							data-hover
						>
							THE WORKS
						</Link>
					)}
					{home ? (
						<a href="#numinary" data-hover>
							WATCHER
						</a>
					) : (
						<Link
							to="/products/$slug"
							params={{ slug: PRODUCT_ROUTES.numinary }}
							data-hover
						>
							WATCHER
						</Link>
					)}
					{home ? (
						<a href="#faq" data-hover>
							FAQ
						</a>
					) : (
						<a href="/#faq" data-hover>
							FAQ
						</a>
					)}
					{home ? (
						<a href="#pact" data-hover>
							THE PACT
						</a>
					) : (
						<Link to="/returns" data-hover>
							THE PACT
						</Link>
					)}
					<button
						type="button"
						className="nav-cart"
						data-hover
						onClick={onCartOpen}
						aria-label={
							cartCount > 0 ? `Open cart, ${cartCount} items` : "Open cart"
						}
					>
						CART{cartCount > 0 ? ` (${cartCount})` : ""}
					</button>
				</nav>
				{numinary ? (
					<a
						href={WATCHER_CHECKOUT_HREF}
						className="btn btn-gold btn-sm nav-cta"
						data-hover
						data-magnet
						data-cta="watcher"
						data-cta-location="nav"
						{...magnet}
					>
						TAKE A SEAT <span className="ar">→</span>
					</a>
				) : vault ? (
					<a
						href={VAULT_CHECKOUT_HREF}
						className="btn btn-gold btn-sm nav-cta"
						data-hover
						data-magnet
						data-cta="vault"
						data-cta-location="nav"
						{...magnet}
					>
						ENTER THE VAULT <span className="ar">→</span>
					</a>
				) : (
					<Link
						to="/products/$slug"
						params={{ slug: PRODUCT_ROUTES.signal }}
						className="btn btn-gold btn-sm nav-cta"
						data-hover
						data-magnet
						{...magnet}
					>
						ENTER THE SIGNAL <span className="ar">→</span>
					</Link>
				)}
				<button
					className={`burger ${open ? "open" : ""}`}
					id="burger"
					aria-label="Menu"
					aria-expanded={open}
					onClick={() => setOpen((value) => !value)}
				>
					<span />
					<span />
					<span />
				</button>
			</header>
			<div id="mobile" className={open ? "open" : ""}>
				{home ? (
					<a href="#works" onClick={close}>
						THE WORKS
					</a>
				) : (
					<Link
						to="/collections/$label"
						params={{ label: "all" }}
						onClick={close}
					>
						THE WORKS
					</Link>
				)}
				{home ? (
					<a href="#numinary" onClick={close}>
						WATCHER
					</a>
				) : (
					<Link
						to="/products/$slug"
						params={{ slug: PRODUCT_ROUTES.numinary }}
						onClick={close}
					>
						WATCHER
					</Link>
				)}
				{home ? (
					<a href="#faq" onClick={close}>
						FAQ
					</a>
				) : (
					<a href="/#faq" onClick={close}>
						FAQ
					</a>
				)}
				{home ? (
					<a href="#pact" onClick={close}>
						THE PACT
					</a>
				) : (
					<Link to="/returns" onClick={close}>
						THE PACT
					</Link>
				)}
				<button type="button" onClick={() => { close(); onCartOpen(); }}>
					CART{cartCount > 0 ? ` (${cartCount})` : ""}
				</button>
				{numinary ? (
					<a
						href={WATCHER_CHECKOUT_HREF}
						onClick={close}
						data-cta="watcher"
						data-cta-location="nav-mobile"
						style={{ color: "var(--gold-hi)" }}
					>
						TAKE A SEAT →
					</a>
				) : vault ? (
					<a
						href={VAULT_CHECKOUT_HREF}
						onClick={close}
						data-cta="vault"
						data-cta-location="nav-mobile"
						style={{ color: "var(--gold-hi)" }}
					>
						ENTER THE VAULT →
					</a>
				) : (
					<Link
						to="/products/$slug"
						params={{ slug: PRODUCT_ROUTES.signal }}
						onClick={close}
						style={{ color: "var(--gold-hi)" }}
					>
						ENTER THE SIGNAL →
					</Link>
				)}
			</div>
		</>
	);
}
