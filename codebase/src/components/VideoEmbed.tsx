import { useEffect, useState } from 'react';
import type { ExerciseSource } from '../data/exercises';
import { PlayIcon } from './icons';

/** Whether the browser is online, kept up to date. */
function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

/**
 * Where an exercise comes from. A YouTube video shows as a card that loads YouTube's player (via the
 * no-cookie domain) only when clicked, so opening the page sends nothing to YouTube or Google. Other
 * sources get a credit link only.
 */
export function VideoEmbed({ source }: { source: ExerciseSource }) {
  const [loaded, setLoaded] = useState(false);
  const online = useOnline();
  const yt = source.youtube;

  const credit = (
    <p className="video-credit">
      Bron:{' '}
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        {source.label}
      </a>
      {source.channel && ` · ${source.channel}`}
      {yt && ' (YouTube)'}
    </p>
  );

  if (!yt) return <section className="video-section">{credit}</section>;

  const src = `https://www.youtube-nocookie.com/embed/${yt.id}?rel=0&autoplay=1${yt.start ? `&start=${yt.start}` : ''}`;

  return (
    <section className="video-section" aria-labelledby="video-title">
      <h2 id="video-title" className="section-title">
        Video
      </h2>
      <div className="video-card">
        {loaded ? (
          <iframe src={src} title={source.label} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <div className="video-placeholder">
            <span className="video-placeholder-title">{source.label}</span>
            {online ? (
              <>
                <button type="button" className="video-play" onClick={() => setLoaded(true)}>
                  <PlayIcon size={18} />
                  Video laden (YouTube)
                </button>
                <span className="video-placeholder-note">De video wordt pas geladen als je erop klikt.</span>
              </>
            ) : (
              <span className="video-placeholder-note">Niet beschikbaar zonder internet. De oefening zelf werkt wel.</span>
            )}
          </div>
        )}
      </div>
      {credit}
    </section>
  );
}
