import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BodyDemo } from '../components/BodyDemo';
import { Pitch } from '../components/Pitch';
import { PitchAnimation } from '../components/PitchAnimation';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  BookmarkIcon,
  CheckIcon,
  DifficultyBars,
  FieldIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
} from '../components/icons';
import {
  DIFFICULTY,
  EXERCISE_BY_ID,
  INTENSITY,
  TYPE_COLOR,
  getLoadedExerciseDetails,
  loadExerciseDetails,
  type ExerciseDetail,
} from '../data/exercises';
import type { ANIMATIONS } from '../data/animations';
import type { DEMOS } from '../data/demos';
import { BLOCKS, clampMinutes, formatTrainingDate, trainingPath, useTraining } from '../data/training';
import { TRAINING_BUILDER } from '../features';

/** The detail text for all exercises; loads its chunk on first use and re-renders when it arrives. */
function useExerciseDetails() {
  const [details, setDetails] = useState(getLoadedExerciseDetails);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (details) return;
    let cancelled = false;
    loadExerciseDetails()
      .then((d) => !cancelled && setDetails(d))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [details]);

  return { details, failed };
}

interface Animations {
  pitch: typeof ANIMATIONS;
  demos: typeof DEMOS;
}

let loadedAnimations: Animations | null = null;

/**
 * The diagram animations (players on the pitch) and instruction demos (body movement); like the detail
 * text they load as their own chunks, since only this page uses them.
 */
