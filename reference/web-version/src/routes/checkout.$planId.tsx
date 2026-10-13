import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import Whop from "@whop/sdk";
import { useEffect, useRef, useState } from "react";
import {
	ANNUAL_PLAN_ID,
	defaultCheckoutUrl,
	NUMINARY_PLAN_ID,
	SIGNAL_PLAN_ID,
} from "../lib/site";
import { NO_STORE_CACHE_CONTROL } from "../lib/cache-policy";

// Fill in per store. Everything else in this file is the standard design.
const STORE = {
	brandColor: "#d4af37",
	pageBackground: "#05060a",
	wordmark: { src: "/wordmark.svg", alt: "Numinous" },
	// Whop works sales tax out when the payment goes through, so the totals on
	// this page are before tax and the card is charged more. Only set this true
	// when every plan is priced with `override_tax_type: "inclusive"` - then
	// the total shown really is the whole amount.
	taxIncluded: false,
	// Shopify's canonical policy paths, matching the shared footer - keep the
	// two lists pointing at the same pages when tuning them for a store.
	policyLinks: [
		{ label: "Seven Nights", href: "/returns" },
		{ label: "Privacy", href: "/privacy" },
		{ label: "Terms", href: "/terms" },
	],
};

const viteEnv: Record<string, string | undefined> = import.meta.env ?? {};

const ELEMENTS_SRC =
	viteEnv.VITE_WHOP_ELEMENTS_SRC ??
	"https://js.whop.cloud/elements/amber/elements.js";
const ENVIRONMENT = viteEnv.VITE_WHOP_ENVIRONMENT ?? "production";
const API_BASE = (
	viteEnv.VITE_WHOP_API_BASE ?? "https://api.whop.com/api/v1"
).replace(/\/$/, "");
// The page's own address, unless overridden. Whop rejects a return URL that is
// not HTTPS, except for exact `localhost`.
const RETURN_ORIGIN = viteEnv.VITE_WHOP_RETURN_ORIGIN?.replace(/\/$/, "");

type FreeItem = {
	title: string;
	subtitle: string;
	image: string;
	quantity: number;
};

type OrderLine = {
	title: string;
	subtitle: string;
	image: string;
	quantity: number;
	price: number;
	originalPrice?: number;
	discount?: { name: string; amount: number };
	freeItems?: FreeItem[];
	planType?: string | null;
	renewDays?: number | null;
};

type Order = {
	currency: string;
	lines: OrderLine[];
	note?: string;
};

type OrderItem = { planId: string; quantity: number };

/**
 * The optional `items` search param carries the whole cart for the order
 * summary, as `planId:quantity` pairs joined with commas. The plan in the URL
 * path is the one that is charged - for a multi-line cart that is the hidden
 * one-off plan the store's server minted for exactly this cart. These lines
 * are display only, priced from their own plans on the server, so a tampered
 * param can change what the summary shows but never what is paid.
 */
function parseItems(raw: unknown): OrderItem[] {
	if (typeof raw !== "string" || !raw) return [];
	return raw.split(",").flatMap((entry) => {
		const [planId, count] = entry.split(":");
		const quantity = Math.floor(Number(count ?? 1));
		if (!planId || !Number.isFinite(quantity) || quantity < 1) return [];
		return [{ planId, quantity }];
	});
}

// Prices on the wire are in whole currency; this page counts in cents.
function cents(amount: number | null | undefined): number {
	return Math.round((amount ?? 0) * 100);
}

async function planLine(
	whop: InstanceType<typeof Whop>,
	item: OrderItem,
): Promise<(OrderLine & { currency: string }) | null> {
	const plan = await whop.plans.retrieve(item.planId).catch(() => null);
	if (!plan) return null;

	const product = plan.product as { id?: string; title?: string } | null;
	const gallery = product?.id
		? await whop.products
				.retrieve(product.id)
				.then((record) => record.gallery_images)
				.catch(() => undefined)
		: undefined;

	const struck = (plan as { strike_through_initial_price?: number })
		.strike_through_initial_price;
	// A trial plan's initial_price is $0, but the line must never read as a
	// $0.00 charge: the price a seat actually costs is the renewal. Free
	// products (renewal 0 AND initial 0) keep their true $0.00.
	const linePrice =
		typeof plan.renewal_price === "number" && plan.renewal_price > 0
			? plan.renewal_price
			: plan.initial_price;
	return {
		currency: (plan.currency ?? "usd").toUpperCase(),
		title: product?.title ?? plan.title ?? "",
		subtitle: product?.title ? (plan.title ?? "") : "",
		image: gallery?.[0]?.url ?? "",
		quantity: item.quantity,
		price: cents(linePrice) * item.quantity,
		originalPrice: struck == null ? undefined : cents(struck) * item.quantity,
		planType: plan.plan_type ?? null,
		renewDays:
			plan.plan_type === "renewal" && typeof plan.billing_period === "number"
				? plan.billing_period
				: null,
	};
}

