import { useState } from 'react';

type FilmPlayerProps = {
 mp4: string;
 webm?: string;
 captions: string;
 poster: string;
 label: string;
};

/** Native controls first; an alternative codec and direct links remain available. */
export function FilmPlayer({ mp4, webm, captions, poster, label }: FilmPlayerProps) {
 const [mp4Only, setMp4Only] = useState(false);
 const [failed, setFailed] = useState(false);
 const handleError = () => {
  // A browser can report that WebM is supported yet fail to decode it.
  if (webm && !mp4Only) setMp4Only(true);
  else setFailed(true);
 };
 return <div className="film-player">
  <video key={mp4Only ? 'mp4' : 'auto'} controls preload="metadata" playsInline poster={poster} aria-label={label}
   onError={handleError} onLoadedMetadata={() => setFailed(false)}>
   {webm && !mp4Only && <source src={webm} type="video/webm" />}
   <source src={mp4} type="video/mp4" />
   <track kind="captions" src={captions} srcLang="en" label="English" default />
   Your browser cannot play this film inline. Use a link below to open or download it.
  </video>
  <div className="film-player__links" aria-label={`${label} playback options`}>
   {webm && <a href={webm} target="_blank" rel="noopener noreferrer">Open WebM ↗</a>}
   <a href={mp4} target="_blank" rel="noopener noreferrer">Open MP4 ↗</a>
   <a href={webm || mp4} download>Download {webm ? 'WebM' : 'MP4'} ↓</a>
  </div>
  {failed && <p className="film-player__error" role="alert">This browser could not play the film inline. Try the alternative format or download link above.</p>}
 </div>;
}
