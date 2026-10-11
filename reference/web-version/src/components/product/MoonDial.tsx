import { useState, type KeyboardEvent } from "react";
import { MOON_WEEKS, track } from "../../lib/site";

/**
 * The moon dial: 28 ticks for 28 nights, four weeks of seven.
 * The product's own billing cycle, drawn as the brand's signature instrument.
 * Keyboard operable (arrow keys), aria-pressed on every week, polite live region,
 * reduced-motion kills the draw and the arc rotation.
 */
const NIGHTS = 28;
const PER_WEEK = 7;

function tickPoints(index: number, lit: boolean) {
	const angle = (index / NIGHTS) * Math.PI * 2 - Math.PI / 2;
	const inner = 138;
	const outer = lit ? 152 : 146;
	const cx = 170;
	return {
		x1: cx + inner * Math.cos(angle),
		y1: cx + inner * Math.sin(angle),
		x2: cx + outer * Math.cos(angle),
		y2: cx + outer * Math.sin(angle),
	};
}

export function MoonDial() {
	const [week, setWeek] = useState(0);
	const current = MOON_WEEKS[week];

	function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
		if (!keys.includes(event.key)) return;
		event.preventDefault();
		const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
		setWeek((w) => (w + delta + MOON_WEEKS.length) % MOON_WEEKS.length);
	}

	const arcRadius = 128;
	const circumference = 2 * Math.PI * arcRadius;
	const arcLength = circumference / MOON_WEEKS.length * PER_WEEK;

	return (
		<div className="moon-dial">
			<figure className="dial-figure" aria-hidden="true">
				<svg
					className="dial-svg"
					viewBox="0 0 340 340"
					role="presentation"
					focusable="false"
				>
					<circle className="dial-orbit" cx="170" cy="170" r="126" />
					<g className="dial-arc-group">
						<circle
							className="dial-arc"
							cx="170"
							cy="170"
							r={arcRadius}
							strokeDasharray={`${arcLength} ${circumference - arcLength}`}
							style={{
								transform: `rotate(${week * (360 / MOON_WEEKS.length)}deg)`,
							}}
						/>
					</g>
					<g className="dial-ticks">
						{Array.from({ length: NIGHTS }, (_, i) => {
							const lit = Math.floor(i / PER_WEEK) === week;
							const p = tickPoints(i, lit);
							return (
								<line
									key={i}
									className={`dial-tick${lit ? " is-lit" : ""}`}
									style={{ "--i": i } as React.CSSProperties}
									x1={p.x1}
									y1={p.y1}
									x2={p.x2}
									y2={p.y2}
								/>
							);
						})}
					</g>
					<text className="dial-roman" x="170" y="182" textAnchor="middle">
						{current.roman}
					</text>
					<text className="dial-of" x="170" y="212" textAnchor="middle">
						OF IV
					</text>
				</svg>
			</figure>

			<div className="dial-panel">
				<div
					className="dial-weeks"
					role="group"
					aria-label="The four weeks of the moon"
					onKeyDown={onKeyDown}
				>
					{MOON_WEEKS.map((entry, i) => (
						<button
							key={entry.roman}
							type="button"
							className={`dial-week${i === week ? " is-on" : ""}`}
							aria-pressed={i === week}
							data-hover
							onClick={() => {
								setWeek(i);
								track("dial:week", { content_name: entry.title });
							}}
						>
							<span className="w-roman">{entry.roman}</span>
							<span className="w-title">{entry.title}</span>
						</button>
					))}
				</div>
				<p className="dial-copy" key={current.roman}>{current.copy}</p>
				<p className="dial-status" role="status" aria-live="polite">
					{`Week ${current.roman}. ${current.title}. ${current.copy}`}
				</p>
			</div>
		</div>
	);
}
