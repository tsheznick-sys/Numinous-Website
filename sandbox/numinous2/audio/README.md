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

The MP3 clips here use the user's selected feminine narrator. The **active**
Signal briefing takes `signal-briefing-scene-01.mp3` through `-10.mp3`; its old
`signal-briefing-1.mp3` through `-3.mp3` are retained only for comparison. The
other films still use their numbered clips. Their factual scripts are in
[`full-length-scripts.md`](full-length-scripts.md) and track each film's scene
groups. `mix-audio.py` places each recording at its **natural speed**; it does
not stretch or compress the voice to fill a chapter. Three invitation clips
were re-recorded shorter to fit naturally. Score-only pauses separate spoken
blocks, and the voice still reaches each final scene.

For the Signal pre-checkout revision, the ten cue groups start at seconds
`0, 11, 24, 34, 48, 63, 90, 106, 122, 147` and finish at 163. Two groups
span related adjacent images. Narration begins one second into each group;
short English captions begin at each recorded speech onset. After feedback
that voice, scene pacing **and** captions still needed work, the Signal bed
was lowered further and notched around speech, and the selected voice received
speech-only compression plus stronger score ducking. Six of the ten Signal
clips were re-recorded in the **same selected voice** with slightly fuller,
scene-specific copy, bringing spoken time to about 134.5 seconds versus about
137.7 seconds in the unchanged Watcher briefing. Each new clip still fits its
own scene group at natural speed. The new captions use recorded voice pauses
for sentence boundaries and leave a brief empty interval between sentences.
Phrase transitions within a sentence are still estimated by word length,
**not** forced-aligned or human-approved. The film's last cue ends during its
final scene. The Watcher briefing remains the unchanged
pacing/presentation reference; the music and narrator have not been judged
by a human listener in this environment.
The Signal picture stream is byte-identical to the previous review mix
(SHA-256 `a971def99b2c86514f849d467d02b170b78fcd5de8a3cbb24744233fcb0da205`).
All four MP4s decoded without reported errors, retained 1920×1080 video,
and measured the same durations: 2:43 / 2:42 / 1:20 / 1:13. For browsers
that cannot decode the Signal H.264/AAC MP4, the same final 2:43 film is also
encoded as a 1280×720 VP9/Opus `signal-briefing-720.webm` fallback. It uses
the final Signal audio and the same picture sequence; it is not another music
source. The controlled player offers WebM before MP4, retains English VTT,
and provides direct open/download links. The local browser played WebM, but
the user's Firefox and Arena's file viewer still need their own confirmation.
Signal's
full-file AAC mean/peak now measures −18.0/−2.1 dB versus Watcher's unchanged
−19.0/−2.6 dB. These are **technical measurements only**, not a human
listening or caption-sync sign-off.

### Single-voice Signal bed treatment

The user heard a second, underlying voice and chose to keep the selected
feminine narrator **on the Signal pre-checkout film only**. The original
supplied Signal Opus audio remains its sole score source. Before mixing,
`prepare-signal-bed.py` derives a center-vocal-reduced intermediate: stereo
left-minus-right cancels center-correlated speech; a quiet mid-channel bass
below 115 Hz restores weight, while a 2.2 kHz notch and low-pass keep the
source ambience dark. The intermediate is made in `/tmp` during mixing and
is **not** committed; the film still uses the same Numinous picture stream.
Music is ducked under the narrator. A dual-mono test narration lost about
34 dB in the speech band with this treatment. That test does **not** prove
that every off-center or reverberant word in the supplied soundtrack is gone.
A human must listen to the whole film and, if any second voice remains, supply
an instrumental-only version of this same background or approve a different
bed before release.

## Four supplied background sources — review mix

The user provided four three-minute audio/video files, selected their **audio
only** as one background per film, and requested that the current Numinous
pictures and original lengths remain. The source pictures (including unrelated
imagery and a subscribe graphic) are **not** used. We extracted the Opus audio
streams without re-encoding and trimmed them at each site's film length during
mixing. They were provided through Drive, not downloaded from video sites:

| Film | Drive file ID | Input MD5 | Role |
| --- | --- | --- | --- |
| Signal briefing | `1TjXyt8q7Rp6o9WqcRtCXw5qQVT69rvI7` | `f7759228306ff8f4e1327da4d26caaff` | pre-checkout bed |
| Watcher briefing | `1Kai4PMdlRCuSg28GvT7AQh5f-uCVQOLI` | `6d3518e0c9d6e67ec6b51ed3d0c713f3` | pre-checkout bed |
| Signal return invitation | `1heiYS2ErgyE7SqGYju2kNd-UVz5J2s3H` | `f9e80bbdaab9ec7539dd54a2a9fb557d` | post-checkout bed |
| Watcher return invitation | `1UpBsx3Ae2a1NIzvErMtvEzSJCzC4YKZX` | `8202ac1de4f35cfad73284a1b1f0ac6c` | post-checkout bed |

The user affirmed permission for use of all four soundtracks in public website
videos, but creator/title credit details are **pending** and the exact license
terms have **not** been independently verified. The sandbox marks credits as
pending rather than attributing these new sounds to the previous two creators.
Do not deploy before attribution, rights verification and a human listening
pass confirming there is no unrelated speech or promotional audio in the beds.
The original AV files and stand-alone extracted audio are not committed; only
synchronized MP4s are served. `mix-audio.py` measures each bed's mean level,
adds a speech-range EQ notch, ducks it dynamically under narration, and
limits the output. Short native WebVTT cues are positioned above the picture's
lower-third titles instead of covering them.

To reproduce, download the four Drive files above to a temporary directory
and extract each audio stream, e.g.:

```sh
python3 -m pip install -r scripts/requirements-media.txt
FFMPEG=$(python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')
"$FFMPEG" -i /tmp/01_Signal_Briefing_PreCheckout.mp4.webm \
  -map 0:a:0 -vn -c:a copy /tmp/signal-briefing.ogg
# Repeat for the other three files, preserving their Opus streams.
# From sandbox/numinous2, set all four background paths:
MUSIC_SIGNAL_BRIEFING=/tmp/signal-briefing.ogg \
MUSIC_WATCHER_BRIEFING=/tmp/watcher-briefing.ogg \
MUSIC_SIGNAL_INVITE=/tmp/signal-invite.ogg \
MUSIC_WATCHER_INVITE=/tmp/watcher-invite.ogg \
  python3 scripts/mix-audio.py
npm run test:smoke
```

Pass the **original stereo** Signal extraction to `MUSIC_SIGNAL_BRIEFING`;
`mix-audio.py` automatically calls `prepare-signal-bed.py` to center-reduce it
for Signal only, then refreshes `signal-briefing-720.webm` from the final MP4.
Do not pass an already processed bed or it will be processed twice. The other
three film beds are mixed as supplied. `--skip-webm` is only for short-lived
audio experiments; run the full command before publishing a new Signal mix.

Re-render first with `python3 scripts/render-films.py` **only** if the picture
changes. It replaces the sandbox MP4s with silent visual masters; follow it
with the audio mix. The script can remix an existing MP4 safely because it
copies only its video stream, never its old soundtrack.

The re-render reads the original plates and timeline from
`../../../reference/web-version/`. Keep the source recordings out of Git.
The old two-track and local ambient inputs remain possible for comparison,
but the review mix should pass **all four** new paths explicitly.

Review soundtrack balance and caption synchronization by ear on desktop and
phone. Caption timing is estimated by phrase length from natural speech clips,
not forced-aligned at the word level. The homepage's looping background
stays muted; other films play with sound only after a visitor presses Play.
