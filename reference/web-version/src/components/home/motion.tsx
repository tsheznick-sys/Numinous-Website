import {
	useEffect,
	useRef,
	useState,
	type MouseEvent,
	type ReactNode,
} from "react";

function prefersReducedMotion() {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReveal<T extends Element>() {
	const ref = useRef<T>(null);
	// Visible from the first paint (SSR). Only elements that start below the
	// fold are pulled into the hidden .pre state, then revealed on approach.
	const [on, setOn] = useState(true);

	useEffect(() => {
		if (prefersReducedMotion()) return;
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") return;
		const rect = el.getBoundingClientRect();
		if (rect.top < window.innerHeight * 0.92) return;
		setOn(false);
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setOn(true);
						io.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return { ref, on };
}

export function Reveal({
	className = "",
	delay,
	children,
}: {
	className?: string;
	delay?: string;
	children: ReactNode;
}) {
	const { ref, on } = useReveal<HTMLDivElement>();
	return (
		<div
			ref={ref}
			className={`rv ${delay ?? ""} ${on ? "in" : "pre"} ${className}`.trim()}
		>
			{children}
		</div>
	);
}

export function SplitTitle({
	as: Tag = "h2",
	text,
	className = "",
	id,
}: {
	as?: "h1" | "h2";
	text: string;
	className?: string;
	id?: string;
}) {
	const { ref, on } = useReveal<HTMLHeadingElement>();
	const words = text.split("\u00A0");
	let li = 0;

	return (
		<Tag
			ref={ref}
			id={id}
			className={`split ${on ? "in" : ""} ${className}`.trim()}
			aria-label={text.replace(/\u00A0/g, " ")}
		>
			{words.map((word, wi) => (
				<span key={`${word}-${wi}`}>
					{wi > 0 ? "\u00A0" : null}
					<span className="w" aria-hidden="true">
						{[...word].map((ch, i) => {
							const delay = li++;
							return (
								<span
									key={`${ch}-${i}`}
									className="ch"
									style={{ transitionDelay: `${delay * 0.045}s` }}
								>
									{ch}
								</span>
							);
						})}
					</span>
				</span>
			))}
		</Tag>
	);
}

export function useFinePointer() {
	const [fine, setFine] = useState(false);
	useEffect(() => {
		setFine(
			window.matchMedia("(pointer:fine)").matches && !prefersReducedMotion(),
		);
	}, []);
	return fine;
}

const pendingTransforms = new WeakMap<HTMLElement, { frame: number; value: string }>();

function scheduleTransform(node: HTMLElement, value: string) {
	const pending = pendingTransforms.get(node);
	if (pending) {
		pending.value = value;
		return;
	}
	const next = { frame: 0, value };
	next.frame = requestAnimationFrame(() => {
		if (pendingTransforms.get(node) !== next) return;
		pendingTransforms.delete(node);
		node.style.transform = next.value;
	});
	pendingTransforms.set(node, next);
}

function resetTransform(node: HTMLElement) {
	const pending = pendingTransforms.get(node);
	if (pending) {
		cancelAnimationFrame(pending.frame);
		pendingTransforms.delete(node);
	}
	node.style.transform = "";
}

export function magnetHandlers(enabled: boolean) {
	if (!enabled) return {};
	return {
		onMouseMove: (event: MouseEvent<HTMLElement>) => {
			const node = event.currentTarget;
			const box = node.getBoundingClientRect();
			const x = event.clientX - box.left - box.width / 2;
			const y = event.clientY - box.top - box.height / 2;
			scheduleTransform(node, `translate(${x * 0.18}px, ${y * 0.28}px)`);
		},
		onMouseLeave: (event: MouseEvent<HTMLElement>) => {
			resetTransform(event.currentTarget);
		},
	};
}

export function tiltHandlers(enabled: boolean) {
	if (!enabled) return {};
	return {
		onMouseMove: (event: MouseEvent<HTMLElement>) => {
			const node = event.currentTarget;
			const box = node.getBoundingClientRect();
			const x = (event.clientX - box.left) / box.width - 0.5;
			const y = (event.clientY - box.top) / box.height - 0.5;
			scheduleTransform(
				node,
				`perspective(900px) rotateY(${x * 4.5}deg) rotateX(${-y * 4.5}deg) translateY(-4px)`,
			);
		},
		onMouseLeave: (event: MouseEvent<HTMLElement>) => {
			resetTransform(event.currentTarget);
		},
	};
}
