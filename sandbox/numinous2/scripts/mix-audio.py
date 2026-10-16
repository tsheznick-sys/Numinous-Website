"""Mix scene-matched narration and a cleared music bed into the four films.

Run render-films.py first if the picture/storyboards change. Re-running this
script is safe: only the current MP4's video stream is copied, never its prior
audio. MUSIC_PRE and MUSIC_POST are paths to the licensed, trimmed soundtrack
files. Set MUSIC_SIGNAL_BRIEFING, MUSIC_WATCHER_BRIEFING,
MUSIC_SIGNAL_INVITE and MUSIC_WATCHER_INVITE to use the four supplied beds;
MUSIC_PRE/MUSIC_POST remain as shared-track fallbacks. Never use the original
ambient fallback for the published mix. Requires ffmpeg or imageio-ffmpeg.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import re
import subprocess

HERE = Path(__file__).resolve().parents[1]
REPO = HERE.parents[1]
FALLBACK = REPO / "reference/web-version/public/assets/briefing/ambient.m4a"
SEGMENTS = {
 "signal-briefing": [0, 11, 24, 34, 48, 63, 90, 106, 122, 147, 163],
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


def silence_gaps(exe: str, voice: Path) -> list[tuple[float, float]]:
 """Find real voice pauses in the TTS clip, including leading/trailing silence."""
 result = subprocess.run([exe, "-hide_banner", "-i", str(voice), "-af",
                          "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"],
                         capture_output=True, text=True, check=True)
 return [(float(a), float(b)) for a, b in re.findall(
  r"silence_start: ([\d.]+).*?silence_end: ([\d.]+)", result.stderr, flags=re.S)]


def signal_captions(exe: str, chunks: list[str], voices: list[Path], durations: list[float]) -> None:
 """Anchor each Signal sentence to a recorded pause, rather than an even timeline.

 This is an audio-envelope alignment, not a word-level transcription. A human
 still needs to listen and inspect phrase transitions before release.
 """
 lines = ["WEBVTT", ""]
 for i, (text, voice, duration) in enumerate(zip(chunks, voices, durations)):
  gaps = silence_gaps(exe, voice)
  leading = gaps[0][1] if gaps and gaps[0][0] < 0.1 else 0.0
  trailing = gaps[-1][0] if gaps and gaps[-1][1] >= duration - 0.15 else duration
  first = max(0, leading - .06)
  last = min(duration, trailing + .06)
  sentences = re.findall(r"[^.!?]+[.!?]", text)
  word_counts = [len(s.split()) for s in sentences]
  candidates = [(a, b) for a,b in gaps if b-a >= .3 and a > leading and b < trailing]
  starts, ends = [first], []
  # Sentence boundaries are sought near their rough reading position. When
  # there is a recorded pause, clear the old caption and leave that pause
  # empty before revealing the next sentence, as on the Watcher briefing.
  for j in range(1, len(sentences)):
   expected = first + (last-first) * sum(word_counts[:j])/sum(word_counts)
   viable = [(a,b) for a,b in candidates if a > starts[-1]+.25 and b < last-.25
             and abs((a+b)/2-expected) <= 1.25]
   if viable:
    a,b = min(viable, key=lambda gap: abs((gap[0]+gap[1])/2-expected))
    ends.append(a+.04)
    starts.append(b-.04)
   else:
    boundary = max(starts[-1]+.25, min(expected, last-.25))
    ends.append(boundary)
    starts.append(boundary)
  ends.append(last)
  for j, sentence in enumerate(sentences):
   words = sentence.split()
   parts = (len(words)+7)//8
   phrases = [" ".join(words[round(k*len(words)/parts):round((k+1)*len(words)/parts)]) for k in range(parts)]
   weights = [sum(max(1, min(3, (len(re.sub(r'[^a-zA-Z]', '', w))+2)/4)) for w in phrase.split()) for phrase in phrases]
   elapsed = starts[j]
   consumed = 0.0
   for phrase, weight in zip(phrases, weights):
    consumed += weight
    finish = starts[j] + (ends[j]-starts[j])*consumed/sum(weights)
    absolute_start = SEGMENTS["signal-briefing"][i] + 1 + elapsed
    absolute_end = SEGMENTS["signal-briefing"][i] + 1 + finish
    lines.extend([f"{stamp(absolute_start)} --> {stamp(absolute_end)} line:18% position:50% size:84% align:center", phrase, ""])
    elapsed = finish
 (HERE / "public/media/signal-briefing-1440.vtt").write_text("\n".join(lines), encoding="utf8")


def captions(name: str, chunks: list[str], voice_seconds: list[float]) -> None:
 lines = ["WEBVTT", ""]
 for i, text in enumerate(chunks):
  start, end = SEGMENTS[name][i:i+2]
  speech_start, speech_duration = start+1, voice_seconds[i]
  sentences = re.findall(r"[^.!?]+[.!?]", text)
  # Other films retain their approved caption positions and cues.
  phrases: list[str] = []
  for sentence in sentences:
   words = sentence.split()
   parts = (len(words) + 9) // 10
   for part in range(parts):
    left = round(part * len(words) / parts)
    right = round((part+1) * len(words) / parts)
    phrases.append(" ".join(words[left:right]))
  counts = [len(phrase.split()) for phrase in phrases]
  elapsed = float(speech_start)
  for phrase, count in zip(phrases, counts):
   finish = elapsed + speech_duration*count/sum(counts)
   lines.extend([f"{stamp(elapsed)} --> {stamp(finish)} line:18% position:50% size:84% align:center", phrase, ""])
   elapsed = finish
 (HERE / "public/media" / f"{name}-1440.vtt").write_text("\n".join(lines), encoding="utf8")


def duration_of(exe: str, path: Path) -> float:
 probe = subprocess.run([exe,"-hide_banner","-i",str(path)],capture_output=True,text=True).stderr
 match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
 if not match:
  raise ValueError(f"Cannot read audio duration for {path}")
 return int(match[1])*3600 + int(match[2])*60 + float(match[3])


def mean_volume_of(exe: str, path: Path) -> float:
 analysis = subprocess.run([exe, "-hide_banner", "-i", str(path), "-t", "75",
                            "-vn", "-af", "volumedetect", "-f", "null", "-"],
                           capture_output=True, text=True, check=True).stderr
 match = re.search(r"mean_volume: (-?[\d.]+) dB", analysis)
 if not match:
  raise ValueError(f"Cannot measure background level for {path}")
 return float(match[1])


def main() -> None:
 parser = argparse.ArgumentParser(description="Mix scene-aligned narration and music into the sandbox films")
 parser.add_argument("--film", choices=SEGMENTS, help="Re-mix one film without touching the other three")
 cli = parser.parse_args()
 exe = ffmpeg_executable()
 scripts = transcripts()
 for name in ([cli.film] if cli.film else SEGMENTS):
  timeline = SEGMENTS[name]
  kind = "PRE" if name.endswith("briefing") else "POST"
  music_env = f"MUSIC_{name.upper().replace('-', '_')}"
  music = Path(os.environ.get(music_env, os.environ.get(f"MUSIC_{kind}", str(FALLBACK))))
  if not music.is_file():
   raise SystemExit(f"Missing {kind} music: {music}")
  if music_env not in os.environ and f"MUSIC_{kind}" not in os.environ:
   print(f"NOTE: {name} still uses the OLD ambient placeholder; not the supplied background",flush=True)
  total = timeline[-1]
  if duration_of(exe, music) < total:
   raise ValueError(f"{kind} music is shorter than {total}s: {music}")
  target = HERE / "public/media" / f"{name}-1440.mp4"
  voices = [HERE / "audio" / (f"{name}-scene-{i:02}.mp3" if name == "signal-briefing" else f"{name}-{i}.mp3") for i in range(1,len(timeline))]
  if not target.is_file() or any(not voice.is_file() for voice in voices):
   raise SystemExit(f"Missing polished film or narration for {name}")
  voice_seconds = [duration_of(exe, voice) for voice in voices]
  for i, seconds in enumerate(voice_seconds):
   room = timeline[i+1] - timeline[i] - 1
   if seconds > room:
    raise ValueError(f"{name} block {i+1}: {seconds:.2f}s of speech exceeds {room}s available; re-record it without accelerating speech")
  if name == "signal-briefing":
   signal_captions(exe, scripts[name], voices, voice_seconds)
  else:
   captions(name, scripts[name], voice_seconds)
  # Preserve the narrator's natural timing and pitch. Start each chapter one
  # second after the matching picture, with score-only pauses between blocks.
  # Sidechain compression raises the score between phrases and ducks it under
  # speech; gentle EQ in the speech range improves intelligibility.
  score_mean = mean_volume_of(exe, music)
  # Signal's score has more energy around the speech range. Give its voice
  # greater separation than Watcher while keeping room below the peak ceiling.
  signal = name == "signal-briefing"
  music_gain = max(-18.0, min(0.0, (-27.0 if signal else -22.0) - score_mean))
  filters = [f"[1:a]atrim=duration={total},asetpts=PTS-STARTPTS,"
             f"afade=t=in:st=0:d=2,afade=t=out:st={total-3}:d=3,"
             f"equalizer=f=2400:t=q:w=1:g={-5 if signal else -3},volume={music_gain:.2f}dB[bed]"]
  for i, voice in enumerate(voices):
   start = timeline[i]
   # The Signal's narrator has stronger peaks than her average level. Gentle
   # speech-only compression lifts phrases without clipping the final master.
   voice_processing = ("acompressor=threshold=0.09:ratio=3:attack=10:release=180:makeup=2.3,volume=1.5"
                       if signal else "volume=1")
   filters.append(f"[{i+2}:a]atrim=duration={voice_seconds[i]:.3f},"
                  f"afade=t=in:st=0:d=0.12,{voice_processing},adelay={(start+1)*1000}:all=1,"
                  f"apad,atrim=duration={total}[voice{i}]")
  narrators="".join(f"[voice{i}]" for i in range(len(voices)))
  filters.append(f"{narrators}amix=inputs={len(voices)}:duration=longest:normalize=0[narr]")
  filters.append("[narr]asplit=2[guide][dialog]")
  filters.append(f"[bed][guide]sidechaincompress=threshold={0.008 if signal else 0.015}:ratio={12 if signal else 8}:attack={80 if signal else 120}:release={650 if signal else 850}[ducked]")
  # Reserve peak headroom for stronger Signal speech without scaling the bed up.
  master_gain = 0.5 if signal else 3
  limiter = "alimiter=limit=0.78:level=0" if signal else "alimiter=limit=0.95"
  filters.append(f"[ducked][dialog]amix=inputs=2:duration=longest:normalize=0,volume={master_gain}dB,{limiter}[a]")
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
  print(f"Mixed {name}: {total}s, natural-speed narration, score gain {music_gain:.1f}dB, AAC and captions",flush=True)


if __name__ == "__main__":
 main()