// Asks Whop what is being bought, so a plan created after the import is
// purchasable and a price edited in Whop is the price charged. Server-side
// because only server code is given the API credential.
//
// Fill in when the cart carries discounts, bundled free items, or a
// recurring-charge note. The order summary already renders all of them.
const loadOrder = createServerFn({ method: "GET" })
	.inputValidator(
		(input: { planId: string; quantity: number; items: OrderItem[] }) => input,
	)
	.handler(async ({ data }): Promise<Order | null> => {
		setResponseHeader("Cache-Control", NO_STORE_CACHE_CONTROL);
		// Server-side scoping: only the two public gates may be quoted through
		// this endpoint. Anything else short-circuits to null exactly as an
		// unknown plan always has, minus the wasted Whop API call. Sealed
		// works (Codex, Collector) are never quotable here.
		const PUBLIC_PLANS: string[] = [
		SIGNAL_PLAN_ID,
		NUMINARY_PLAN_ID,
		ANNUAL_PLAN_ID,
	];
		const planShape = /^plan_[A-Za-z0-9]{6,64}$/;
		const wantedItems = data.items.length > 0 ? data.items : [{ planId: data.planId, quantity: data.quantity }];
		if (
			!planShape.test(data.planId) ||
			!wantedItems.every(
				(item) =>
					planShape.test(item.planId) && PUBLIC_PLANS.includes(item.planId),
			)
		) {
			return null;
		}

		const whop = new Whop({
			apiKey: process.env.WHOP_API_KEY ?? "",
			baseURL: `${process.env.WHOP_API_ORIGIN ?? "https://api.whop.com"}/api/v1`,
		});

		const wanted =
			data.items.length > 0
				? data.items
				: [{ planId: data.planId, quantity: data.quantity }];
		const lines = (
			await Promise.all(wanted.map((item) => planLine(whop, item)))
		).filter((line) => line !== null);
		if (lines.length === 0) return null;

		const renewing = lines.find((line) => line.renewDays != null);
		const note = renewing?.renewDays
			? `Renews every ${renewing.renewDays} days at the same price. Cancel any time from your Whop library - your seat stays live until the cycle you paid for ends.`
			: undefined;

		return {
			currency: lines[0].currency,
			note,
			lines: lines.map(({ currency: _currency, planType: _pt, renewDays: _rd, ...line }) => line),
		};
	});

// Shape Whop's address element hands back on every change. It already follows
// confirmation-token `billing_details` names, so it can be forwarded as-is
// to the payment's billing address.
type ElementAddress = {
	name?: string;
	line1?: string;
	line2?: string;
	city?: string;
	state?: string;
	postal_code?: string;
	country: string;
};

type AddressValue = {
	complete: boolean;
	address: ElementAddress;
	custom: Record<string, string>;
};

type EmailValue = {
	email: string;
	complete: boolean;
};

function billingPayload(value: AddressValue) {
	const { address } = value;
	const postal_code = address.postal_code?.trim();
	return {
		line1: address.line1?.trim(),
		line2: address.line2?.trim() || undefined,
		city: address.city?.trim(),
		state: address.state?.trim(),
		...(postal_code ? { postal_code } : {}),
		country: address.country,
	};
}

function purchaseErrorMessage(failure: unknown): string {
	const message =
		failure instanceof Error
			? failure.message
			: "Your payment could not be completed.";
	if (/postal_code is required/i.test(message)) {
		return "Add a postal or ZIP code to your address to continue.";
	}
	return message;
}

function money(amount: number, currency: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount / 100);
}

function returnUrl(): string {
	if (typeof window === "undefined") return "";
	return `${RETURN_ORIGIN ?? window.location.origin}/order-complete`;
}

async function readJson(response: Response) {
	const body = await response.json();
	if (!response.ok) {
		throw new Error(body?.error?.message ?? "Checkout could not continue.");
	}
	return body;
}

function loadScript(src: string, flag?: string) {
	return new Promise<void>((resolve, reject) => {
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
		if (flag) script.setAttribute(flag, "");
		script.addEventListener("load", () => {
			script.setAttribute("data-loaded", "true");
			resolve();
		});
		script.addEventListener("error", () => reject(new Error(src)));
		document.head.append(script);
	});
}

