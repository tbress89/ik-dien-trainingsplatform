import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EXERCISE_BY_ID } from '../data/exercises';
import type { SharedTraining } from '../data/share';
import { BLOCKS } from '../data/training';
import { BodyDemo } from './BodyDemo';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, PauseIcon, PlayIcon, PlusIcon, RestartIcon, StopIcon } from './icons';
import { Pitch } from './Pitch';
import { PitchAnimation } from './PitchAnimation';
import { useAnimations, useExerciseDetails } from './useExerciseData';

const pad = (n: number) => String(n).padStart(2, '0');
/** 83000 ms → "1:23"; rounds up, so the clock only shows 0:00 when time is really up. */
const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

/** Three short beeps, for when an exercise's time is up. Needs an AudioContext started by a tap. */
function beep(ctx: AudioContext | null) {
  if (!ctx) return;
  [0, 0.35, 0.7].forEach((at) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + 0.3);
  });
}

/** Keeps the phone screen on while the training runs (where the browser supports it). */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        // Not allowed (battery saver, unsupported browser): the screen just follows its normal timeout.
      }
    };
    request();
    // The lock is dropped when the page is hidden; take it again when the coach comes back.
    const onVisible = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, []);
}

/**
 * "Training geven": the training on the pitch, one exercise at a time. Big diagram (with its animation),
 * the coaching points to read out, and a countdown per exercise that beeps and vibrates when time is up.
 */
