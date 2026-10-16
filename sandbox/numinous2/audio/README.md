# Four scene-matched Numinous 2.0 films

The supplied MP4s had silent, low-bitrate picture and contained burned-in
claims that checkout had already happened, even on **pre-checkout** pages.
This sandbox rebuild keeps the same 12/12/7/6 scene images and original
2:43 / 2:42 / 1:20 / 1:13 lengths. It re-renders them from the local source
plates with restrained camera motion, higher-contrast grading, clean branded
text, scene progress, and corrected pre-entry/return language. The output is
1080p H.264 rather than an upscaled 1440p source. The browser's English
WebVTT captions cover the spoken dialogue; the on-screen text is not a
substitute for subtitles.

The ten numbered MP3 clips here are the user's selected feminine narrator.
Their factual scripts are in [`full-length-scripts.md`](full-length-scripts.md)
and track the films' original scene groups. `mix-audio.py` fits each recording
to its timed block without shifting pitch and keeps the narration present
through the final scene. A short music-only beat closes each film.

## Music provenance and mix

The user confirmed they have permission to use both recordings in public,
potentially commercial website videos. **The permission has not been
independently verified; confirm its terms before production deployment.**
The licensed excerpts were supplied via Drive, not copied from YouTube:

- Before checkout, both briefing films: **MAGNUS DEI** by **arcana** — Drive
  file `1m5Nm35_vVBRXZER7_su8-7UciL9wk-nZ`, 3:00, 128 kb/s MP3, MD5
  `4ed1cb68fef77b69de5772490502da69`.
- After checkout, both return invitations: **NEVER Leave** by **Ambient
  Outpost** — Drive file `13JaJjUTd7z6CgaKJuygKtG1In6JgCvtt`, 3:00,
  128 kb/s MP3, MD5 `1f5d1e9fdd1be306404acb20f9fc9b0f`.

The original 2–3 hour MP3s exceeded the connector's 100 MB limit. The 3-minute
excerpts were downloaded to a temporary directory; no stand-alone music is
committed or served to browsers. `mix-audio.py` uses moderate music levels,
a narration-driven sidechain duck with a gentle release, and final limiting.
The four exported MP4s contain only the synchronized, mixed soundtrack.

To reproduce the sandbox mix from those Drive excerpts:

```sh
python3 -m pip install -r scripts/requirements-media.txt
# From sandbox/numinous2; download both identified Drive MP3s separately.
# Re-render first ONLY if the picture changes:
python3 scripts/render-films.py
MUSIC_PRE=/path/to/magnus-dei-excerpt.mp3 \
MUSIC_POST=/path/to/never-leave-excerpt.mp3 python3 scripts/mix-audio.py
npm run test:smoke
```

The re-render reads the original plates and timeline from
`../../../reference/web-version/` and overwrites the four sandbox MP4s with
silent visual masters. The mix script copies only the video stream, so it can
be rerun with a new score without rendering the picture again. It also
updates captions. Keep the source recordings out of Git; only the mixed MP4s are committed.
The script still supports the repository ambient bed as a fallback for local
experiments, but production mixes should pass both music paths explicitly.

Review soundtrack balance and caption synchronization by ear on desktop and
phone. Caption timing is calculated per script sentence, not forced-aligned
at the word level. The homepage's looping background stays muted; the other
films play with sound only after a visitor presses Play.
