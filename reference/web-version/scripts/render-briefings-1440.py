#!/usr/bin/env python3
"""Render Signal + Watcher briefing films at 1440p from the sealed scene data."""
import json
import subprocess
import sys
import textwrap
from pathlib import Path

FF = "/tmp/ffmpeg-7.0.2-amd64-static/ffmpeg"
ROOT = Path("/home/user/thenuminouses/public")
WORK = Path("/tmp/films1440")
FPS = 24
W, H = 2560, 1440
CRF = "26"
PRESET = "veryfast"

SCENES_PATH = sys.argv[1] if len(sys.argv) > 1 else "/tmp/scenes.json"
ONLY = [a for a in sys.argv[2:] if not a.startswith("-")]
SCENES = json.load(open(SCENES_PATH))

ALL_FILMS = {
    "signal": "Signal-Briefing",
    "watcher": "Watcher-Briefing",
    "signal-invite": "Signal-Invite",
    "watcher-invite": "Watcher-Invite",
}
WANTED = ONLY or list(ALL_FILMS)
FILMS = {ALL_FILMS[k]: SCENES[k] for k in WANTED if k in SCENES}


def run(cmd):
    subprocess.check_call(cmd)


def ass_time(seconds):
    cs = int(round(seconds * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def encode_clip(plate, duration, out):
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},"
        f"fade=t=in:st=0:d=0.3,fade=t=out:st={duration-0.3}:d=0.3"
    )
    run([
        FF, "-y", "-hide_banner", "-loglevel", "error",
        "-loop", "1", "-framerate", str(FPS), "-i", ROOT / plate.lstrip("/"),
        "-t", f"{duration:.3f}", "-vf", vf,
        "-c:v", "libx264", "-preset", PRESET, "-crf", CRF,
        "-pix_fmt", "yuv420p", "-an", str(out),
    ])


def write_ass(scenes, path):
    lines = [
        "[Script Info]", "Title: Numinous briefing", "ScriptType: v4.00+",
        f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        r"Style: Kicker,DejaVu Sans,35,&H0037AFD4,&H000000FF,&H00000000,&HAA000000,0,0,0,0,100,100,5,0,1,0,0,1,107,107,0,1",
        r"Style: Title,DejaVu Serif,85,&H00EAF1F4,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,1,0,0,1,107,107,0,1",
        r"Style: Copy,DejaVu Serif,43,&H00B8C4C8,&H000000FF,&H00000000,&HAA000000,0,0,0,0,100,100,0,0,1,0,0,1,107,107,0,1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    t = 0.0
    for scene in scenes:
        duration = scene["duration"] / 1000
        start, end = t, t + duration
        wrapped = r"\N".join(textwrap.wrap(scene["copy"], width=77))
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Kicker,,0,0,0,,{{\\pos(107,960)}}{scene['kicker']}")
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Title,,0,0,0,,{{\\pos(107,1024)}}{scene['title']}")
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Copy,,0,0,0,,{{\\pos(107,1147)}}{wrapped}")
        t = end
    path.write_text("\n".join(lines) + "\n")


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    veil = WORK / "veil.png"
    if not veil.exists():
        run([
            FF, "-y", "-hide_banner", "-loglevel", "error",
            "-f", "lavfi", "-i", f"color=c=black:s={W}x{H}", "-frames:v", "1",
            "-vf", "format=rgba,geq=r=0:g=0:b=0:a='if(lt(Y,800),0,min(200,(Y-800)*0.65))'",
            str(veil),
        ])
    for name, scenes in FILMS.items():
        print("film", name, flush=True)
        folder = WORK / name
        clips = folder / "clips"
        clips.mkdir(parents=True, exist_ok=True)
        lines = []
        for i, scene in enumerate(scenes):
            duration = scene["duration"] / 1000
            clip = clips / f"{i:02d}.mp4"
            if not clip.exists():
                encode_clip(scene["plate"], duration, clip)
            lines.append(f"file '{clip}'")
        list_path = folder / "concat.txt"
        list_path.write_text("\n".join(lines) + "\n")
        clean = folder / f"{name}-clean.mp4"
        run([FF, "-y", "-hide_banner", "-loglevel", "error",
             "-f", "concat", "-safe", "0", "-i", str(list_path), "-c", "copy", str(clean)])
        ass_path = folder / f"{name}.ass"
        write_ass(scenes, ass_path)
        out = Path(f"/home/user/thenuminouses/public/assets/briefing/films/{name.lower()}-1440.mp4")
        out.parent.mkdir(parents=True, exist_ok=True)
        run([
            FF, "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(clean), "-i", str(veil),
            "-filter_complex", f"[0:v][1:v]overlay=0:0,ass={ass_path}",
            "-c:v", "libx264", "-preset", PRESET, "-crf", CRF,
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
            str(out),
        ])
        print("done", name, out.stat().st_size, flush=True)


if __name__ == "__main__":
    main()
