"""Encode Firefox-friendly WebM fallbacks from the final Signal MP4s.

Run after any Signal remix; the sources are the finished Numinous films
with their selected narrator and prepared user-supplied soundtrack, not
source videos. Each fallback preserves its scene timeline at 1280x720
VP9/Opus: the 2:43 pre-checkout briefing and the 1:20 post-checkout
return invitation.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re
import subprocess

HERE = Path(__file__).resolve().parents[1]
MEDIA = HERE / "public/media"

# Each final Signal film beside the WebM fallback served with it, and
# its approved timeline length used as the encode cap.
FILMS = {
 "briefing": (MEDIA / "signal-briefing-1440.mp4", MEDIA / "signal-briefing-720.webm", 163),
 "invitation": (MEDIA / "signal-invite-1440.mp4", MEDIA / "signal-invite-720.webm", 80),
}


def ffmpeg_executable() -> str:
 try:
  from imageio_ffmpeg import get_ffmpeg_exe
  return get_ffmpeg_exe()
 except ImportError:
  return "ffmpeg"


def duration_of(exe: str, path: Path) -> float:
 probe = subprocess.run([exe, "-hide_banner", "-i", str(path)], capture_output=True, text=True).stderr
 match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
 if not match:
  raise ValueError(f"Cannot read duration for {path}")
 return int(match[1])*360 + int(match[2])*60 + float(match[3])


def encode(source: Path, fallback: Path, seconds: int) -> None:
 if source.resolve() == fallback.resolve():
  raise SystemExit("the fallback cannot overwrite its source")
 temp = fallback.with_suffix(".tmp.webm")
 command = [ffmpeg_executable(), "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
            "-map", "0:v:0", "-map", "0:a:0", "-vf", "scale=1280:-2:flags=lanczos",
            "-c:v", "libvpx-vp9", "-deadline", "good", "-cpu-used", "5", "-row-mt", "1",
            "-tile-columns", "2", "-b:v", "0", "-crf", "33", "-g", "120", "-pix_fmt", "yuv420p",
            "-c:a", "libopus", "-b:a", "128k", "-ar", "48000", "-ac", "2", "-t", str(seconds), str(temp)]
 try:
  subprocess.run(command, check=True)
  temp.replace(fallback)
 finally:
  temp.unlink(missing_ok=True)
 print(f"Encoded Signal WebM fallback: {fallback}")


def main() -> None:
 parser = argparse.ArgumentParser(description="Make Signal's compatible WebM fallbacks")
 parser.add_argument("--film", choices=[*FILMS, "all"], default="all", help="which final Signal film to refresh")
 parser.add_argument("--input", type=Path, help="one-off source MP4 (requires --output)")
 parser.add_argument("--output", type=Path, help="one-off destination WebM (requires --input)")
 args = parser.parse_args()
 if bool(args.input) != bool(args.output):
  parser.error("--input and --output must be used together")
 if args.input and args.output:
  encode(args.input, args.output, int(duration_of(ffmpeg_executable(), args.input)))
  return
 for name, (source, fallback, seconds) in FILMS.items():
  if args.film in (name, "all"):
   if not source.is_file():
    parser.error(f"final Signal MP4 missing: {source}")
   encode(source, fallback, seconds)


if __name__ == "__main__":
 main()
