"""Remux the repo's original silent films with the chosen ambient bed + narration.

Requires ffmpeg on PATH or imageio-ffmpeg 0.6.0. Original silent films remain in
reference/web-version/public/assets/briefing/films so this is repeatable: never
mix into an already-mixed file. Run from anywhere with python scripts/mix-audio.py.
"""
from __future__ import annotations

import os
from pathlib import Path
import re
import subprocess

HERE = Path(__file__).resolve().parents[1]
REPO = HERE.parents[1]
ORIGINALS = REPO / "reference/web-version/public/assets/briefing/films"
AMBIENT = REPO / "reference/web-version/public/assets/briefing/ambient.m4a"
DURATIONS = {
    "signal-briefing": 163,
    "watcher-briefing": 162,
    "signal-invite": 80,
    "watcher-invite": 73,
}
TRANSCRIPTS = {
    "signal-briefing": "Welcome to The Signal, the free first gate to Numinous. This room gives you the First Vision, Dispatches, the calendar of upcoming realms, and the Sanctuary. Every new realm reaches The Signal before the wider feed. You can join without a card. There is no renewal, and no requirement to buy another work. If you want a more paced practice, The Watcher is a separate, optional membership. For now, open the free gate on Whop and take your time with the first vision.",
    "watcher-briefing": "The Watcher is a membership built around one new being every twenty eight days. In week one, enter the Realm. In week two, see the Process behind the vision. In week three, read the Records. In week four, return for the live Session. The monthly plan starts with seven days free, then costs twenty eight dollars every twenty eight days. An annual option is separate at two hundred eighty dollars a year. If you make a first payment and change your mind, contact support within seven nights of that payment for the stated return. Checkout and access stay with Whop.",
    "signal-invite": "Your first room is The Signal. Open your Whop library to find the First Vision, Dispatches, the calendar, and the Sanctuary. The Signal remains free forever, with no card and no renewal. Take your time here. The Watcher is optional if you later want to follow a full monthly cycle.",
    "watcher-invite": "If Whop has confirmed your Watcher membership, sign in with the same account you used at checkout. Your room follows a twenty eight day rhythm: the Realm, the Process, the Records, and the live Session. Check your Whop receipt and library for access. If anything is missing, write to Numinous support with your receipt.",
}


def ffmpeg_executable() -> str:
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    try:
        from imageio_ffmpeg import get_ffmpeg_exe
        return get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def stamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02}.{millis:03}"


def captions(name: str, speech_seconds: float) -> None:
    # Timing follows the generated narration's duration, weighted by sentence
    # length. Captions begin with the 5-second delayed narration, not the video.
    sentences = re.findall(r"[^.!?]+[.!?]", TRANSCRIPTS[name])
    counts = [len(sentence.split()) for sentence in sentences]
    elapsed = 5.0
    lines = ["WEBVTT", ""]
    for sentence, words in zip(sentences, counts):
        end = elapsed + speech_seconds * words / sum(counts)
        lines.extend([f"{stamp(elapsed)} --> {stamp(end)}", sentence.strip(), ""])
        elapsed = end
    (HERE / "public/media" / f"{name}-1440.vtt").write_text("\n".join(lines), encoding="utf8")


def main() -> None:
    exe = ffmpeg_executable()
    if not AMBIENT.is_file():
        raise SystemExit(f"Missing ambient bed: {AMBIENT}")
    for name, duration in DURATIONS.items():
        silent = ORIGINALS / f"{name}-1440.mp4"
        voice = HERE / "audio" / f"{name}.mp3"
        output = HERE / "public/media" / f"{name}-1440.mp4"
        temp = output.with_suffix(".mix.mp4")
        if not silent.is_file() or not voice.is_file():
            raise SystemExit(f"Missing silent film or voice recording for {name}")
        # Probe the voice clip rather than assuming a synthetic speaking rate.
        probe = subprocess.run([exe, "-hide_banner", "-i", str(voice)], capture_output=True, text=True).stderr
        match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
        if not match:
            raise SystemExit(f"Cannot read narration duration for {name}")
        speech_seconds = int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])
        captions(name, speech_seconds)
        mix = (
            f"[1:a]atrim=duration={duration},asetpts=PTS-STARTPTS,"
            f"afade=t=in:st=0:d=2,afade=t=out:st={duration-3}:d=3,"
            "volume=0.32[bed];"
            f"[2:a]adelay=5000:all=1,apad,atrim=duration={duration}[voice];"
            "[bed][voice]amix=inputs=2:duration=longest:normalize=0,"
            "alimiter=limit=0.95[a]"
        )
        try:
            subprocess.run([
                exe, "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(silent), "-i", str(AMBIENT), "-i", str(voice),
                "-filter_complex", mix, "-map", "0:v:0", "-map", "[a]",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
                "-metadata:s:a:0", "language=eng", "-movflags", "+faststart",
                "-t", str(duration), str(temp),
            ], check=True)
            temp.replace(output)
        finally:
            temp.unlink(missing_ok=True)
        print(f"Mixed {name}: {duration}s video, {speech_seconds:.1f}s voice after 5s, ambient underneath")


if __name__ == "__main__":
    main()
