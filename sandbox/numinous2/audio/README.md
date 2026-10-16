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

## Music still pending

The user chose different **licensed** tracks for pre-checkout briefings and
post-checkout invitations, and confirmed public website-video permission.
Their original Drive MP3 files are each larger than this connector's 100 MB
limit. **Do not download from YouTube, do not assume these films have the
requested new tracks, and do not deploy this provisional mix.** The preview
currently uses the previous repository `ambient.m4a` solely as a temporary
music bed. The user is preparing two trimmed excerpts under 100 MB. Once
available, download them to a temporary path, then run:

```sh
python3 -m pip install -r scripts/requirements-media.txt
# From sandbox/numinous2; re-render first ONLY if the picture changes:
python3 scripts/render-films.py
MUSIC_PRE=/path/to/cleared-pre.mp3 MUSIC_POST=/path/to/cleared-post.mp3 \
  python3 scripts/mix-audio.py
npm run test:smoke
```

The re-render reads the original plates and timeline from
`../../../reference/web-version/` and overwrites the four sandbox MP4s with
silent visual masters. The mix script copies only the video stream, so it can
be rerun with a new score without rendering the picture again. It also
updates captions. Keep the full source tracks out of Git; commit only the
short excerpts if the licensed distribution terms permit it, or only the
mixed MP4s if the license is limited to synchronized website videos.

Review soundtrack balance and caption synchronization by ear on desktop and
phone. Caption timing is calculated per script sentence, not forced-aligned
at the word level. The homepage's looping background stays muted; the other
films play with sound only after a visitor presses Play.
