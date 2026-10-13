#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import textwrap
from pathlib import Path

ROOT = Path("/root/apps/app_YYGHDJQJ2JnCku/public/assets/briefing")
WORK = Path("/tmp/gate-briefings")
FPS = 24
W, H = 1920, 1080

FILMS = {
    "The-Codex-Briefing": [
        ("codex/gate.png", 11, "THE BOOK", "The Codex has opened.", "This page is the threshold. The book itself waits in your Whop library."),
        ("codex/files.png", 13, "WHAT IS HAPPENING", "Checkout has finished.", "PDF and EPUB are already in your library. Nothing else ships."),
        ("codex/gate.png", 10, "THE OFFERING", "Twenty-eight, once.", "The Codex is a one-time gate. No moon. No card on a cycle."),
        ("codex/beings.png", 16, "I  ·  FIFTEEN BEINGS", "The host has names.", "Fifteen plates. 101 pages. The divine, the fallen, and the unimaginable."),
        ("codex/keys.png", 15, "II  ·  FOUR KEYS", "Each entry gives four things.", "The Encounter. The Records. Recognition. The Protocol."),
        ("codex/nights.png", 16, "III  ·  SEVEN NIGHTS", "Read three tonight.", "If the book names nothing you saw, message within seven days and the offering returns. Keep the files."),
        ("codex/files.png", 12, "THE FILES", "Instant, two forms.", "PDF and EPUB. The watching continues at @numinous2.0."),
        ("shared/sanctuary.png", 12, "THE SANCTUARY", "You are not alone.", "A shared room for every Traveller who has entered a gate."),
        ("codex/path.png", 16, "WHAT TO DO NOW", "Open the library.", "Take PDF and EPUB. Read the first three entries tonight."),
    ],
    "Watcher-Briefing": [
        ("watcher/moon.png", 11, "WATCHER  ·  $28 A MOON", "You have taken a seat.", "The Numinary waits in your Whop library."),
        ("signal/library.png", 13, "WHAT IS HAPPENING", "Checkout has finished.", "Open the library to walk the rooms and take the files."),
        ("watcher/moon.png", 13, "THE CYCLE", "Every twenty-eight days.", "One full cycle of the realms. Four weeks. Then a new being arrives."),
        ("watcher/realm.png", 14, "WEEK I  ·  THE REALM", "The month's new being.", "Week one is first contact."),
        ("watcher/process.png", 14, "WEEK II  ·  THE PROCESS", "Behind the veil.", "Week two shows how the vision was made."),
        ("watcher/records.png", 14, "WEEK III  ·  THE RECORDS", "The lore deep-dive.", "Week three is the story beneath the image."),
        ("watcher/session.png", 14, "WEEK IV  ·  THE SESSION", "Live, then the vote.", "Week four is the live build, your questions, and the vote."),
        ("watcher/vault.png", 16, "INSIDE THE ROOM", "Files that stay with the seat.", "The Vault. Twelve studio cards. Fifteen realms of wallpaper. Member Files."),
        ("shared/sanctuary.png", 12, "THE SANCTUARY", "You are not alone.", "Chat, forum, and a shared room for every Traveller."),
        ("codex/path.png", 16, "WHAT TO DO NOW", "Open your seat.", "The first week is The Realm. Cancel any moon if you must leave."),
    ],
    "Collectors-Edition-Briefing": [
        ("collector/shelf.png", 12, "TWENTY-EIGHT COPIES", "Your number is claimed.", "Hand-numbered. Once they are gone, they are gone."),
        ("codex/files.png", 13, "WHAT IS HAPPENING", "Checkout has finished.", "Instant Codex files are in your library. The numbered page is made by hand."),
        ("codex/gate.png", 13, "THE CODEX", "The whole book, now.", "Fifteen beings, 101 pages, PDF and EPUB, instant."),
        ("collector/name.png", 14, "YOUR NAME", "Bound into Volume I.", "The name given at checkout is bound into the credits."),
        ("collector/number.png", 14, "THE NUMBER", "Within forty-eight hours.", "The personalized numbered PDF goes out by hand within 48 hours."),
        ("collector/wallpaper.png", 13, "WALLPAPER VAULT", "Fifteen realms, included.", "Fifteen realms, cropped for every screen."),
        ("collector/volume2.png", 13, "VOLUME II", "First claim, before it opens.", "This number holds first claim on Volume II."),
        ("collector/binding.png", 12, "THE BINDING", "A private room.", "Use The Binding chat if the numbered page needs a name corrected."),
        ("collector/shelf.png", 12, "SALES ARE FINAL", "This gate does not return.", "The Seven Nights belong to The Codex alone, not to a numbered edition."),
        ("codex/path.png", 16, "WHAT TO DO NOW", "Open the edition.", "Take the Codex files now. The numbered PDF follows within 48 hours."),
    ],
}


