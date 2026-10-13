export function Sigil({
	className,
	size = 64,
}: {
	className?: string;
	size?: number | string;
}) {
	return (
		<svg
			viewBox="0 0 64 64"
			width={size}
			height={size}
			className={className}
			fill="none"
			stroke="#d4af37"
			strokeWidth="1.6"
			aria-hidden="true"
		>
			<circle cx="32" cy="32" r="28" strokeDasharray="2 4" />
			<path d="M10 32 Q32 15 54 32 Q32 49 10 32 Z" />
			<circle cx="32" cy="32" r="7" />
			<circle cx="32" cy="32" r="2.4" fill="#f0d98c" stroke="none" />
			<path d="M32 17v-5M43 21l3-4M21 21l-3-4" />
		</svg>
	);
}
