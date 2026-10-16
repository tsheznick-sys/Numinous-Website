"""Rebuild the four sandbox films from their original still plates and timelines.

The original supplied films contain baked-in claims that checkout/access already
happened, including on pre-checkout pages. Re-rendering from the repository's
source plates preserves their scene order, images and exact lengths while making
the type sharp, legible and accurate. Does not add audio: run mix-audio.py next.
Requires Pillow, fonttools[woff] and imageio-ffmpeg (or FFMPEG on PATH).
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
import os
import re
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFont, ImageOps
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parents[1]
REPO = HERE.parents[1]
ASSETS = REPO / "reference/web-version/public/assets/briefing"
SOURCE = REPO / "reference/web-version/src/lib/briefings.ts"
SIZE = (1920, 1080)
FPS = 24
# Scene names, durations and image plates come from the original TS storyboard.
# Only visible claims are corrected; no new product/checkout promises are made.
COPY = {
 "signal-briefing": [
  ("The free first gate.", "A preview of The Signal, not a receipt or proof of access."),
  ("Entry is through Whop.", "Choose the free gate there. Check your Whop library after entry."),
  ("Free, with no renewal.", "The Signal asks for no card and no recurring payment."),
  ("Begin with Dispatches.", "Announcements and new realms have a place to land."),
  ("The First Vision.", "An entry reading to the chambers of this world."),
  ("A map of the rooms.", "Meet the names before you explore the rooms available to you."),
  ("Meet the Realm.", "The open gate leads toward a new being and its world."),
  ("Craft and story.", "The Process reveals the making. The Records hold the lore."),
  ("A place to return.", "The Session and Field Journal make room for questions and notes."),
  ("The Sanctuary.", "A shared place for travellers around the work."),
  ("Follow the calendar.", "Discover the rhythm of coming realms and announcements."),
  ("Ready for the free gate?", "Continue to Whop below. Verify access in your Whop account."),
 ],
 "watcher-briefing": [
  ("Preview the Watcher.", "Watching does not start a trial or grant membership."),
  ("Checkout is through Whop.", "Review the live offer and terms there before choosing."),
  ("One being. Four chapters.", "A twenty-eight-day cycle designed to be revisited."),
  ("Week one: The Realm.", "Meet the being at the start of its cycle."),
  ("Week two: The Process.", "Look behind the image at the choices that shaped it."),
  ("Week three: The Records.", "Read the names, context and story beneath the vision."),
  ("Week four: The Session.", "A live gathering and questions, subject to the room's schedule."),
  ("Return to the archive.", "Available files and material depend on verified membership."),
  ("Stay in conversation.", "Follow the work and its community between chapters."),
  ("Other gates are separate.", "Books and editions are not automatically included in Watcher."),
  ("Compare your options.", "Monthly: seven days free, then $28 every 28 days. Annual is separate."),
  ("Review before joining.", "Whop confirms live terms and access. The return window starts after first payment."),
 ],
 "signal-invite": [
  ("Welcome back to the Signal.", "This return page cannot confirm access. Verify in Whop."),
  ("Look for Dispatches.", "Once Whop confirms entry, follow announcements and new realms."),
  ("Open the First Vision.", "Start with the reading that introduces the chambers."),
  ("Follow your rooms.", "Explore the spaces available in your verified Whop library."),
  ("Let the calendar guide you.", "Return for news and the rhythm of upcoming work."),
  ("Find the Sanctuary.", "A shared space for travellers, subject to your account access."),
  ("Your library is the door.", "Sign in with the same Whop account; contact support if it is missing."),
 ],
 "watcher-invite": [
  ("A return, not a receipt.", "Verify your Watcher trial or membership in Whop first."),
  ("Enter the four chapters.", "Realm, Process, Records and Session span a twenty-eight-day cycle."),
  ("Give each part room.", "Return to one being as its craft and story unfold."),
  ("The Session awaits.", "Check Whop for the schedule and access to live gatherings."),
  ("Check the membership.", "Your receipt and library show the current terms and renewal."),
  ("Verify before entering.", "Seven days free, then $28 every 28 days monthly; Whop controls access."),
 ],
}
FRAMES = {
 "signal-briefing": "SIGNAL", "watcher-briefing": "WATCHER",
 "signal-invite": "SIGNAL_INVITE", "watcher-invite": "WATCHER_INVITE",
}


def ffmpeg() -> str:
 if os.environ.get("FFMPEG"):
  return os.environ["FFMPEG"]
 try:
  from imageio_ffmpeg import get_ffmpeg_exe
  return get_ffmpeg_exe()
 except ImportError:
  return "ffmpeg"


def storyboard(name: str):
 text = SOURCE.read_text()
 match = re.search(rf"const {FRAMES[name]}: GateBriefing = \{{(.*?)\n\}};", text, re.S)
 if not match:
  raise ValueError(f"Missing storyboard {name}")
 scenes = re.findall(r'plate: "(/assets/briefing/[^"]+)",\s*duration: (\d+)', match[1])
 if len(scenes) != len(COPY[name]):
  raise ValueError(f"Scene count differs from review copy for {name}")
 return [(ASSETS / plate.removeprefix('/assets/briefing/'), int(ms)//1000, *texts)
         for (plate, ms), texts in zip(scenes, COPY[name])]


@lru_cache(maxsize=None)
def font(filename: str, size: int) -> ImageFont.FreeTypeFont:
 from io import BytesIO
 source = HERE / "public/fonts" / filename
 converted = TTFont(source)
 converted.flavor = None
 buffer = BytesIO()
 converted.save(buffer)
 buffer.seek(0)
 return ImageFont.truetype(buffer, size=size)


def wrap(draw: ImageDraw.ImageDraw, words: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
 lines = []
 line = ""
 for word in words.split():
  candidate = f"{line} {word}".strip()
  if draw.textlength(candidate, font=face) > width and line:
   lines.append(line)
   line = word
  else:
   line = candidate
 if line:
  lines.append(line)
 return lines


def slide(image: Path, title: str, copy: str, name: str, index: int, count: int, path: Path) -> None:
 from PIL import ImageEnhance
 background = ImageOps.fit(Image.open(image).convert("RGB"), SIZE, method=Image.Resampling.LANCZOS)
 background = ImageEnhance.Color(background).enhance(1.08)
 background = ImageEnhance.Contrast(background).enhance(1.06)
 # A continuous dark-to-transparent veil makes text legible on every plate.
 veil = Image.new("RGBA", (1, SIZE[1]))
 veil.putdata([(3, 5, 10, int(235 * max(0, min(1, (y - 360) / 450)))) for y in range(SIZE[1])])
 background = Image.alpha_composite(background.convert("RGBA"), veil.resize(SIZE))
 draw = ImageDraw.Draw(background)
 gold, cream, mist = "#d9b96f", "#f5efe4", "#d9d0c4"
 sans = font("Manrope-latin.woff2", 26)
 heading = font("CormorantGaramond-500-latin.woff2", 98)
 body = font("Manrope-latin.woff2", 43)
 label = "PRE-ENTRY BRIEFING" if name.endswith("briefing") else "RETURN INVITATION  /  VERIFY WITH WHOP"
 gate = "THE SIGNAL" if name.startswith("signal") else "THE WATCHER"
 draw.rounded_rectangle((110, 67, 174 + draw.textlength(f"{gate}   ·   {label}", font=sans), 134), radius=27, fill=(5, 7, 13, 205), outline=gold, width=2)
 draw.text((142, 82), f"{gate}   ·   {label}", font=sans, fill=cream)
 draw.text((112, 697), f"{index+1:02d} / {count:02d}     ·     {gate}", font=sans, fill=gold)
 draw.text((105, 728), title, font=heading, fill=cream, stroke_width=1, stroke_fill="#191720")
 lines = wrap(draw, copy, body, 1640)
 if len(lines) > 2:
  raise ValueError(f"Copy too long for slide {name}/{index}: {lines}")
 for j, line in enumerate(lines):
  draw.text((112, 856 + j*59), line, font=body, fill=mist, stroke_width=1, stroke_fill="#16131a")
 draw.rounded_rectangle((112, 1024, 1808, 1030), radius=3, fill=(230, 219, 198, 80))
 draw.rounded_rectangle((112, 1024, 112 + int(1696*(index+1)/count), 1030), radius=3, fill=gold)
 background.convert("RGB").save(path, compress_level=1)


def main() -> None:
 exe = ffmpeg()
 # Intermediate stills and silent clips never enter Git. The final public
 # MP4 is replaced atomically after all scenes finish encoding.
 with tempfile.TemporaryDirectory(prefix="numinous-films-") as scratch:
  work = Path(scratch)
  for name in FRAMES:
   scenes = storyboard(name)
   clips = []
   for i, (plate, duration, title, copy) in enumerate(scenes):
    still = work / f"{name}-{i:02}.png"
    clip = work / f"{name}-{i:02}.mp4"
    slide(plate, title, copy, name, i, len(scenes), still)
    zoom = ("zoompan=z='min(zoom+0.000024,1.014)':d=1:"
            "x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':s=1920x1080:fps=24")
    subprocess.run([exe,"-hide_banner","-loglevel","error","-y",
     "-loop","1","-framerate",str(FPS),"-i",str(still),
     "-frames:v",str(duration*FPS),"-vf", zoom,
     "-c:v","libx264","-preset","veryfast","-crf","22",
     "-pix_fmt","yuv420p","-an",str(clip)],check=True)
    clips.append(clip)
   listing = work / "concat.txt"
   listing.write_text("\n".join(f"file '{clip}'" for clip in clips) + "\n")
   target = HERE / "public/media" / f"{name}-1440.mp4"
   temp = work / f"{name}-visual.mp4"
   subprocess.run([exe,"-hide_banner","-loglevel","error","-y",
    "-f","concat","-safe","0","-i",str(listing),"-c","copy",
    "-movflags","+faststart",str(temp)],check=True)
   temp.replace(target)
   print(f"Polished {name}: {len(scenes)} scenes, {sum(scene[1] for scene in scenes)} seconds, {target.stat().st_size // 1024} KiB",flush=True)


if __name__ == "__main__":
 main()
