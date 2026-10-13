import { useEffect, useRef, useState } from "react";

const LOADER_SRC = "https://js.whop.com/static/checkout/loader.js";

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[src="${src}"]`);
		if (existing) {
			if (existing.getAttribute("data-loaded") === "true") {
				resolve();
				return;
			}
			existing.addEventListener("load", () => resolve());
			existing.addEventListener("error", () => reject(new Error(src)));
			return;
		}
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.addEventListener("load", () => {
			script.setAttribute("data-loaded", "true");
			resolve();
		});
		script.addEventListener("error", () => reject(new Error(src)));
		document.head.append(script);
	});
}

type ExpressCheckoutSlotProps = {
	planId: string;
	returnUrl: string;
	theme?: "light" | "dark" | "system";
	className?: string;
};

export function ExpressCheckoutSlot({
	planId,
	returnUrl,
	theme = "light",
	className,
}: ExpressCheckoutSlotProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		if (!planId || !returnUrl) return;
		const host = hostRef.current;
		if (!host) return;
		let button: HTMLElement | null = null;
		let destroyed = false;
		setVisible(true);

		const onResolved = (event: Event) => {
			const detail = (event as CustomEvent<{ rendered?: string }>).detail;
			setVisible(detail?.rendered !== "none");
		};

		loadScript(LOADER_SRC)
			.then(() => {
				if (destroyed || !host) return;
				host.innerHTML = "";
				button = document.createElement("whop-express-checkout-button");
				button.setAttribute("plan-id", planId);
				button.setAttribute("return-url", returnUrl);
				button.setAttribute("methods", "apple-pay,google-pay");
				button.setAttribute("theme", theme);
				button.addEventListener("express-method-resolved", onResolved);
				host.append(button);
			})
			.catch(() => {
				if (!destroyed) setVisible(false);
			});

		return () => {
			destroyed = true;
			button?.removeEventListener("express-method-resolved", onResolved);
			button?.remove();
			host.innerHTML = "";
		};
	}, [planId, returnUrl, theme]);

	// The host stays in the DOM even when hidden, so a later plan change can
	// remount the wallet button into it. Hidden-by-CSS is fine here because
	// this only applies after the wallet has already reported "none".
	return (
		<div
			className={className}
			style={
				visible ? { minHeight: "3rem", width: "100%" } : { display: "none" }
			}
		>
			<div ref={hostRef} style={{ width: "100%" }} />
		</div>
	);
}

export function expressReturnUrl(planId?: string): string {
	if (typeof window === "undefined") return "";
	const origin =
		import.meta.env.VITE_WHOP_RETURN_ORIGIN?.replace(/\/$/, "") ??
		window.location.origin;
	const url = `${origin}/order-complete`;
	return planId ? `${url}?plan=${encodeURIComponent(planId)}` : url;
}
