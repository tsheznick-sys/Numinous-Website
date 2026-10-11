import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { CartLine } from "../../lib/cart";
import { useCartStore } from "../../lib/cart";
import { defaultCheckoutUrl, storefrontCheckoutHref } from "../../lib/site";
import { formatCents } from "../../lib/storefront-account";

type CartDrawerProps = {
	open: boolean;
	onClose: () => void;
};

function CheckoutLink({
	line,
	label,
	onClose,
}: {
	line: CartLine;
	label: string;
	onClose: () => void;
}) {
	// The exact storefront checkout href wins so cart checkout uses the same
	// link the gate CTAs carry; hosted Whop checkout is the fallback.
	const external =
		storefrontCheckoutHref(line.planId) ??
		defaultCheckoutUrl({
			planId: line.planId,
			title: line.title,
		});
	if (external) {
		return (
			<a
				href={external}
				className="btn btn-gold"
				style={{ width: "100%" }}
				onClick={onClose}
			>
				{label}
			</a>
		);
	}
	return (
		<Link
			to="/checkout/$planId"
			params={{ planId: line.planId }}
			search={{
				quantity: 1,
				items: `${line.planId}:1`,
			}}
			className="btn btn-gold"
			style={{ width: "100%" }}
			onClick={onClose}
		>
			{label}
		</Link>
	);
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
	const lines = useCartStore((state) => state.lines);
	const removeLine = useCartStore((state) => state.removeLine);
	const panelRef = useRef<HTMLElement>(null);
	const opener = useRef<Element | null>(null);

	useEffect(() => {
		if (!open) return;
		opener.current = document.activeElement;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		panelRef.current?.focus();
		return () => {
			window.removeEventListener("keydown", onKey);
			if (opener.current instanceof HTMLElement) opener.current.focus();
		};
	}, [open, onClose]);

	if (!open) return null;

	const subtotal = lines.reduce(
		(sum, line) => sum + line.priceCents * line.quantity,
		0,
	);

	return (
		<div
			role="presentation"
			className="cart-overlay"
			onClick={onClose}
		>
			<aside
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label="Cart"
				tabIndex={-1}
				className="cart-panel"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="cart-head">
					<p className="kicker">The vessel</p>
					<h2>YOUR OFFERING</h2>
					<button type="button" className="cart-close" onClick={onClose} aria-label="Close cart">
						✕
					</button>
				</div>
				{lines.length === 0 ? (
					<p className="cart-empty">The vessel is empty, traveller.</p>
				) : (
					<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
						{lines.map((line) => (
							<li key={line.planId} className="cart-line">
								{line.image ? (
									<img src={line.image} alt="" />
								) : (
									<div
										style={{
											width: 72,
											height: 96,
											background: "#14131c",
											border: "1px solid rgba(201,162,39,0.28)",
										}}
									/>
								)}
								<div>
									<div className="cart-line-title">{line.title}</div>
									<div className="cart-line-price">
										{formatCents(line.priceCents)}
									</div>
									<div className="cart-line-actions">
										<button
											type="button"
											onClick={() => removeLine(line.planId)}
										>
											Remove
										</button>
									</div>
									{lines.length > 1 ? (
										<div style={{ marginTop: "0.7rem" }}>
											<CheckoutLink
												line={line}
												label="Checkout this work"
												onClose={onClose}
											/>
										</div>
									) : null}
								</div>
							</li>
						))}
					</ul>
				)}
				{lines.length > 0 ? (
					<div className="cart-subtotal">
						<span>Subtotal</span>
						<span>{formatCents(subtotal)}</span>
					</div>
				) : null}
				{lines.length === 1 && lines[0] ? (
					<CheckoutLink
						line={lines[0]}
						label="Enter checkout"
						onClose={onClose}
					/>
				) : null}
				{lines.length > 1 ? (
					<p className="cart-empty">Each work opens its own gate.</p>
				) : null}
			</aside>
		</div>
	);
}