export function PitchMode({ training, backTo }: { training: SharedTraining; backTo: string }) {
  const items = BLOCKS.flatMap((b) => training.plan[b.id].map((it) => ({ ...it, block: b })));
  // Minute each exercise starts at, counted from the start of the training.
  const starts = items.map((_, i) => items.slice(0, i).reduce((sum, it) => sum + it.min, 0));
  const total = items.reduce((s, it) => s + it.min, 0);

  const [index, setIndex] = useState(0);
  const item = items[index];
  const { details } = useExerciseDetails();
  const animations = useAnimations();

  // Timer: while running, `endsAt` is the moment it reaches zero; while paused, `remaining` holds the rest.
  const [remaining, setRemaining] = useState(() => (item ? item.min * 60000 : 0));
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState('');
  const onBeat = useCallback((label: string) => setBeat(label), []);
  const audio = useRef<AudioContext | null>(null);
  const alerted = useRef(false);

  useWakeLock();

  const left = endsAt !== null ? Math.max(0, endsAt - now) : remaining;
  const running = endsAt !== null && left > 0;
  const timeUp = item !== undefined && left === 0;

  useEffect(() => {
    if (endsAt === null) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [endsAt]);

  useEffect(() => {
    if (!timeUp || alerted.current) return;
    alerted.current = true;
    beep(audio.current);
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  }, [timeUp]);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= items.length) return;
      setIndex(i);
      setRemaining(items[i].min * 60000);
      setEndsAt(null);
      setPlaying(false);
      alerted.current = false;
      window.scrollTo(0, 0);
    },
    [items],
  );

  const toggleTimer = () => {
    // Browsers only allow sound after a tap, so the audio starts with the first press of the timer.
    audio.current ??= new AudioContext();
    if (audio.current.state === 'suspended') audio.current.resume().catch(() => {});
    if (running) {
      setRemaining(left);
      setEndsAt(null);
    } else if (left > 0) {
      setNow(Date.now());
      setEndsAt(Date.now() + left);
    }
  };
  const addMinute = () => {
    alerted.current = false;
    if (endsAt !== null) setEndsAt(Math.max(endsAt, Date.now()) + 60000);
    else setRemaining((r) => r + 60000);
  };
  const resetTimer = () => {
    alerted.current = false;
    setEndsAt(null);
    setRemaining(item.min * 60000);
  };

  // Laptop or tablet with a keyboard: arrows switch exercise, space starts or pauses the timer.
  const keys = useRef({ goTo, toggleTimer, index });
  keys.current = { goTo, toggleTimer, index };
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLElement && ev.target.closest('input, textarea, select, button, summary')) return;
      if (ev.key === 'ArrowRight') keys.current.goTo(keys.current.index + 1);
      else if (ev.key === 'ArrowLeft') keys.current.goTo(keys.current.index - 1);
      else if (ev.key === ' ') {
        ev.preventDefault();
        keys.current.toggleTimer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!item) {
    return (
      <div className="not-found">
        <span className="empty-title">Deze training heeft nog geen oefeningen</span>
        <Link to={backTo} className="btn btn-primary">
          Terug
        </Link>
      </div>
    );
  }

  const e = EXERCISE_BY_ID[item.ex];
  const d = details?.[item.ex];
  const steps = d?.steps.filter((s) => s.title !== 'Ritme.') ?? [];
  const animation = animations?.pitch[e.variant];
  const demo = animations?.demos[e.variant];
  const last = index === items.length - 1;
  const progress = 1 - left / (item.min * 60000);

  return (
    <div className="pm">
      <header className="pm-top">
        <Link to={backTo} className="pm-close" aria-label="Stoppen met training geven">
          <CloseIcon size={20} />
        </Link>
        <div className="pm-top-text">
          <span className="pm-top-title">Training geven</span>
          <span className="pm-top-sub">
            Oefening {index + 1} van {items.length} · {starts[index]}′–{starts[index] + item.min}′ van {total}′
          </span>
        </div>
      </header>
      <div className="pm-steps" aria-hidden="true">
        {items.map((it, i) => (
          <span
            key={it.uid}
            className={i < index ? 'is-done' : i === index ? 'is-now' : ''}
            style={{ flex: it.min, background: it.block.color }}
          />
        ))}
      </div>

      <main className="pm-main">
        <div className="pm-head">
          <span className="pm-block" style={{ background: item.block.color }}>
            {item.block.name}
          </span>
          <h1 className="pm-title">{e.title}</h1>
          <span className="pm-facts">
            {e.players} spelers · {e.field}
          </span>
        </div>

        <section className={`pm-timer${running ? ' is-running' : ''}${timeUp ? ' is-up' : ''}`} aria-label="Timer">
          <span className="pm-time" role="timer" aria-live={timeUp ? 'assertive' : 'off'}>
            {timeUp ? 'Tijd!' : clock(left)}
          </span>
          <span className="pm-timer-bar">
            <span style={{ width: `${Math.min(100, progress * 100)}%` }} />
          </span>
          <div className="pm-timer-actions">
            <button type="button" className="pm-icon-btn" onClick={resetTimer} aria-label="Timer opnieuw">
              <RestartIcon size={20} />
            </button>
            <button type="button" className="pm-start" onClick={toggleTimer} disabled={timeUp}>
              {running ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
              {running ? 'Pauze' : left < item.min * 60000 ? 'Verder' : 'Start'}
            </button>
            <button type="button" className="pm-icon-btn" onClick={addMinute} aria-label="Eén minuut erbij">
              <PlusIcon size={16} />
              <span className="pm-plus-label">1′</span>
            </button>
          </div>
        </section>

        <figure className="pm-diagram">
          <div className="diagram-canvas">
            {playing && demo ? (
              <BodyDemo def={demo} onBeat={onBeat} />
            ) : playing && animation ? (
              <PitchAnimation variant={e.variant} def={animation} onBeat={onBeat} />
            ) : (
              <Pitch variant={e.variant} />
            )}
          </div>
          {(animation || demo) && (
            <figcaption>
              <button type="button" className="btn diagram-play" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
                {playing ? <StopIcon size={14} /> : <PlayIcon size={14} />}
                {playing ? 'Stoppen' : 'Afspelen'}
              </button>
              {playing && beat && <span className="pm-beat">{beat}</span>}
            </figcaption>
          )}
        </figure>

        {d && (
          <section className="pm-coach" aria-label="Coaching">
            <h2>Coaching</h2>
            <ul>
              {d.coaching.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {steps.length > 0 && (
          <details className="pm-org">
            <summary>Organisatie en verloop</summary>
            {steps.map((s) => (
              <p key={s.title}>
                <strong>{s.title}</strong> {s.text}
              </p>
            ))}
            {e.materials.length > 0 && (
              <p>
                <strong>Materiaal.</strong> {e.materials.map((m) => `${m.qty} ${m.name.toLowerCase()}`).join(', ')}
              </p>
            )}
          </details>
        )}
      </main>

      <nav className="pm-nav" aria-label="Oefeningen">
        <button type="button" className="btn" onClick={() => goTo(index - 1)} disabled={index === 0}>
          <ChevronLeftIcon size={18} />
          Vorige
        </button>
        {last ? (
          <Link to={backTo} className={`btn btn-primary${timeUp ? ' is-pulsing' : ''}`}>
            Training afronden
          </Link>
        ) : (
          <button type="button" className={`btn btn-primary${timeUp ? ' is-pulsing' : ''}`} onClick={() => goTo(index + 1)}>
            <span className="pm-next-label">
              Volgende: <span>{EXERCISE_BY_ID[items[index + 1].ex].title}</span>
            </span>
            <ChevronRightIcon size={18} />
          </button>
        )}
      </nav>
    </div>
  );
}