const STYLES = `
.ck { --brand: ${STORE.brandColor}; --page-bg: ${STORE.pageBackground}; color: #111111; }
.ck-header { position: relative; display: flex; align-items: center; justify-content: center; height: 86px; background: #ffffff; border-bottom: 1px solid rgba(212, 175, 55, 0.45); }
.ck-wordmark { display: block; width: 140px; height: 45px; object-fit: contain; }
.ck-bands { display: flex; min-height: calc(100vh - 86px); background: linear-gradient(to right, var(--page-bg) 0 53.5%, #f5f5f5 53.5% 100%); font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.ck-band-left { display: flex; justify-content: flex-end; width: 53.5%; padding: 40px 40px 80px 0; box-sizing: border-box; }
.ck-band-right { width: 46.5%; padding: 40px 0 80px 40px; box-sizing: border-box; }
.ck-column { width: 500px; }
.ck-summary { position: sticky; top: 40px; width: 400px; padding: 20px; border: 1px solid rgba(212, 175, 55, 0.32); border-radius: 14px; background: rgba(255, 255, 255, 0.03); }
.ck-line + .ck-line { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(212, 175, 55, 0.16); }
.ck-section { margin-bottom: 32px; }
.ck-heading { margin: 0 0 14px; font-size: 20px; font-weight: 600; color: #000000; }
.ck-express { display: none; }
.ck-express-on { display: block; }
.ck-apple-pay { display: block; width: 100%; height: 48px; padding: 0; border: 0; border-radius: 8px; cursor: pointer; appearance: none; background-color: #000000; background-image: url("https://content.whop.com/payment_methods/apple-pay/submit_buttons/light.svg"); background-repeat: no-repeat; background-position: center; background-size: auto 100%; }
@supports (-webkit-appearance: -apple-pay-button) { .ck-apple-pay { background: none; -webkit-appearance: -apple-pay-button; -apple-pay-button-type: plain; -apple-pay-button-style: black; } }
.ck-apple-pay:disabled { opacity: 0.4; cursor: not-allowed; }
.ck-gpay { display: flex; align-items: center; justify-content: center; width: 100%; height: 48px; margin-top: 10px; border: 0; border-radius: 8px; background: #000000; color: #ffffff; font-family: inherit; font-size: 16px; font-weight: 500; cursor: pointer; }
.ck-gpay:disabled { opacity: 0.4; cursor: not-allowed; }
.ck-or { display: flex; align-items: center; gap: 12px; margin: 14px 0 0; font-size: 13px; color: #6b7177; }
.ck-or::before, .ck-or::after { content: ""; flex: 1; height: 1px; background: rgba(212, 175, 55, 0.35); }
.ck-email-slot { min-height: 49px; }
.ck-address-slot { min-height: 60px; }
.ck-secure { margin: 0; font-size: 14px; color: #707070; }
.ck-panel { padding: 16px; background: #f5f5f5; border: 1px solid rgba(212, 175, 55, 0.28); border-radius: 12px; }
.ck-panel-state { margin: 0; font-size: 14px; color: #545454; }
.ck-panel-error { margin: 0; font-size: 14px; color: #b3261e; }
.ck-card-label { margin-bottom: 4px; font-size: 12px; color: #707070; }
.ck-card-slot { height: 47px; }
.ck-card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.ck-billing-toggle { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 14px; color: #111111; }
.ck-billing-toggle input { width: 16px; height: 16px; accent-color: var(--brand); }
.ck-field input:focus, .ck-panel input:focus, .ck-panel select:focus { outline: none; border-color: rgba(212, 175, 55, 0.75); box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.18); }
.ck-billing-fields { margin-top: 14px; }
.ck-charged { margin: 10px 0 0; font-size: 12px; color: #707070; }
.ck-error { margin: 14px 0 0; font-size: 14px; color: #b3261e; }
.ck-submit { width: 100%; height: 50px; margin-top: 14px; border: 0; border-radius: 12px; background: linear-gradient(115deg, #8a6d1f, #d4af37 38%, #f6e7ae 50%, #d4af37 62%, #8a6d1f); background-size: 230% 100%; color: #141006; font-family: inherit; font-size: 16px; font-weight: 700; letter-spacing: 0.02em; cursor: pointer; transition: filter 0.4s ease; }
.ck-submit:hover { filter: brightness(1.06); }
.ck-submit:focus-visible { outline: 2px solid #141006; outline-offset: 3px; }
.ck-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.ck-branding { margin-top: 14px; min-height: 20px; }
.ck-policies { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 48px; padding-top: 24px; border-top: 1px solid #dedede; }
.ck-policies a { font-size: 14px; color: var(--brand); text-decoration: underline; }
.ck-line { display: flex; align-items: flex-start; gap: 12px; }
.ck-line + .ck-line { margin-top: 16px; }
.ck-thumb-wrap { position: relative; flex: 0 0 auto; }
.ck-thumb { display: block; width: 64px; height: 64px; box-sizing: border-box; object-fit: cover; border: 2px solid #ffffff; border-radius: 16px; }
.ck-thumb-empty { background: #e5e5e5; }
.ck-badge { position: absolute; top: 0; right: 0; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; transform: translate(50%, -50%); border-radius: 50%; background: #000000; color: #ffffff; font-size: 12px; font-weight: 600; }
.ck-line-body { flex: 1; min-width: 0; }
.ck-line-title { margin: 0; font-size: 14px; color: #000000; }
.ck-line-subtitle { margin: 2px 0 0; font-size: 12px; color: #666666; }
.ck-line-discount { display: flex; align-items: center; gap: 4px; margin: 2px 0 0; font-size: 12px; color: #666666; }
.ck-line-prices { text-align: right; }
.ck-line-original { margin: 0; font-size: 12px; color: #666666; text-decoration: line-through; }
.ck-line-price { margin: 0; font-size: 14px; color: #000000; }
.ck-free { position: relative; display: flex; align-items: flex-start; gap: 12px; margin: 12px 0 0 32px; }
.ck-free::before { content: ""; position: absolute; left: -16px; top: -12px; bottom: 50%; width: 1px; background: #dedede; }
.ck-free::after { content: ""; position: absolute; left: -16px; bottom: 50%; width: 16px; height: 1px; background: #dedede; }
.ck-free-thumb { width: 40px; height: 40px; border-radius: 12px; }
.ck-free-badge { width: 18px; height: 18px; }
.ck-totals { margin-top: 24px; }
.ck-total-row { display: flex; justify-content: space-between; font-size: 14px; color: #111111; }
.ck-total-row + .ck-total-row { margin-top: 8px; }
.ck-grand { display: flex; justify-content: space-between; margin-top: 16px; font-size: 18px; font-weight: 600; color: #111111; }
.ck-currency { margin-right: 6px; font-size: 12px; font-weight: 400; color: #666666; }
.ck-savings { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 14px; font-weight: 600; color: #111111; }
.ck-savings-label { display: flex; align-items: center; gap: 6px; }
.ck-tax { margin: 8px 0 0; font-size: 12px; color: #666666; }
.ck-note { margin-top: 16px; padding-top: 16px; border-top: 1px solid #dedede; font-size: 14px; font-weight: 600; color: #111111; }
.ck-bar { display: none; }
@media (max-width: 900px) {
	.ck-bar { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 64px; padding: 0 14px; box-sizing: border-box; background: #f5f5f5; border: 0; border-bottom: 1px solid #dedede; font-family: inherit; cursor: pointer; }
	.ck-bar-label { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #111111; }
	.ck-bar-chevron { color: var(--brand); }
	.ck-bar-totals { text-align: right; }
	.ck-bar-original { margin: 0; font-size: 12px; color: #666666; text-decoration: line-through; }
	.ck-bar-total { margin: 0; font-size: 14px; font-weight: 600; color: #111111; }
	.ck-bands { display: block; min-height: 0; background: var(--page-bg); }
	.ck-band-left { display: block; width: 100%; padding: 24px 14px 40px; }
	.ck-band-right { display: none; width: 100%; padding: 24px 14px 40px; background: #f5f5f5; }
	.ck-open .ck-band-right { display: block; }
	.ck-column, .ck-summary { position: static; width: 100%; }
}

/* Numinous inset bezels for the self-hosted checkout surfaces. */
.ck-header {
	height: 76px;
	margin: 12px 14px 0;
	background: #08090b;
	border: 1px solid rgba(212, 175, 55, 0.4);
	border-radius: 22px;
	box-shadow: inset 0 1px 0 rgba(255, 246, 214, 0.1), inset 0 0 0 1px rgba(212, 175, 55, 0.07);
}
.ck-column {
	box-sizing: border-box;
	padding: clamp(18px, 3vw, 28px);
	border: 1px solid rgba(212, 175, 55, 0.4);
	border-radius: 22px;
	background: #f8f6ef;
	color: #111111;
	box-shadow: inset 0 1px 0 rgba(255, 246, 214, 0.65), inset 0 0 0 1px rgba(212, 175, 55, 0.08), 0 16px 36px -28px rgba(0, 0, 0, 0.75);
}
.ck-summary {
	box-sizing: border-box;
	border-color: rgba(212, 175, 55, 0.42);
	border-radius: 22px;
	background: #fbfaf6;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 0 0 1px rgba(212, 175, 55, 0.08), 0 14px 34px -28px rgba(0, 0, 0, 0.35);
}
.ck-band-right { background: #f4f1e9; }
.ck-panel {
	border-color: rgba(212, 175, 55, 0.36);
	border-radius: 18px;
	background: #fffdfa;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(212, 175, 55, 0.06);
}
.ck-card-slot {
	box-sizing: border-box;
	border: 1px solid rgba(212, 175, 55, 0.22);
	border-radius: 12px;
	background: #ffffff;
}
.ck-apple-pay, .ck-gpay {
	border-radius: 12px;
	box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.38), 0 3px 10px -7px rgba(0, 0, 0, 0.7);
}
.ck-thumb { border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 18px; }
.ck-free-thumb { border-radius: 12px; }
.ck-submit {
	position: relative;
	isolation: isolate;
	overflow: hidden;
	border-radius: 999px;
	box-shadow: inset 0 1px 0 rgba(255, 246, 214, 0.55), inset 0 0 0 1px rgba(20, 16, 6, 0.18), 0 8px 18px -12px rgba(138, 109, 31, 0.8);
}
.ck-submit::after {
	content: "";
	position: absolute;
	inset: 4px;
	z-index: 0;
	border: 1px solid rgba(20, 16, 6, 0.2);
	border-radius: inherit;
	pointer-events: none;
}
.ck-bar {
	box-sizing: border-box;
	width: calc(100% - 24px);
	margin: 10px 12px;
	border: 1px solid rgba(212, 175, 55, 0.4);
	border-radius: 12px;
	background: #111315;
	box-shadow: inset 0 1px 0 rgba(255, 246, 214, 0.1), inset 0 0 0 1px rgba(212, 175, 55, 0.07);
}
.ck-bar-label, .ck-bar-total { color: #f5f1e8; }
.ck-bar-original { color: #aaa59b; }
.ck-bar:focus-visible, .ck-apple-pay:focus-visible, .ck-gpay:focus-visible {
	outline: 2px solid #b38d2c;
	outline-offset: 3px;
}

/* A restrained checkout arrival plus tactile, motion-safe payment controls. */
@keyframes ck-arrive {
	from { opacity: 0; }
	to { opacity: 1; }
}
.ck-header, .ck-column, .ck-summary {
	animation: ck-arrive 520ms ease both;
}
.ck-header { animation-delay: 0ms; }
.ck-column { animation-delay: 70ms; }
.ck-summary { animation-delay: 140ms; }
.ck-submit {
	transition: filter 0.4s ease, transform 0.22s ease, box-shadow 0.22s ease;
}
.ck-apple-pay, .ck-gpay {
	transition: transform 0.22s ease, box-shadow 0.22s ease;
}
@media (hover: hover) and (pointer: fine) {
	.ck-submit:hover:not(:disabled), .ck-apple-pay:hover:not(:disabled), .ck-gpay:hover:not(:disabled) {
		transform: translateY(-1px);
	}
}
.ck-submit:active:not(:disabled) { transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
	.ck-header, .ck-column, .ck-summary { animation: none !important; opacity: 1 !important; }
	.ck-submit, .ck-apple-pay, .ck-gpay { transition: none !important; transform: none !important; }
}


`;

function TagIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
			<path
				d="M1.5 7.2V2.5a1 1 0 0 1 1-1h4.7a1 1 0 0 1 .7.3l6.3 6.3a1 1 0 0 1 0 1.4l-4.7 4.7a1 1 0 0 1-1.4 0L1.8 7.9a1 1 0 0 1-.3-.7Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
			<circle cx="4.8" cy="4.8" r="1" fill="currentColor" />
		</svg>
	);
}

// Some products have no gallery image at all, and an empty string in an
// <img src> renders as a broken image - show a plain grey block of the same
// shape instead.
function Thumb(props: {
	image: string;
	title: string;
	quantity: number;
	small?: boolean;
}) {
	const size = props.small ? " ck-free-thumb" : "";
	return (
		<div className="ck-thumb-wrap">
			{props.image ? (
				<img
					className={`ck-thumb${size}`}
					src={props.image}
					alt={props.title}
				/>
			) : (
				<div className={`ck-thumb ck-thumb-empty${size}`} aria-hidden="true" />
			)}
			<span className={`ck-badge${props.small ? " ck-free-badge" : ""}`}>
				{props.quantity}
			</span>
		</div>
	);
}

function OrderSummary(props: { order: Order; total: number }) {
	const { order, total } = props;
	const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
	const subtotal = order.lines.reduce((sum, line) => sum + line.price, 0);
	const savings =
		order.lines.reduce(
			(sum, line) => sum + (line.originalPrice ?? line.price),
			0,
		) - subtotal;
	// Trial truth: a $0 total due today must never read as free. Name it,
	// and name what the seat costs after the trial.
	const renew = order.lines.find((line) => line.renewDays);
	const trialDueToday = total === 0 && subtotal > 0 && Boolean(renew);

	return (
		<div className="ck-summary">
			{order.lines.map((line, index) => (
				<div key={`${line.title}-${index}`}>
					<div className="ck-line">
						<Thumb
							image={line.image}
							title={line.title}
							quantity={line.quantity}
						/>
						<div className="ck-line-body">
							<p className="ck-line-title">{line.title}</p>
							<p className="ck-line-subtitle">{line.subtitle}</p>
							{line.discount ? (
								<p className="ck-line-discount">
									<TagIcon />
									{line.discount.name} −
									{money(line.discount.amount, order.currency)}
								</p>
							) : null}
						</div>
						<div className="ck-line-prices">
							{line.originalPrice && line.originalPrice !== line.price ? (
								<p className="ck-line-original">
									{money(line.originalPrice, order.currency)}
								</p>
							) : null}
							<p className="ck-line-price">
								{money(line.price, order.currency)}
							</p>
						</div>
					</div>
					{(line.freeItems ?? []).map((free, freeIndex) => (
						<div className="ck-free" key={`${free.title}-${freeIndex}`}>
							<Thumb
								image={free.image}
								title={free.title}
								quantity={free.quantity}
								small
							/>
							<div className="ck-line-body">
								<p className="ck-line-title">{free.title}</p>
								<p className="ck-line-subtitle">{free.subtitle}</p>
							</div>
							<div className="ck-line-prices">
								<p className="ck-line-price">FREE</p>
							</div>
						</div>
					))}
				</div>
			))}

			<div className="ck-totals">
				<div className="ck-total-row">
					<span>
						Subtotal · {itemCount} item{itemCount === 1 ? "" : "s"}
					</span>
					<span>{money(subtotal, order.currency)}</span>
				</div>
				{trialDueToday && renew?.renewDays ? (
					<div className="ck-total-row">
						<span>After the trial</span>
						<span>
							{money(subtotal, order.currency)} / {renew.renewDays} days
						</span>
					</div>
				) : null}
				<div className="ck-grand">
					<span>{trialDueToday ? "Due today" : "Total"}</span>
					<span>
						<span className="ck-currency">{order.currency}</span>
						{money(total, order.currency)}
					</span>
				</div>
				{savings > 0 ? (
					<div className="ck-savings">
						<span className="ck-savings-label">
							<TagIcon />
							TOTAL SAVINGS
						</span>
						<span>{money(savings, order.currency)}</span>
					</div>
				) : null}
				<p className="ck-tax">
					{STORE.taxIncluded
						? "Tax is included. The total shown is the whole amount."
						: "Sales tax is added at payment, so your card is charged more than the total shown."}
				</p>
				{order.note ? <div className="ck-note">{order.note}</div> : null}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/checkout/$planId")({
	headers: () => ({ "Cache-Control": NO_STORE_CACHE_CONTROL }),
	component: CheckoutPage,
	validateSearch: (search: Record<string, unknown>) => ({
		quantity: Math.max(1, Number(search.quantity ?? 1) || 1),
		items: typeof search.items === "string" ? search.items : "",
	}),
	loaderDeps: ({ search }) => ({
		quantity: search.quantity,
		items: search.items,
	}),
	beforeLoad: ({ params }) => {
		const destination = defaultCheckoutUrl({ planId: params.planId });
		if (destination) {
			throw redirect({
				href: destination,
				headers: { "Cache-Control": NO_STORE_CACHE_CONTROL },
			});
		}
	},
	loader: async ({ params, deps }) => {
		const order = await loadOrder({
			data: {
				planId: params.planId,
				quantity: deps.quantity,
				items: parseItems(deps.items),
			},
		});
		const destination = defaultCheckoutUrl({
			planId: params.planId,
			title: order?.lines[0]?.title,
		});
		if (destination) {
			throw redirect({
				href: destination,
				headers: { "Cache-Control": NO_STORE_CACHE_CONTROL },
			});
		}
		return order;
	},
	head: () => ({ meta: [{ title: "Checkout" }] }),
});

