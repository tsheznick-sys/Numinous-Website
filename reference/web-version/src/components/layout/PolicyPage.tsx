import type { ReactNode } from "react";
import { Reveal } from "../home/motion";

export function PolicyPage({
	kicker,
	title,
	children,
	className = "",
}: {
	kicker: string;
	title: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			className={`policy-page ${className}`.trim()}
			aria-labelledby="policy-title"
		>
			<Reveal className="section-head">
				<p className="kicker">{kicker}</p>
				<div className="gold-rule" />
				<h1 id="policy-title" className="section-title">{title}</h1>
			</Reveal>
			<Reveal className="policy-copy" delay="d1">
				{children}
			</Reveal>
		</section>
	);
}