function useAnimations() {
  const [animations, setAnimations] = useState(loadedAnimations);

  useEffect(() => {
    if (animations) return;
    let cancelled = false;
    // If the chunk fails to load, the page simply shows no "Afspelen" button.
    Promise.all([import('../data/animations'), import('../data/demos')])
      .then(([a, d]) => {
        loadedAnimations = { pitch: a.ANIMATIONS, demos: d.DEMOS };
        if (!cancelled) setAnimations(loadedAnimations);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [animations]);

  return animations;
}

export function DetailPage() {
  const { id = '' } = useParams();
  const e = EXERCISE_BY_ID[id];
  const { favs, toggleFav, addExercise, date, team, draftId } = useTraining();
  const { details, failed } = useExerciseDetails();
  const animations = useAnimations();
  const d: ExerciseDetail | undefined = details?.[id];

  const diagramSteps = d?.diagramSteps ?? [];
  const hasStepToggle = diagramSteps.length >= 2;
  // Open on the second stage when there are three or more (the first one only shows the setup).
  const defaultStep = Math.min(1, diagramSteps.length - 1);
  const [step, setStep] = useState(defaultStep);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState('');
  const onBeat = useCallback((label: string) => setBeat(label), []);
  const [block, setBlock] = useState(1);
  const [min, setMin] = useState(e?.min ?? 15);
  const [added, setAdded] = useState<string | null>(null);

  // Reset local state when navigating between exercises.
  useEffect(() => {
    setStep(defaultStep);
    setPlaying(false);
    setBlock(1);
    setMin(e?.min ?? 15);
    setAdded(null);
    window.scrollTo(0, 0);
  }, [id, e?.min, defaultStep]);

  if (!e) {
    return (
      <div className="not-found">
        <span className="empty-title">Oefening niet gevonden</span>
        <Link to="/" className="btn btn-primary">
          Terug naar oefeningen
        </Link>
      </div>
    );
  }

  const fav = favs.includes(e.id);
  const hint = hasStepToggle ? diagramSteps[step]?.[1] : diagramSteps[0]?.[1];
  const animation = animations?.pitch[e.variant];
  const demo = animations?.demos[e.variant];
  const showDemo = !!demo && playing;

  const add = () => {
    addExercise(BLOCKS[block].id, e.id, min);
    setAdded(`${min} min toegevoegd aan ${BLOCKS[block].name}`);
  };

  return (
    <div className="detail">
      <div className="detail-head">
        <nav aria-label="Kruimelpad" className="breadcrumb">
          <Link to="/">
            <ArrowLeftIcon />
            Oefeningen
          </Link>
          <span aria-hidden="true">/</span>
          <span>{e.type}</span>
          <span aria-hidden="true">/</span>
          <span className="current">{e.title}</span>
        </nav>

        <div className="detail-hero">
          <div className="detail-hero-text">
            <div className="tag-row">
              <span className="tag tag-type">
                <span className="dot" style={{ background: TYPE_COLOR[e.type] }} />
                {e.type}
              </span>
              <span className="tag tag-phase">{e.phase}</span>
              <span className="tag tag-outline">Ik Dien-methode · Bouwfase</span>
            </div>
            <h1 className="detail-title">{e.title}</h1>
            {d ? (
              <p className="detail-summary">{d.summary}</p>
            ) : failed ? (
              <p className="detail-summary detail-load-error" role="alert">
                De beschrijving kon niet geladen worden.{' '}
                {/* A failed module import stays failed until the page reloads (usually a new deploy replaced the file). */}
                <button type="button" className="btn-link" onClick={() => window.location.reload()}>
                  Pagina herladen
                </button>
              </p>
            ) : (
              <div className="detail-summary" aria-busy="true" aria-label="Beschrijving laden">
                <span className="skeleton" style={{ width: '92%' }} />
                <span className="skeleton" style={{ width: '64%' }} />
              </div>
            )}
          </div>
          <div className="actions" style={{ flexShrink: 0 }}>
            <button type="button" className="btn" onClick={() => toggleFav(e.id)} aria-pressed={fav}>
              <BookmarkIcon filled={fav} />
              {fav ? 'Bewaard' : 'Bewaren'}
            </button>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <figure className="diagram">
            {/* Above the drawing rather than on top of it, so it never covers players or cones. */}
            <div className="diagram-toolbar">
              {(animation || demo) && (
                <button type="button" className="btn diagram-play" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
                  {playing ? <StopIcon size={14} /> : <PlayIcon size={14} />}
                  {playing ? 'Stoppen' : 'Afspelen'}
                </button>
              )}
              {hasStepToggle && !playing && (
                <div role="group" aria-label="Fase in de oefening" className="segmented diagram-steps">
                  {diagramSteps.map(([label], i) => (
                    <button key={label} type="button" aria-pressed={step === i} onClick={() => setStep(i)}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <span className="diagram-size">
                <FieldIcon size={14} />
                {e.field}
              </span>
            </div>
            <div className="diagram-canvas">
              {demo && playing ? (
                <BodyDemo def={demo} onBeat={onBeat} />
              ) : animation && playing ? (
                <PitchAnimation variant={e.variant} def={animation} onBeat={onBeat} />
              ) : (
                <Pitch variant={e.variant} step={hasStepToggle && step < diagramSteps.length - 1 ? step : undefined} />
              )}
            </div>
            <figcaption>
              <span>
                <span className="legend-dot" style={{ background: 'var(--purple)', boxShadow: '0 0 0 1px #C7B6EF' }} />
                {showDemo ? 'Speler' : 'Balbezittende ploeg'}
              </span>
              <span>
                <span className="legend-dot" style={{ background: '#F2A541', boxShadow: '0 0 0 1px #F2D2A0' }} />
                {showDemo ? 'Partner' : 'Tegenstander'}
              </span>
              {!showDemo && (
                <>
                  <span>
                    <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true">
                      <line x1="0" y1="5" x2="22" y2="5" stroke="#1A1033" strokeWidth="1.6" strokeDasharray="4 3" />
                      <path d="M21 1l6 4-6 4z" fill="#1A1033" />
                    </svg>
                    Pass
                  </span>
                  <span>
                    <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true">
                      <line x1="0" y1="5" x2="22" y2="5" stroke="#5B2BC4" strokeWidth="2" />
                      <path d="M21 1l6 4-6 4z" fill="#5B2BC4" />
                    </svg>
                    Loopactie
                  </span>
                  <span>
                    <span style={{ width: 18, height: 10, border: '1.5px solid #1A1033', background: '#fff' }} />
                    Doeltje
                  </span>
                </>
              )}
              {playing && beat ? (
                <span className="diagram-hint diagram-beat">{beat}</span>
              ) : (
                hint && <span className="diagram-hint">{hint}</span>
              )}
            </figcaption>
          </figure>

          {d ? (
            <>
              <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 className="section-title">Verloop</h2>
                <ol className="steps">
                  {d.steps.map((s, i) => (
                    <li key={s.title}>
                      <span className="step-num">{i + 1}</span>
                      <span>
                        <strong>{s.title}</strong> {s.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 className="section-title">Variaties</h2>
                <div className="variations">
                  <div className="variation easier">
                    <span className="variation-label">
                      <ArrowDownIcon />
                      Makkelijker
                    </span>
                    <span className="variation-text">{d.easier}</span>
                  </div>
                  <div className="variation harder">
                    <span className="variation-label">
                      <ArrowUpIcon />
                      Moeilijker
                    </span>
                    <span className="variation-text">{d.harder}</span>
                  </div>
                </div>
              </section>
            </>
          ) : (
            !failed && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy="true" aria-label="Verloop laden">
                <h2 className="section-title">Verloop</h2>
                {[88, 95, 80, 70].map((w) => (
                  <span key={w} className="skeleton skeleton-row" style={{ width: `${w}%` }} />
                ))}
              </section>
            )
          )}
        </div>

        <aside className="detail-aside">
          <section aria-label="Kerngegevens" className="stats">
            <div className="stat">
              <span className="eyebrow">Duur</span>
              <span className="stat-value">{e.min} min</span>
            </div>
            <div className="stat">
              <span className="eyebrow">Spelers</span>
              <span className="stat-value">
                {e.players} {e.playersDetail && <small>{e.playersDetail}</small>}
              </span>
            </div>
            <div className="stat">
              <span className="eyebrow">Leeftijd</span>
              <span className="stat-value">{e.ageLabel}</span>
            </div>
            <div className="stat" style={{ gap: 8 }}>
              <span className="eyebrow">Moeilijkheid</span>
              <span className="stat-row">
                <DifficultyBars level={e.diff} width={6} base={4} step={6} />
                <span className="stat-value" style={{ fontSize: 26 }}>
                  {DIFFICULTY[e.diff]}
                </span>
              </span>
            </div>
            <div className="stat wide">
              <div className="stat-head">
                <span className="eyebrow">Intensiteit</span>
                <strong>{INTENSITY[e.intensity]}</strong>
              </div>
              <div className="intensity" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    style={{
                      background: n <= e.intensity ? 'var(--purple)' : 'var(--line-strong)',
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {TRAINING_BUILDER ? (
            <section className="add-panel">
              <span className="panel-title" style={{ letterSpacing: '0.02em' }}>
                Toevoegen aan training
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="add-panel-sub">
                  Training van {formatTrainingDate(date)}
                  {team && ` · ${team}`}
                </span>
                <div role="group" aria-label="Blok" className="segmented">
                  {BLOCKS.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={block === i}
                      onClick={() => {
                        setBlock(i);
                        setAdded(null);
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="add-panel-row">
                <div className="dark-stepper">
                  <button
                    type="button"
                    aria-label="5 minuten korter"
                    onClick={() => {
                      setMin((m) => clampMinutes(m - 5));
                      setAdded(null);
                    }}
                  >
                    −
                  </button>
                  <span>{min} min</span>
                  <button
                    type="button"
                    aria-label="5 minuten langer"
                    onClick={() => {
                      setMin((m) => clampMinutes(m + 5));
                      setAdded(null);
                    }}
                  >
                    +
                  </button>
                </div>
                <button type="button" className="add-panel-submit" onClick={add}>
                  <PlusIcon size={16} />
                  Toevoegen
                </button>
              </div>
              {added && (
                <div role="status" className="add-panel-status">
                  <span>
                    <CheckIcon size={18} />
                    {added}
                  </span>
                  <Link to={trainingPath(draftId)}>Bekijk training</Link>
                </div>
              )}
            </section>
          ) : (
            <section className="add-panel">
              <span className="panel-title" style={{ letterSpacing: '0.02em' }}>
                Toevoegen aan training
              </span>
              <span className="add-panel-sub">
                <span className="soon-badge">Binnenkort</span> Met de trainingsbouwer zet je deze oefening straks meteen in je training.
              </span>
            </section>
          )}

          {d && (
            <>
              <section className="card-section">
                <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
                  Doelstellingen
                </h2>
                <div className="objectives">
                  {d.objectives.map((o) => (
                    <span key={o}>{o}</span>
                  ))}
                </div>
              </section>

              <section className="card-section">
                <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
                  Coachingpunten
                </h2>
                <ul className="coaching">
                  {d.coaching.map((c) => (
                    <li key={c}>
                      <CheckIcon size={20} strokeWidth={2.4} />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <section className="card-section" style={{ gap: 12 }}>
            <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
              Materiaal
            </h2>
            <div className="materials">
              {e.materials.map((m) => (
                <span key={m.name}>
                  <span>{m.name}</span>
                  <strong>{m.qty}</strong>
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {d && (
        <section className="detail-related">
          <div className="related-head">
            <h2 className="section-title">Past goed bij</h2>
            <Link to="/">Alle oefeningen</Link>
          </div>
          <div className="related-grid">
            {d.related.map(({ id: rid, fit }) => {
              const r = EXERCISE_BY_ID[rid];
              return (
                <Link key={rid} to={`/oefeningen/${rid}`} className="related-card">
                  <div className="related-media">
                    <Pitch variant={r.variant} />
                  </div>
                  <span className="related-body">
                    <span className="related-fit">{fit}</span>
                    <span className="related-title">{r.title}</span>
                    <span className="related-meta">
                      {r.min} min · {r.players}
                      {/^\d+$/.test(r.players) || /^\d+–\d+$/.test(r.players) ? ' spelers' : ''}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
