"""Make a center-vocal-reduced Signal score from the user's supplied audio.

Usage: python3 scripts/prepare-signal-bed.py INPUT.opus.ogg OUTPUT.flac

Only the Signal pre-checkout source is treated this way. The difference between
left and right removes center-correlated speech; a quiet, low-passed sum
restores some bass. There is no claim that off-center/reverberant speech is
fully removed: listen to the result before release. No outside music is used.
Keep the extracted input and this prepared intermediate outside the repo.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import subprocess
import re


def ffmpeg_executable() -> str:
 try:
  from imageio_ffmpeg import get_ffmpeg_exe
  return get_ffmpeg_exe()
 except ImportError:
  return "ffmpeg"


def main() -> None:
 parser = argparse.ArgumentParser(description="Reduce centered voice in the supplied Signal soundtrack")
 parser.add_argument("input", type=Path, help="extracted stereo Opus soundtrack from the Signal source")
 parser.add_argument("output", type=Path, help="temporary FLAC output; not a repository asset")
 args = parser.parse_args()
 if not args.input.is_file():
  parser.error(f"source audio not found: {args.input}")
 if args.input.resolve() == args.output.resolve():
  parser.error("input and output must be different files")
 exe = ffmpeg_executable()
 probe = subprocess.run([exe, "-hide_banner", "-i", str(args.input)], capture_output=True, text=True).stderr
 if not re.search(r"Audio: .*stereo", probe):
  parser.error("Signal center reduction requires the original stereo soundtrack; mono would not cancel voice")
 args.output.parent.mkdir(parents=True, exist_ok=True)
 # Sum (mid) contains a centered voice. Difference (side) cancels it while
 # retaining the source's out-of-phase instrumental atmosphere. Keep only a
 # quiet sub-bass contribution from mid, below the intelligible speech band.
 filters = (
  "[0:a]asplit=2[left][right];"
  "[left]pan=mono|c0=0.5*c0-0.5*c1,highpass=f=160,lowpass=f=5200,"
  "equalizer=f=2200:t=q:w=1:g=-5,volume=6dB[side];"
  "[right]pan=mono|c0=0.5*c0+0.5*c1,lowpass=f=115,volume=-12dB[bass];"
  "[side][bass]amix=inputs=2:duration=longest:normalize=0,"
  "alimiter=limit=0.9:level=0,aresample=async=1:first_pts=0[bed]"
 )
 subprocess.run([exe, "-hide_banner", "-loglevel", "error", "-y", "-i", str(args.input),
                 "-filter_complex", filters, "-map", "[bed]", "-ac", "2", "-c:a", "flac",
                 str(args.output)], check=True)
 print(f"Prepared center-vocal-reduced Signal bed: {args.output}")


if __name__ == "__main__":
 main()
