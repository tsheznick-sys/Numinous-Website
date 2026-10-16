# Narration and mix for the Numinous 2.0 sandbox

The four MP4s in the supplied Drive archives had video tracks only. Their
matching **silent originals** also live at
`../../../reference/web-version/public/assets/briefing/films/` in this repo.
The existing `ambient.m4a` at that same `briefing/` path is the music bed the
user selected. The four MP3s here use the one feminine narration voice chosen
for this work; factual English transcripts are recorded in
`../scripts/mix-audio.py`. No Whop credentials or external media are needed.

The script copies the H.264 video stream from the original films without
re-encoding it, mixes the ambient bed at 32% with the spoken narration starting
five seconds in, encodes one stereo AAC audio stream, and creates matching
English WebVTT captions. It replaces only this sandbox's public MP4s. The
narration ends early on each film; the ambient bed continues to the end.

To reproduce or revise the mix after editing the voice clips/transcripts:

```sh
python3 -m pip install imageio-ffmpeg==0.6.0
python3 scripts/mix-audio.py  # from sandbox/numinous2
npm run test:smoke
```

Or set `FFMPEG=/path/to/ffmpeg`. Captions are approximately timed by sentence
length, not word-aligned; review them with the preview before publishing.
The homepage's looping background uses the Watcher film **muted**. Briefing
and invitation films have controls and play the narration/music only after a
visitor presses Play. Browsers do not reliably allow autoplay with sound.
