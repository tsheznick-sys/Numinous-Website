import { useEffect, useState } from "react";

const MARKS = [
	{ id: "hero", roman: "N" },
	{ id: "works", roman: "I" },
	{ id: "numinary", roman: "II" },
	{ id: "pact", roman: "III" },
] as const;

export function ChapterNav() {
	const [active, setActive] = useState("hero");

	useEffect(() => {
		const nodes = MARKS.map((mark) => document.getElementById(mark.id)).filter(
			(node): node is HTMLElement => Boolean(node),
		);
		if (nodes.length === 0) return;
		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
				if (visible?.target.id) setActive(visible.target.id);
			},
			{ threshold: [0.18, 0.4], rootMargin: "-18% 0px -42% 0px" },
		);
		for (const node of nodes) io.observe(node);
		return () => io.disconnect();
	}, []);

	return (
		<nav className="chapter-nav" aria-label="Chapters">
			{MARKS.map((mark) => (
				<a
					key={mark.id}
					href={`#${mark.id}`}
					className={active === mark.id ? "on" : ""}
					data-hover
					aria-label={mark.id}
				>
					<span>{mark.roman}</span>
				</a>
			))}
		</nav>
	);
}
