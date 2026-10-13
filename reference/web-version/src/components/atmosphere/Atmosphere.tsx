import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

function roman(n: number) {
	const table: [number, string][] = [
		[100, "C"],
		[90, "XC"],
		[50, "L"],
		[40, "XL"],
		[10, "X"],
		[9, "IX"],
		[5, "V"],
		[4, "IV"],
		[1, "I"],
	];
	let remaining = n;
	let out = "";
	for (const [value, glyph] of table) {
		while (remaining >= value) {
			out += glyph;
			remaining -= value;
		}
	}
	return out || "N";
}

export function Atmosphere() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [veilGone, setVeilGone] = useState(pathname !== "/");
	const [pct, setPct] = useState(1);
	const [bar, setBar] = useState(0);

	useEffect(() => {
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (pathname !== "/" || reduced) {
			setVeilGone(true);
			return;
		}
		const start = performance.now();
		let frame = 0;
		let last = 0;
		const tick = (t: number) => {
			const elapsed = t - start;
			const target = Math.min(100, Math.round(elapsed / 22));
			if (target !== last) {
				last = target;
				setPct(target);
				setBar(target);
			}
			if (elapsed < 2400) {
				frame = requestAnimationFrame(tick);
			} else {
				setVeilGone(true);
			}
		};
		frame = requestAnimationFrame(tick);
		const failsafe = window.setTimeout(() => setVeilGone(true), 4200);
		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(failsafe);
		};
	}, [pathname]);

	useEffect(() => {
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		document.body.style.overflow = veilGone ? "" : "hidden";
		return () => {
			if (reduced) document.body.style.overflow = "";
		};
	}, [veilGone]);

	useEffect(() => {
		const canvasEl = canvasRef.current;
		if (!canvasEl) return;
		const gfx = canvasEl.getContext("2d");
		if (!gfx) return;
		const canvas: HTMLCanvasElement = canvasEl;
		const ctx: CanvasRenderingContext2D = gfx;
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		type Star = {
			x: number;
			y: number;
			r: number;
			d: number;
			tw: number;
			ts: number;
		};
		let stars: Star[] = [];
		let shoot: {
			x: number;
			y: number;
			vx: number;
			vy: number;
			life: number;
		} | null = null;
		let nextShoot = performance.now() + 5000;
		let frame = 0;

		function sizeCv() {
			canvas.width = innerWidth * dpr;
			canvas.height = innerHeight * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			stars = [];
			const n = Math.min(240, Math.floor((innerWidth * innerHeight) / 8500));
			for (let i = 0; i < n; i++) {
				stars.push({
					x: Math.random() * innerWidth,
					y: Math.random() * innerHeight,
					r: Math.random() * 1.25 + 0.25,
					d: Math.random() * 0.7 + 0.3,
					tw: Math.random() * Math.PI * 2,
					ts: 0.004 + Math.random() * 0.016,
				});
			}
		}

		function spawnShoot() {
			shoot = {
				x: Math.random() * innerWidth * 0.8 + innerWidth * 0.1,
				y: Math.random() * innerHeight * 0.3,
				vx: -(4 + Math.random() * 4),
				vy: 2 + Math.random() * 2,
				life: 1,
			};
		}

		function drawStars(t: number) {
			ctx.clearRect(0, 0, innerWidth, innerHeight);
			const sy = window.scrollY * 0.06;
			for (const s of stars) {
				const a = 0.25 + 0.75 * Math.abs(Math.sin(s.tw + t * s.ts));
				let y = (s.y - sy * s.d) % innerHeight;
				if (y < 0) y += innerHeight;
				ctx.beginPath();
				ctx.arc(s.x, y, s.r, 0, 6.283);
				ctx.fillStyle = `rgba(236,227,205,${(a * s.d).toFixed(3)})`;
				ctx.fill();
				if (s.r > 1.1) {
					ctx.beginPath();
					ctx.arc(s.x, y, s.r * 2.6, 0, 6.283);
					ctx.fillStyle = `rgba(212,175,55,${(a * 0.08).toFixed(3)})`;
					ctx.fill();
				}
			}
			if (shoot) {
				shoot.x += shoot.vx;
				shoot.y += shoot.vy;
				shoot.life -= 0.016;
				ctx.strokeStyle = `rgba(240,217,140,${Math.max(0, shoot.life).toFixed(2)})`;
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				ctx.moveTo(shoot.x, shoot.y);
				ctx.lineTo(shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9);
				ctx.stroke();
				if (shoot.life <= 0 || shoot.x < -60 || shoot.y > innerHeight + 60) {
					shoot = null;
				}
			} else if (t > nextShoot) {
				spawnShoot();
				nextShoot = t + 6000 + Math.random() * 9000;
			}
		}

		function loop(t: number) {
			frame = 0;
			if (reduced || document.hidden) return;
			drawStars(t);
			frame = requestAnimationFrame(loop);
		}

		const start = () => {
			if (reduced || document.hidden || frame) return;
			frame = requestAnimationFrame(loop);
		};
		const onVisibility = () => {
			if (document.hidden) {
				if (frame) cancelAnimationFrame(frame);
				frame = 0;
				return;
			}
			start();
		};

		sizeCv();
		window.addEventListener("resize", sizeCv);
		document.addEventListener("visibilitychange", onVisibility);
		if (reduced) drawStars(0);
		else start();

		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("resize", sizeCv);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);

	useEffect(() => {
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (!window.matchMedia("(pointer:fine)").matches || reduced) return;
		const dot = document.querySelector(".cursor-dot") as HTMLElement | null;
		const halo = document.querySelector(".cursor-halo") as HTMLElement | null;
		if (!dot || !halo) return;
		let mx = innerWidth / 2;
		let my = innerHeight / 2;
		let hx = mx;
		let hy = my;
		let frame = 0;
		const paint = () => {
			frame = 0;
			if (document.hidden) return;
			hx += (mx - hx) * 0.16;
			hy += (my - hy) * 0.16;
			dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
			halo.style.transform = `translate(${hx}px,${hy}px) translate(-50%,-50%)`;
			if (Math.abs(mx - hx) > 0.35 || Math.abs(my - hy) > 0.35) {
				frame = requestAnimationFrame(paint);
			}
		};
		const schedule = () => {
			if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
		};
		const onMove = (e: MouseEvent) => {
			mx = e.clientX;
			my = e.clientY;
			schedule();
		};
		const onVisibility = () => {
			if (document.hidden) {
				if (frame) cancelAnimationFrame(frame);
				frame = 0;
				return;
			}
			schedule();
		};
		const onOver = (e: MouseEvent) => {
			if ((e.target as Element | null)?.closest?.("[data-hover],a,button")) {
				halo.classList.add("is-hover");
			}
		};
		const onOut = (e: MouseEvent) => {
			if ((e.target as Element | null)?.closest?.("[data-hover],a,button")) {
				halo.classList.remove("is-hover");
			}
		};
		window.addEventListener("mousemove", onMove);
		document.addEventListener("visibilitychange", onVisibility);
		document.addEventListener("mouseover", onOver);
		document.addEventListener("mouseout", onOut);
		schedule();
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("mousemove", onMove);
			document.removeEventListener("visibilitychange", onVisibility);
			document.removeEventListener("mouseover", onOver);
			document.removeEventListener("mouseout", onOut);
		};
	}, []);

	useEffect(() => {
		const barEl = document.getElementById("progress");
		if (!barEl) return;
		let frame = 0;
		const paint = () => {
			frame = 0;
			if (document.hidden) return;
			const root = document.documentElement;
			const max = root.scrollHeight - root.clientHeight;
			barEl.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
		};
		const schedule = () => {
			if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
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
		window.addEventListener("resize", schedule, { passive: true });
		document.addEventListener("visibilitychange", onVisibility);
		schedule();
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);

	return (
		<>
			{pathname === "/" && !veilGone ? (
				<div id="veil" aria-hidden="true">
					<svg
						className="sigil"
						viewBox="0 0 120 120"
						fill="none"
						stroke="#d4af37"
						strokeWidth="1.4"
					>
						<circle className="draw" cx="60" cy="60" r="54" />
						<circle
							className="draw"
							cx="60"
							cy="60"
							r="46"
							strokeDasharray="3 5"
						/>
						<path className="draw" d="M22 60 Q60 34 98 60 Q60 86 22 60 Z" />
						<circle className="draw" cx="60" cy="60" r="12" />
						<circle
							className="draw"
							cx="60"
							cy="60"
							r="4.5"
							fill="#f0d98c"
							stroke="none"
						/>
						<path
							className="draw"
							d="M60 34v-8M78 39l4-7M42 39l-4-7M88 50l7-4M32 50l-7-4"
						/>
					</svg>
					<div className="word">NUMINOUS</div>
					<div className="bar">
						<i style={{ width: `${bar}%` }} />
					</div>
					<div className="pct">{roman(pct)}</div>
				</div>
			) : null}
			<div id="progress" role="presentation" />
			<canvas id="stars" ref={canvasRef} aria-hidden="true" />
			<div className="nebula" aria-hidden="true">
				<i />
				<i />
				<i />
			</div>
			<div className="vignette" aria-hidden="true" />
			<div className="grain" aria-hidden="true" />
			<div className="cursor-halo" aria-hidden="true" />
			<div className="cursor-dot" aria-hidden="true" />
		</>
	);
}
