import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	briefingDuration,
	formatFilmTime,
	sceneAt,
	type GateBriefing,
} from "../../lib/briefings";
import { track } from "../../lib/site";

export type FilmEndCta =
	| { kind: "library"; href: string; label: string }
	| { kind: "checkout"; planId: string; label: string };

const AMBIENT = "/assets/briefing/ambient.m4a";

export function GateBriefingFilm({
	briefing,
	endCta,
	watchedEvent = "briefing:watched_full",
}: {
	briefing: GateBriefing;
	endCta?: FilmEndCta;
	watchedEvent?: string;
}) {
	const total = briefingDuration(briefing);
	const [elapsed, setElapsed] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [ended, setEnded] = useState(false);
	const [clock, setClock] = useState(0);
	const [sound, setSound] = useState(false);
	const elapsedRef = useRef(0);
	const watchedRef = useRef(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [videoBroken, setVideoBroken] = useState(false);
	const [bufferedPct, setBufferedPct] = useState(0);
	const hasVideo = Boolean(briefing.video) && !videoBroken;
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const { index, scene } = useMemo(
		() => sceneAt(briefing, elapsed),
		[briefing, elapsed],
	);
	const progress = total <= 0 ? 0 : elapsed / total;
	const action: FilmEndCta = endCta ?? {
		kind: "library",
		href: briefing.library,
		label: briefing.cta,
	};

	useEffect(() => {
		if (!hasVideo) {
			for (const plate of briefing.scenes) {
				const img = new Image();
				img.src = plate.plate;
			}
			playFrom(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [briefing.id, hasVideo]);

	// Muted autoplay is allowed everywhere; the first tap (play/sound) unmutes.
	useEffect(() => {
		const video = videoRef.current;
		if (!hasVideo || !video) return;
		video.muted = !sound;
	}, [sound, hasVideo]);

	// Belt and braces: attempt playback from script once data exists (muted
	// media may always be played programmatically); the attribute alone can
	// stall in some embedded contexts.
	useEffect(() => {
		const video = videoRef.current;
		if (!hasVideo || !video) return;
		const kick = () => {
			if (video.paused && !ended) void video.play().catch(() => {});
		};
		if (video.readyState >= 3) kick();
		video.addEventListener("canplay", kick, { once: true });
		return () => video.removeEventListener("canplay", kick);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasVideo]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.loop = true;
		audio.volume = 0.42;
		if (playing && sound && !ended) {
			void audio.play().catch(() => setSound(false));
		} else {
			audio.pause();
		}
	}, [playing, sound, ended, briefing.id]);

	useEffect(() => {
		if (!playing || hasVideo) return;
		const origin = performance.now() - elapsedRef.current;
		let frame = 0;
		const tick = (now: number) => {
			const next = Math.min(now - origin, total);
			elapsedRef.current = next;
			setElapsed(next);
			if (next >= total) {
				setPlaying(false);
				setEnded(true);
				if (!watchedRef.current) {
					watchedRef.current = true;
					track(watchedEvent, { content_name: briefing.productTitle });
				}
				return;
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [playing, clock, total, briefing.productTitle, watchedEvent]);

	function playFrom(ms: number) {
		const clamped = Math.max(0, Math.min(ms, total));
		elapsedRef.current = clamped;
		setElapsed(clamped);
		setEnded(clamped >= total);
		setPlaying(clamped < total);
		setClock((n) => n + 1);
		if (hasVideo) {
			const video = videoRef.current;
			if (video && Number.isFinite(video.duration)) {
				const frac = total > 0 ? clamped / total : 0;
				video.currentTime = frac * video.duration;
			}
			if (clamped < total) void videoRef.current?.play().catch(() => {});
			else videoRef.current?.pause();
		}
	}

	function toggle() {
		if (hasVideo) {
			const video = videoRef.current;
			if (!video) return;
			setSound(true);
			if (ended || video.ended || video.currentTime >= video.duration - 0.05) {
				video.currentTime = 0;
				void video.play().catch(() => {});
				return;
			}
			if (video.paused) void video.play().catch(() => {});
			else video.pause();
			return;
		}
		if (ended || elapsedRef.current >= total) {
			setSound(true);
			playFrom(0);
			return;
		}
		if (playing) {
			if (!sound) {
				setSound(true);
				return;
			}
			setPlaying(false);
			return;
		}
		setSound(true);
		playFrom(elapsedRef.current);
	}

	function toggleSound(event?: { stopPropagation: () => void }) {
		event?.stopPropagation();
		const next = !sound;
		setSound(next);
		const audio = audioRef.current;
		if (!audio) return;
		if (next && playing && !ended) {
			void audio.play().catch(() => setSound(false));
		} else {
			audio.pause();
		}
	}

	function seek(clientX: number, target: HTMLElement) {
		const rect = target.getBoundingClientRect();
		const ratio = rect.width <= 0 ? 0 : (clientX - rect.left) / rect.width;
		playFrom(ratio * total);
	}

	// Video clock -> the same elapsed state that drives text, bar, and ticks.
	function onVideoTime(event: { currentTarget: HTMLVideoElement }) {
		const ms = event.currentTarget.currentTime * 1000;
		elapsedRef.current = ms;
		setElapsed(ms);
	}
	function onVideoEnded() {
		setPlaying(false);
		setEnded(true);
		if (!watchedRef.current) {
			watchedRef.current = true;
			track(watchedEvent, { content_name: briefing.productTitle });
		}
	}
	function onVideoPlay() {
		setPlaying(true);
		setEnded(false);
	}
	function onVideoPause() {
		setPlaying(false);
	}
	function onVideoProgress() {
		const video = videoRef.current;
		if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
		try {
			const end = video.buffered.end(video.buffered.length - 1);
			setBufferedPct(Math.max(0, Math.min(100, (end / video.duration) * 100)));
		} catch {
			/* buffered ranges can be empty early; ignore */
		}
	}
	function enterFullscreen() {
		const wrap = wrapRef.current;
		const video = videoRef.current as
			| (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
			| null;
		if (document.fullscreenElement) {
			void document.exitFullscreen().catch(() => {});
			return;
		}
		if (wrap?.requestFullscreen) {
			void wrap.requestFullscreen().catch(() => {});
			return;
		}
		// iOS Safari: only the element can go fullscreen
		video?.webkitEnterFullscreen?.();
	}

	return (
		<div className="film-wrap" ref={wrapRef}>
			<audio ref={audioRef} src={AMBIENT} preload="none" loop />
			<div className="film">
				{!hasVideo
					? briefing.scenes.map((plate, i) => (
							<div
								key={`${plate.id}-${i}`}
								className={`film-plate${i === index ? " is-on" : ""}${i % 2 ? " is-alt" : ""}`}
							>
								<img src={plate.plate} alt="" />
							</div>
						))
					: null}
				{hasVideo ? (
					<video
						ref={videoRef}
						className="film-video"
						src={briefing.video}
						poster={briefing.scenes[0]?.plate}
						muted={!sound}
						playsInline
						preload="metadata"
						autoPlay
						onTimeUpdate={onVideoTime}
						onProgress={onVideoProgress}
						onEnded={onVideoEnded}
						onPlay={onVideoPlay}
						onPause={onVideoPause}
						onError={() => setVideoBroken(true)}
					/>
				) : null}
				<div className="film-veil" />
				{ended ? (
					<div className="film-end">
						<p className="film-kicker">{briefing.endKicker}</p>
						<p className="film-end-title">{briefing.endTitle}</p>
						{action.kind === "checkout" ? (
							<Link
								to="/checkout/$planId"
								params={{ planId: action.planId }}
								search={{ quantity: 1, items: `${action.planId}:1` }}
								className="btn btn-gold"
							>
								{action.label}
							</Link>
						) : (
							<a href={action.href} className="btn btn-gold">
								{action.label}
							</a>
						)}
					</div>
				) : !hasVideo ? (
					<div className="film-copy" key={scene.id}>
						<p className="film-kicker">{scene.kicker}</p>
						<h2>{scene.title}</h2>
						<p>{scene.copy}</p>
					</div>
				) : null}
				<div className="film-bar">
					<button
						type="button"
						className="film-play"
						onClick={toggle}
						aria-label={playing ? "Pause briefing" : "Play briefing"}
					>
						{playing ? (
							<span className="film-pause-icon" />
						) : (
							<span className="film-play-icon" />
						)}
					</button>
					<div
						className="film-progress"
						onPointerDown={(event) => {
							if (event.button !== 0) return;
							seek(event.clientX, event.currentTarget);
						}}
						role="slider"
						aria-label="Briefing position"
						aria-valuemin={0}
						aria-valuemax={Math.round(total / 1000)}
						aria-valuenow={Math.round(elapsed / 1000)}
						tabIndex={0}
						onKeyDown={(event) => {
							if (event.key === "ArrowRight" || event.key === "l") {
								event.preventDefault();
								playFrom(elapsedRef.current + 5000);
							}
							if (event.key === "ArrowLeft" || event.key === "j") {
								event.preventDefault();
								playFrom(elapsedRef.current - 5000);
							}
							if (event.key === " " || event.key === "k") {
								event.preventDefault();
								toggle();
							}
							if (event.key === "m") {
								event.preventDefault();
								toggleSound();
							}
						}}
						{...({} as Record<string, never>)}
					>
						<span
							className="film-buffered"
							style={{ width: `${bufferedPct}%` }}
							aria-hidden="true"
						/>
						<span
							className="film-progress-fill"
							style={{ width: `${progress * 100}%` }}
						/>
						{briefing.scenes.map((plate, i) => {
							const start = briefing.scenes
								.slice(0, i)
								.reduce((sum, entry) => sum + entry.duration, 0);
							return (
								<span
									key={plate.id}
									className={`film-tick${i === index ? " is-on" : ""}`}
									style={{ left: `${(start / total) * 100}%` }}
									aria-hidden="true"
								/>
							);
						})}
					</div>
					<button
						type="button"
						className={`film-sound${sound ? " is-on" : ""}`}
						onClick={toggleSound}
						aria-label={sound ? "Mute ambient" : "Play ambient"}
					>
						{sound ? "SOUND" : "MUTED"}
					</button>
					<span className="film-time">
						{formatFilmTime(elapsed)} / {formatFilmTime(total)}
					</span>
					<button
						type="button"
						className="film-full"
						onClick={enterFullscreen}
						aria-label="Fullscreen briefing"
						data-hover
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
						</svg>
					</button>
				</div>
				<button
					type="button"
					className="film-stage"
					onClick={toggle}
					aria-label={playing ? "Pause briefing" : "Play briefing"}
				/>
			</div>
		</div>
	);
}