def run(cmd: list[str]) -> None:
    subprocess.check_call(cmd)


def ass_time(seconds: float) -> str:
    cs = int(round(seconds * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def encode_clip(plate: str, duration: float, out: Path) -> None:
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},"
        f"fade=t=in:st=0:d=0.3,fade=t=out:st={duration-0.3}:d=0.3"
    )
    run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-loop", "1", "-framerate", str(FPS), "-i", str(ROOT / plate),
        "-t", f"{duration:.3f}", "-vf", vf,
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "20",
        "-pix_fmt", "yuv420p", "-an", str(out),
    ])


def write_ass(scenes, path: Path) -> None:
    lines = [
        "[Script Info]", "Title: Numinous briefing", "ScriptType: v4.00+",
        "PlayResX: 1920", "PlayResY: 1080", "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        r"Style: Kicker,Liberation Sans,26,&H0037AFD4,&H000000FF,&H00000000,&HAA000000,0,0,0,0,100,100,4,0,1,0,0,1,80,80,0,1",
        r"Style: Title,Liberation Serif,64,&H00EAF1F4,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,1,0,0,1,80,80,0,1",
        r"Style: Copy,Liberation Serif,32,&H00B8C4C8,&H000000FF,&H00000000,&HAA000000,0,0,0,0,100,100,0,0,1,0,0,1,80,80,0,1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    t = 0.0
    for _plate, duration, kicker, title, copy in scenes:
        start, end = t, t + duration
        wrapped = r"\N".join(textwrap.wrap(copy, width=58))
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Kicker,,0,0,0,,{{\\pos(80,720)}}{kicker}")
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Title,,0,0,0,,{{\\pos(80,768)}}{title}")
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Copy,,0,0,0,,{{\\pos(80,860)}}{wrapped}")
        t = end
    path.write_text("\n".join(lines) + "\n")


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    veil = WORK / "veil.png"
    if not veil.exists():
        run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-f", "lavfi", "-i", "color=c=black:s=1920x1080", "-frames:v", "1",
            "-vf", "format=rgba,geq=r=0:g=0:b=0:a='if(lt(Y,600),0,min(200,(Y-600)*0.65))'",
            str(veil),
        ])
    for name, scenes in FILMS.items():
        print("film", name, flush=True)
        folder = WORK / name
        clips = folder / "clips"
        clips.mkdir(parents=True, exist_ok=True)
        lines = []
        for i, (plate, duration, *_rest) in enumerate(scenes):
            clip = clips / f"{i:02d}.mp4"
            if not clip.exists():
                encode_clip(plate, duration, clip)
            lines.append(f"file '{clip}'")
        list_path = folder / "concat.txt"
        list_path.write_text("\n".join(lines) + "\n")
        clean = folder / f"{name}-clean.mp4"
        run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(list_path), "-c", "copy", str(clean)])
        ass_path = folder / f"{name}.ass"
        write_ass(scenes, ass_path)
        captioned = folder / f"{name}.mp4"
        run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(clean), "-i", str(veil),
            "-filter_complex", f"[0:v][1:v]overlay=0:0,ass={ass_path}",
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "20",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
            str(captioned),
        ])
        print("done", name, captioned.stat().st_size, flush=True)


if __name__ == "__main__":
    main()
