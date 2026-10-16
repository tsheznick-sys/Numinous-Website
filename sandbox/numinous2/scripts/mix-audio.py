"""Mix scene-matched narration and a cleared music bed into the four films.

Run render-films.py first if the picture/storyboards change. Re-running this
script is safe: only the current MP4's video stream is copied, never its prior
audio. MUSIC_PRE and MUSIC_POST are paths to the licensed, trimmed soundtrack
files. Until supplied, the existing ambient.m4a is a provisional placeholder.
Requires ffmpeg or imageio-ffmpeg==0.6.0.
"""
from __future__ import annotations

import os
from pathlib import Path
import re
import subprocess

HERE = Path(__file__).resolve().parents[1]
REPO = HERE.parents[1]
FALLBACK = REPO / "reference/web-version/public/assets/briefing/ambient.m4a"
SEGMENTS = {
 "signal-briefing": [0, 48, 106, 163],
 "watcher-briefing": [0, 51, 109, 162],
 "signal-invite": [0, 46, 80],
 "watcher-invite": [0, 38, 73],
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


def transcripts() -> dict[str, list[str]]:
 text = (HERE / "audio/full-length-scripts.md").read_text(encoding="utf8")
 names = list(SEGMENTS)
 sections = re.split(r"^## (?:Signal briefing|Watcher briefing|Signal invitation|Watcher invitation).*?$", text, flags=re.M)[1:]
 if len(sections) != len(names):
  raise ValueError("Expected four script sections")
 output = {}
 for name, section in zip(names, sections):
  chunks = [part.strip() for part in re.split(r"^### .*?$", section, flags=re.M)[1:]]
  if len(chunks) != len(SEGMENTS[name])-1:
   raise ValueError(f"Script blocks do not match {name}'s timeline")
  output[name] = chunks
 return output


def captions(name: str, chunks: list[str]) -> None:
 lines = ["WEBVTT", ""]
 for i, text in enumerate(chunks):
  start, end = SEGMENTS[name][i:i+2]
  speech_start, speech_duration = start+1, end-start-4
  sentences = re.findall(r"[^.!?]+[.!?]", text)
  counts = [len(sentence.split()) for sentence in sentences]
  elapsed = float(speech_start)
  for sentence, count in zip(sentences, counts):
   finish = elapsed + speech_duration*count/sum(counts)
   lines.extend([f"{stamp(elapsed)} --> {stamp(finish)}", sentence.strip(), ""])
   elapsed = finish
 (HERE / "public/media" / f"{name}-1440.vtt").write_text("\n".join(lines), encoding="utf8")


def duration_of(exe: str, path: Path) -> float:
 probe = subprocess.run([exe,"-hide_banner","-i",str(path)],capture_output=True,text=True).stderr
 match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
 if not match:
  raise ValueError(f"Cannot read audio duration for {path}")
 return int(match[1])*3600 + int(match[2])*60 + float(match[3])


def main() -> None:
 exe = ffmpeg_executable()
 scripts = transcripts()
 for name, timeline in SEGMENTS.items():
  kind = "PRE" if name.endswith("briefing") else "POST"
  music = Path(os.environ.get(f"MUSIC_{kind}", str(FALLBACK)))
  if not music.is_file():
   raise SystemExit(f"Missing {kind} music: {music}")
  if f"MUSIC_{kind}" not in os.environ:
   print(f"NOTE: {name} still uses the OLD ambient placeholder; not the licensed replacement",flush=True)
  total = timeline[-1]
  if duration_of(exe, music) < total:
   raise ValueError(f"{kind} music is shorter than {total}s: {music}")
  target = HERE / "public/media" / f"{name}-1440.mp4"
  voices = [HERE / "audio" / f"{name}-{i}.mp3" for i in range(1,len(timeline))]
  if not target.is_file() or any(not voice.is_file() for voice in voices):
   raise SystemExit(f"Missing polished film or narration for {name}")
  captions(name,scripts[name])
  # The soundtrack ducks under narration. Each voice clip is gently retimed to
  # its storyboard block and leaves a second at the start / 3 seconds at end.
  filters = [f"[1:a]atrim=duration={total},asetpts=PTS-STARTPTS,"
             f"afade=t=in:st=0:d=2,afade=t=out:st={total-3}:d=3,"
             f"volume={0.36 if kind == 'PRE' else 0.51}[bed]"]
  for i, voice in enumerate(voices):
   start,end = timeline[i:i+2]
   allotted = end-start-4
   speed = duration_of(exe,voice)/allotted
   # atempo requires a factor between 0.5 and 2.
   if not 0.5 <= speed <= 2:
    raise ValueError(f"Narration needs a new recording for {name}-{i+1}: speed={speed:.2f}")
   filters.append(f"[{i+2}:a]atempo={speed:.5f},atrim=duration={allotted},"
                  f"afade=t=in:st=0:d=0.25,afade=t=out:st={allotted-0.9:.2f}:d=0.9,"
                  f"adelay={(start+1)*1000}:all=1,apad,atrim=duration={total}[voice{i}]")
  narrators="".join(f"[voice{i}]" for i in range(len(voices)))
  filters.append(f"{narrators}amix=inputs={len(voices)}:duration=longest:normalize=0[narr]")
  filters.append("[narr]asplit=2[guide][dialog]")
  filters.append("[bed][guide]sidechaincompress=threshold=0.015:ratio=8:attack=120:release=850[ducked]")
  filters.append("[ducked][dialog]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[a]")
  temp=target.with_suffix(".mix.mp4")
  args=[exe,"-hide_banner","-loglevel","error","-y","-i",str(target),"-i",str(music)]
  for voice in voices:
   args.extend(["-i",str(voice)])
  args.extend(["-filter_complex",";".join(filters),"-map","0:v:0","-map","[a]",
    "-c:v","copy","-c:a","aac","-b:a","160k","-ar","48000","-ac","2",
    "-metadata:s:a:0","language=eng","-movflags","+faststart","-t",str(total),str(temp)])
  try:
   subprocess.run(args,check=True)
   temp.replace(target)
  finally:
   temp.unlink(missing_ok=True)
  print(f"Mixed {name}: narration across {total}s, stereo AAC, captions",flush=True)


if __name__ == "__main__":
 main()
