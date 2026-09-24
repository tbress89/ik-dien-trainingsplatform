import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pitch } from '../components/Pitch';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  BookmarkIcon,
  CheckIcon,
  DifficultyBars,
  FieldIcon,
  PlusIcon,
} from '../components/icons';
import { DIFFICULTY, EXERCISE_BY_ID, INTENSITY, TYPE_COLOR } from '../data/exercises';
import { BLOCKS, TRAINING_INFO, clampMinutes, useTraining } from '../data/training';

export function DetailPage() {
  const { id = '' } = useParams();
  const e = EXERCISE_BY_ID[id];
  const { favs, toggleFav, addExercise } = useTraining();

  const diagramSteps = e?.diagramSteps ?? [];
  const hasStepToggle = diagramSteps.length >= 2;
  // Open on the second stage when there are three or more (the first one only shows the setup).
  const defaultStep = Math.min(1, diagramSteps.length - 1);
  const [step, setStep] = useState(defaultStep);
  const [block, setBlock] = useState(1);
  const [min, setMin] = useState(e?.min ?? 15);
  const [added, setAdded] = useState<string | null>(null);

  // Reset local state when navigating between exercises.
  useEffect(() => {
    setStep(defaultStep);
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
            <p className="detail-summary">{e.summary}</p>
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
            <div className="diagram-canvas">
              <Pitch variant={e.variant} step={hasStepToggle && step < diagramSteps.length - 1 ? step : undefined} />
              {hasStepToggle && (
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
            <figcaption>
              <span>
                <span className="legend-dot" style={{ background: 'var(--purple)', boxShadow: '0 0 0 1px #C7B6EF' }} />
                Balbezittende ploeg
              </span>
              <span>
                <span className="legend-dot" style={{ background: '#F2A541', boxShadow: '0 0 0 1px #F2D2A0' }} />
                Tegenstander
              </span>
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
              {hint && <span className="diagram-hint">{hint}</span>}
            </figcaption>
          </figure>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="section-title">Verloop</h2>
            <ol className="steps">
              {e.steps.map((s, i) => (
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
                <span className="variation-text">{e.easier}</span>
              </div>
              <div className="variation harder">
                <span className="variation-label">
                  <ArrowUpIcon />
                  Moeilijker
                </span>
                <span className="variation-text">{e.harder}</span>
              </div>
            </div>
          </section>
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
                  <span key={n} style={{ background: n <= e.intensity ? 'var(--purple)' : 'var(--line-strong)' }} />
                ))}
              </div>
            </div>
          </section>

          <section className="add-panel">
            <span className="panel-title" style={{ letterSpacing: '0.02em' }}>
              Toevoegen aan training
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="add-panel-sub">Training van {TRAINING_INFO.label}</span>
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
                <Link to="/trainingen">Bekijk training</Link>
              </div>
            )}
          </section>

          <section className="card-section">
            <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
              Doelstellingen
            </h2>
            <div className="objectives">
              {e.objectives.map((o) => (
                <span key={o}>{o}</span>
              ))}
            </div>
          </section>

          <section className="card-section">
            <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
              Coachingpunten
            </h2>
            <ul className="coaching">
              {e.coaching.map((c) => (
                <li key={c}>
                  <CheckIcon size={20} strokeWidth={2.4} />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

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

      <section className="detail-related">
        <div className="related-head">
          <h2 className="section-title">Past goed bij</h2>
          <Link to="/">Alle oefeningen</Link>
        </div>
        <div className="related-grid">
          {e.related.map(({ id: rid, fit }) => {
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
    </div>
  );
}
