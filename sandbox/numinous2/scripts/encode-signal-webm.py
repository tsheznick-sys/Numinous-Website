"""Encode a Firefox-friendly WebM fallback from the final Signal briefing MP4.

Run after any Signal remix; the source is the finished Numinous film with its
selected narrator and prepared user-supplied soundtrack, not a source video.
The fallback preserves the 2:43 scene timeline at 1280x720 VP9/Opus.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parents[1]


def ffmpeg_executable() -> str:
 try:
  from imageio_ffmpeg import get_ffmpeg_exe
  return get_ffmpeg_exe()
 except ImportError:
  return "ffmpeg"


def main() -> None:
 parser = argparse.ArgumentParser(description="Make Signal's compatible WebM fallback")
 parser.add_argument("--input", type=Path, default=HERE / "public/media/signal-briefing-1440.mp4")
 parser.add_argument("--output", type=Path, default=HERE / "public/media/signal-briefing-720.webm")
 args = parser.parse_args()
 if not args.input.is_file():
  parser.error(f"final Signal MP4 missing: {args.input}")
 if args.input.resolve() == args.output.resolve():
  parser.error("the fallback cannot overwrite its source")
 temp = args.output.with_suffix(".tmp.webm")
 command = [ffmpeg_executable(), "-hide_banner", "-loglevel", "error", "-y", "-i", str(args.input),
            "-map", "0:v:0", "-map", "0:a:0", "-vf", "scale=1280:-2:flags=lanczos",
            "-c:v", "libvpx-vp9", "-deadline", "good", "-cpu-used", "5", "-row-mt", "1",
            "-tile-columns", "2", "-b:v", "0", "-crf", "33", "-g", "120", "-pix_fmt", "yuv420p",
            "-c:a", "libopus", "-b:a", "128k", "-ar", "48000", "-ac", "2", "-t", "163", str(temp)]
 try:
  subprocess.run(command, check=True)
  temp.replace(args.output)
 finally:
  temp.unlink(missing_ok=True)
 print(f"Encoded Signal WebM fallback: {args.output}")


if __name__ == "__main__":
 main()