function CheckoutPage() {
	const { planId } = Route.useParams();
	const { quantity, items } = Route.useSearch();
	const order = Route.useLoaderData();

	const cardNumberRef = useRef<HTMLDivElement>(null);
	const cardExpiryRef = useRef<HTMLDivElement>(null);
	const cardCvcRef = useRef<HTMLDivElement>(null);
	const brandingRef = useRef<HTMLDivElement>(null);
	const emailRef = useRef<HTMLDivElement>(null);
	const shippingAddressRef = useRef<HTMLDivElement>(null);
	const whopRef = useRef<any>(null);
	const paymentRequestRef = useRef<any>(null);
	const paymentsRef = useRef<any>(null);
	const cardFieldsRef = useRef<any>(null);
	const brandingElementRef = useRef<any>(null);
	const emailElementRef = useRef<any>(null);
	const shippingAddressElementRef = useRef<any>(null);
	const sessionRef = useRef<any>(null);

	const [mounted, setMounted] = useState(false);
	const [panelError, setPanelError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [emailValue, setEmailValue] = useState<EmailValue>({
		email: "",
		complete: false,
	});
	const [shippingValue, setShippingValue] = useState<AddressValue | null>(null);
	const [cardComplete, setCardComplete] = useState(false);
	const [walletReady, setWalletReady] = useState({
		applePay: false,
		googlePay: false,
	});
	// show() refuses until canMakePayment() has settled for this session, so
	// the wallet buttons stay disabled until then.
	const [walletPrimed, setWalletPrimed] = useState(false);
	const [summaryOpen, setSummaryOpen] = useState(false);
	const [quotedTotal, setQuotedTotal] = useState<number | null>(null);

	const emailComplete = emailValue.complete;
	const billingComplete = shippingValue?.complete ?? false;
	const currency = order?.currency ?? "USD";
	const listedTotal =
		order?.lines.reduce((sum, line) => sum + line.price, 0) ?? 0;
	const chargedTotal = quotedTotal ?? listedTotal;
		const needsCard = chargedTotal !== 0;

		// Safari always gets the Apple Pay button. Whop's own check can say no on
		// a page like this even when the phone or Mac can pay, and Apple's sheet
		// tells the buyer itself if it really cannot.
	useEffect(() => {
		if ((window as any).ApplePaySession) {
			setWalletReady((current) => ({ ...current, applePay: true }));
		}
	}, []);

	useEffect(() => {
		if (!order) return;
		let destroyed = false;

		(async () => {
			try {
				await loadScript(ELEMENTS_SRC, "data-whop-elements");
				if (destroyed) return;

				const response = await fetch(`${API_BASE}/checkout_sessions`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						items: [{ plan: planId, quantity }],
						return_url: returnUrl(),
					}),
				});
				const session = await readJson(response);
				if (destroyed) return;
				sessionRef.current = session;

				const amount = Math.round(
					Number(session.quote.breakdown.total.amount) * 100,
				);
				setQuotedTotal(amount);

				const whop = (window as any).WhopElements({ environment: ENVIRONMENT });
				whopRef.current = whop;
				const payments = whop.payments.create({
					// `seller` once the API serves it, `account` from generated copies' older servers -
					// this template is COPIED into storefronts, so it must survive both sides of the rename.
					accountId: (session.seller ?? session.account).id,
					currency: session.quote.currency,
					amount,
					paymentMethodConfiguration: session.payment_method_configuration,
					checkoutSession: {
						id: session.id,
						clientSecret: session.client_secret,
					},
					returnUrl: returnUrl(),
					appearance: {
						// The page is light, so the branding wordmark and every other
						// element must render dark-on-light too - left unset it can
						// default to dark mode and paint text too light to see here.
						theme: { appearance: "light" },
						classes: {
							"whop-Card": { fontSize: "14px", color: "#111111" },
							"whop-CardField": { backgroundColor: "transparent" },
							"whop-CardFieldGroup": {
								backgroundColor: "transparent",
								border: "none",
							},
							"whop-CardFieldInput": {
								height: "47px",
								minHeight: "47px",
								border: "none",
								backgroundColor: "transparent",
								fontSize: "14px",
								color: "#111111",
							},
						},
					},
				});
				paymentsRef.current = payments;

				// The branding notice is REQUIRED: every other payments element holds
				// its reveal until it is mounted, and confirmation refuses without it
				// on the page. It sits under the Complete Purchase button.
				const branding = payments.create("branding");
				brandingElementRef.current = branding;
				branding.mount(brandingRef.current);

				// Seeded from whatever was already typed, so a remount doesn't send
				// the shopper back to a blank email and address.
				const emailElement = payments.create("email", {
					defaultValue: emailValue.email || undefined,
					onChange: (payload: any) => setEmailValue(payload),
					onError: (event: any) => setPanelError(event.message),
				});
				emailElementRef.current = emailElement;
				emailElement.mount(emailRef.current);

				const shippingAddress = payments.create("address", {
					mode: "billing",
					name: "combined",
					defaultValues: shippingValue
						? { address: shippingValue.address }
						: undefined,
					onChange: (payload: any) => setShippingValue(payload),
					onError: (event: any) => setPanelError(event.message),
				});
				shippingAddressElementRef.current = shippingAddress;
				shippingAddress.mount(shippingAddressRef.current);

				setMounted(true);
				if (amount > 0) {
					const cardFields = payments.create("cardFields", {
						layout: "stacked",
						onChange: (payload: any) => setCardComplete(payload.complete),
					});
					cardFieldsRef.current = cardFields;
					cardFields
						.create("cardNumber", {
							onError: (event: any) => setPanelError(event.message),
						})
						.mount(cardNumberRef.current);
					cardFields
						.create("cardExpiry", {
							onError: (event: any) => setPanelError(event.message),
						})
						.mount(cardExpiryRef.current);
					cardFields
						.create("cardCvc", {
							onError: (event: any) => setPanelError(event.message),
						})
						.mount(cardCvcRef.current);
				} else {
					setCardComplete(true);
				}

				// Apple and Google Pay are opened by this page, not by Whop's
				// ready-made express button, which stays blank on storefronts like
				// this one. The request is built now because Apple only opens the
				// sheet when show() runs inside the tap itself. The amount is the
				// session total, so any quantity is charged correctly.
				const wallet = whop.payments.paymentRequest.create({
					accountId: (session.seller ?? session.account).id,
					currency: session.quote.currency,
					amount,
					requestPayerEmail: true,
					requestShipping: false,
					lineItems: order.lines.map((line) => ({
						label: line.title,
						amount: line.price,
					})),
				});
				const keepCurrent = (event: {
					updateWith: (update: object) => void;
				}) => {
					event.updateWith({ amount });
				};
				wallet.onBillingAddressChange(keepCurrent);
				paymentRequestRef.current = wallet;

				const safariApple = Boolean((window as any).ApplePaySession);
				wallet
					.canMakePayment()
					.then((available: { applePay?: boolean; googlePay?: boolean }) => {
						if (destroyed) return;
						setWalletReady({
							applePay: Boolean(available?.applePay) || safariApple,
							googlePay: Boolean(available?.googlePay),
						});
					})
					.catch(() => {
						if (!destroyed) {
							setWalletReady({ applePay: safariApple, googlePay: false });
						}
					})
					.finally(() => {
						if (!destroyed) setWalletPrimed(true);
					});
			} catch (failure) {
				if (destroyed) return;
				setPanelError(
					failure instanceof Error
						? failure.message
						: "This checkout could not be opened.",
				);
			}
		})();

		return () => {
			destroyed = true;
			cardFieldsRef.current?.destroy?.();
			brandingElementRef.current?.destroy?.();
			emailElementRef.current?.destroy?.();
			shippingAddressElementRef.current?.destroy?.();
			paymentsRef.current?.destroy?.();
			cardFieldsRef.current = null;
			brandingElementRef.current = null;
			emailElementRef.current = null;
			shippingAddressElementRef.current = null;
			paymentsRef.current = null;
			sessionRef.current = null;
			paymentRequestRef.current = null;
			setWalletPrimed(false);
			// Apple Pay stays on screen between sessions so the button does not
			// flicker. Google Pay waits for the next session's answer.
			setWalletReady((current) => ({
				applePay: current.applePay,
				googlePay: false,
			}));
			// A remount must not leave the old iframes sitting under the new ones.
			// Email and address are re-seeded from state above, so nothing typed is
			// lost - only the card, which belonged to the session that went away.
			for (const slot of [
				cardNumberRef,
				cardExpiryRef,
				cardCvcRef,
				emailRef,
				shippingAddressRef,
				brandingRef,
			]) {
				if (slot.current) slot.current.innerHTML = "";
			}
			setCardComplete(false);
			setMounted(false);
			// The next plan must not show this one's price while its own session
			// loads, and a failure here must not leave the next plan's button
			// disabled.
			setQuotedTotal(null);
			setPanelError(null);
		};
		// Keyed on what is being bought, not on the `order` object. The loader
		// hands back a new object every time it runs, and restarting here wipes
		// the card and opens a fresh session.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(order), planId, quantity, items]);

		const expressVisible = walletReady.applePay || walletReady.googlePay;

	// Shared by the card button and the wallet buttons. Both end with a
	// confirmation token; only how the token is made differs.
	async function confirmWithToken(confirmationToken?: string) {
		const session = sessionRef.current;
		if (!session) throw new Error("This checkout could not be opened.");
		const response = await fetch(
			`${API_BASE}/checkout_sessions/${session.id}/confirm`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					client_secret: session.client_secret,
					...(confirmationToken
						? { confirmation_token: confirmationToken }
						: {}),
					attestations: { tos_accepted: true },
					expected_quoted_at: session.quote.quoted_at,
				}),
			},
		);
		const result = await readJson(response);

		if (result.last_confirm_error) {
			throw new Error(
				result.last_confirm_error.message ?? "Payment could not be completed.",
			);
		}
		if (result.next_action?.type === "complete") {
			await whopRef.current.payments.handleNextAction({
				clientSecret: result.next_action.client_secret,
				returnUrl: returnUrl(),
			});
		}
		if (
			result.next_action?.type === "redirect" &&
			result.next_action.destination_url
		) {
			window.location.assign(result.next_action.destination_url);
			return;
		}
		window.location.assign(returnUrl());
	}

	// Must be called straight from the tap. Apple refuses to open the sheet
	// if anything asynchronous runs before show().
	function onWalletPay(type: "apple_pay" | "google_pay") {
		const request = paymentRequestRef.current;
		if (!request) return;
		setSubmitting(true);
		setError(null);
		request
			.show(type)
			.then(async (result: any) => {
				await confirmWithToken(result.ctok);
			})
			.catch((failure: unknown) => {
				// Closing the sheet is not a failed payment; the buyer is back on a
				// clean checkout.
				if (
					failure instanceof Error &&
					failure.message === "payment_request_cancelled"
				) {
					return;
				}
				setError(purchaseErrorMessage(failure));
			})
			.finally(() => setSubmitting(false));
	}

	async function onCompletePurchase() {
		const session = sessionRef.current;
		if (!session) return;
		setSubmitting(true);
		setError(null);
		try {
			const addressValue = shippingValue;
			if (!addressValue) {
				throw new Error("Enter a billing address to continue.");
			}
			// $0 plans must not mint a card token. Cards always require a
			// postal code, even when the billing country does not collect one.
			if (!needsCard) {
				try {
					const { confirmationToken } =
						await paymentsRef.current.createConfirmationToken({
							billingDetails: {
								email: emailValue.email.trim(),
								name: addressValue.address.name?.trim(),
								address: billingPayload(addressValue),
							},
						});
					await confirmWithToken(confirmationToken);
				} catch {
					await confirmWithToken();
				}
				return;
			}
			if (!addressValue.address.postal_code?.trim()) {
				throw new Error(
					"Add a postal or ZIP code to your address to continue.",
				);
			}
			const { confirmationToken } =
				await paymentsRef.current.createConfirmationToken({
					billingDetails: {
						email: emailValue.email.trim(),
						name: addressValue.address.name?.trim(),
						address: billingPayload(addressValue),
					},
				});
			await confirmWithToken(confirmationToken);
		} catch (failure) {
			setError(purchaseErrorMessage(failure));
		} finally {
			setSubmitting(false);
		}
	}

	const header = (
		<header className="ck-header">
			<img
				className="ck-wordmark"
				src={STORE.wordmark.src}
				alt={STORE.wordmark.alt}
			/>
		</header>
	);

	if (!order) {
		return (
			<div className="ck">
				<style>{STYLES}</style>
				{header}
				<div className="ck-bands">
					<div className="ck-band-left">
						<div className="ck-column">
							<h1 className="ck-heading">We can't find this checkout</h1>
							<p className="ck-secure">
								This product is no longer available. Go back to the store and
								try again.
							</p>
						</div>
					</div>
					<div className="ck-band-right" />
				</div>
			</div>
		);
	}

	const originalTotal = order.lines.reduce(
		(sum, line) => sum + (line.originalPrice ?? line.price),
		0,
	);

	return (
		<div className={`ck${summaryOpen ? " ck-open" : ""}`}>
			<style>{STYLES}</style>
			{header}

			<button
				className="ck-bar"
				type="button"
				onClick={() => setSummaryOpen(!summaryOpen)}
			>
				<span className="ck-bar-label">
					Order summary
					<span className="ck-bar-chevron" aria-hidden="true">
						{summaryOpen ? "⌃" : "⌄"}
					</span>
				</span>
				<span className="ck-bar-totals">
					{originalTotal === chargedTotal ? null : (
						<p className="ck-bar-original">{money(originalTotal, currency)}</p>
					)}
					<p className="ck-bar-total">{money(chargedTotal, currency)}</p>
				</span>
			</button>

			<div className="ck-bands">
				<div className="ck-band-left">
					<div className="ck-column">
						<div
							className={`ck-section ck-express${
								expressVisible ? " ck-express-on" : ""
							}`}
						>
							{walletReady.applePay ? (
								// Empty on purpose: Safari paints Apple's button via
								// -webkit-appearance; other browsers use the black mark
								// on this class. The label is for screen readers.
								<button
									type="button"
									className="ck-apple-pay"
									aria-label="Apple Pay"
									disabled={submitting || !mounted || !walletPrimed}
									onClick={() => onWalletPay("apple_pay")}
								/>
							) : null}
							{walletReady.googlePay ? (
								<button
									type="button"
									className="ck-gpay"
									disabled={submitting || !mounted || !walletPrimed}
									onClick={() => onWalletPay("google_pay")}
								>
									Pay with Google Pay
								</button>
							) : null}
							<p className="ck-or">or pay another way</p>
						</div>

						<div className="ck-section">
							<h2 className="ck-heading">Email</h2>
							<div className="ck-email-slot" ref={emailRef} />
						</div>

						<div className="ck-section">
							<h2 className="ck-heading">Billing</h2>
							<div className="ck-address-slot" ref={shippingAddressRef} />
						</div>

						<div className="ck-section">
							<h2 className="ck-heading">Secure Checkout</h2>
							<p className="ck-secure">
								Every purchase runs on Whop over an encrypted connection and lands
								instantly in your Whop library. The Signal is free, forever.
								The Watcher is $28 each moon, and any moon can be cancelled.
							</p>
						</div>

						<div className="ck-section">
							<div className="ck-panel" hidden={mounted && !panelError && !needsCard}>
								{panelError ? (
									<p className="ck-panel-error">{panelError}</p>
								) : mounted ? null : (
									<p className="ck-panel-state">Loading payment details…</p>
								)}
								<div hidden={!mounted || Boolean(panelError) || !needsCard}>
									<div className="ck-card-label">Card number</div>
									<div className="ck-card-slot" ref={cardNumberRef} />
									<div className="ck-card-row">
										<div>
											<div className="ck-card-label">
												Expiration date (MM / YY)
											</div>
											<div className="ck-card-slot" ref={cardExpiryRef} />
										</div>
										<div>
											<div className="ck-card-label">Security code</div>
											<div className="ck-card-slot" ref={cardCvcRef} />
										</div>
									</div>
									<p className="ck-charged">
										{STORE.taxIncluded
											? `Your card will be charged ${money(chargedTotal, currency)}, tax included.`
											: `Your card will be charged ${money(chargedTotal, currency)} plus sales tax, so the charge will be higher.`}
									</p>
								</div>
							</div>
							{error ? <p className="ck-error">{error}</p> : null}
							<button
								className="ck-submit"
								type="button"
								disabled={
									!mounted ||
									Boolean(panelError) ||
									!emailComplete ||
									!billingComplete ||
									(needsCard && !cardComplete) ||
									submitting
								}
								onClick={onCompletePurchase}
							>
								{submitting ? "Working…" : "Complete Purchase"}
							</button>
							<div className="ck-branding" ref={brandingRef} />
						</div>

						<div className="ck-policies">
							{STORE.policyLinks.map((link) => (
								<a key={link.href} href={link.href}>
									{link.label}
								</a>
							))}
						</div>
					</div>
				</div>

				<div className="ck-band-right">
					<OrderSummary order={order} total={chargedTotal} />
				</div>
			</div>
		</div>
	);
}
