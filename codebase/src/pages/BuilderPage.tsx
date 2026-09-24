import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pitch } from '../components/Pitch';
import {
  CheckIcon,
  ClockIcon,
  CloseIcon,
  GripIcon,
  PlusIcon,
  SearchIcon,
} from '../components/icons';
import { EXERCISES, EXERCISE_BY_ID, TYPE_COLOR, materialNames, shortAgeLabel, type ExerciseType } from '../data/exercises';
import { BLOCKS, BLOCK_TARGETS, DURATIONS, TRAINING_INFO, useTraining, type BlockId } from '../data/training';

const TABS: ('Alle' | ExerciseType)[] = ['Alle', 'Warming-up', 'Technisch', 'Tactisch', 'Partijvorm'];

type DragSource = { src: 'lib'; ex: string } | { src: 'card'; from: BlockId; idx: number };

export function BuilderPage() {
  const { plan, duration, setDuration, activeBlock, setActiveBlock, addExercise, removeItem, changeMinutes, moveItem } = useTraining();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Alle');
  const [query, setQuery] = useState('');
  const [hover, setHover] = useState<BlockId | null>(null);
  const [dragging, setDragging] = useState<DragSource | null>(null);
  const drag = useRef<DragSource | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Pick up a toast passed along by "Aan training" on another page.
  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast;
    if (msg) {
      setToast(msg);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const activeName = BLOCKS.find((b) => b.id === activeBlock)!.name;
  const q = query.trim().toLowerCase();
  const library = EXERCISES.filter((e) => (tab === 'Alle' || e.type === tab) && (!q || e.title.toLowerCase().includes(q)));

  const startDrag = (ev: DragEvent, source: DragSource, effect: 'copyMove' | 'move') => {
    drag.current = source;
    setDragging(source);
    ev.dataTransfer.setData('text/plain', source.src === 'lib' ? source.ex : `${source.from}:${source.idx}`);
    ev.dataTransfer.effectAllowed = effect;
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(null);
    setHover(null);
  };
  const drop = (ev: DragEvent, to: BlockId) => {
    ev.preventDefault();
    const d = drag.current;
    endDrag();
    if (!d) return;
    if (d.src === 'lib') addExercise(to, d.ex);
    else if (d.from !== to) moveItem(d.from, d.idx, to);
  };

  // Totals
  const used = Object.fromEntries(BLOCKS.map((b) => [b.id, plan[b.id].reduce((s, it) => s + it.min, 0)])) as Record<BlockId, number>;
  const total = BLOCKS.reduce((s, b) => s + used[b.id], 0);
  const targets = BLOCK_TARGETS[duration];
  const rest = duration - total;
  const denom = Math.max(duration, total);
  const mats: string[] = [];
  BLOCKS.forEach((b) =>
    plan[b.id].forEach((it) => materialNames(EXERCISE_BY_ID[it.ex]).forEach((m) => !mats.includes(m) && mats.push(m))),
  );

  const status =
    rest > 0 ? `Nog ${rest} min te plannen` : rest === 0 ? `Precies ${duration} minuten` : `${Math.abs(rest)} min te veel`;
  const statusColor = rest < 0 ? 'var(--warn)' : rest === 0 ? 'var(--ok)' : 'var(--purple)';

  return (
    <div className="builder">
      <aside aria-label="Oefeningenbibliotheek" className="library">
        <div className="library-head">
          <div className="range-head">
            <h2 className="panel-title">Bibliotheek</h2>
            <Link to="/" className="btn-link" style={{ padding: 0 }}>
              Alle filters
            </Link>
          </div>
          <label className="search">
            <SearchIcon />
            <input
              type="search"
              aria-label="Zoek in bibliotheek"
              placeholder="Zoek een oefening"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
            />
          </label>
          <div className="library-tabs">
            {TABS.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tab === t} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <span className="library-hint">
            Sleep naar een blok, of druk op + om toe te voegen aan <strong>{activeName}</strong>.
          </span>
        </div>
        <div className="library-list">
          {library.length === 0 && <div className="library-empty">Geen oefeningen gevonden.</div>}
          {library.map((e) => (
            <div
              key={e.id}
              className="lib-item"
              draggable
              onDragStart={(ev) => startDrag(ev, { src: 'lib', ex: e.id }, 'copyMove')}
              onDragEnd={endDrag}
            >
              <span className="grip" aria-hidden="true">
                <GripIcon />
              </span>
              <div className="lib-thumb">
                <Pitch variant={e.variant} />
              </div>
              <div className="lib-info">
                <Link to={`/oefeningen/${e.id}`} className="lib-title" draggable={false}>
                  {e.title}
                </Link>
                <span className="lib-meta">
                  <span className="dot" style={{ background: TYPE_COLOR[e.type] }} />
                  {e.type} · {e.min} min · {shortAgeLabel(e.ageLabel)}
                </span>
              </div>
              <button
                type="button"
                className="add-btn"
                onClick={() => {
                  addExercise(activeBlock, e.id);
                  setToast(`${e.title} toegevoegd aan ${activeName}`);
                }}
                aria-label={`${e.title} toevoegen aan ${activeName}`}
              >
                <PlusIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="builder-main">
        <div className="page-head">
          <div className="page-head-titles" style={{ gap: 8 }}>
            <span className="crumbs">
              <Link to="/trainingen">Trainingen</Link> <span aria-hidden="true">/</span> <strong>Nieuwe training</strong>
            </span>
            <h1 className="builder-title">{TRAINING_INFO.title}</h1>
            <div className="pill-row">
              <span className="pill pill-dark">{TRAINING_INFO.theme}</span>
            </div>
          </div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => setToast('Training opgeslagen')}>
              <CheckIcon />
              Training opslaan
            </button>
          </div>
        </div>

        <section aria-label="Tijdsverdeling" className="timeline">
          <div className="timeline-total">
            <span className="eyebrow">Totale duur</span>
            <span className="timeline-total-value">
              <span style={{ color: rest < 0 ? 'var(--warn)' : 'var(--ink)' }}>{total}</span>
              <span className="of"> / {duration} min</span>
            </span>
            <div role="group" aria-label="Duur van de training" className="segmented duration-toggle">
              {DURATIONS.map((d) => (
                <button key={d} type="button" aria-pressed={duration === d} onClick={() => setDuration(d)}>
                  {d}′
                </button>
              ))}
            </div>
          </div>
          <div className="timeline-bar-wrap">
            <div className="timeline-bar">
              {BLOCKS.map((b) => (
                <span key={b.id} style={{ width: `${(used[b.id] / denom) * 100}%`, background: b.color }} />
              ))}
            </div>
            <div className="timeline-legend">
              {BLOCKS.map((b) => (
                <span key={b.id}>
                  <span className="sq" style={{ background: b.color }} />
                  {b.name} <strong>{used[b.id]}′</strong>
                </span>
              ))}
              <span className="timeline-status" style={{ color: statusColor }} role="status">
                {status}
              </span>
            </div>
          </div>
          <div className="timeline-divider" />
          <div className="timeline-mats">
            <span className="eyebrow">Materiaal</span>
            <div className="mat-list">
              {(mats.length ? mats : ['Nog geen materiaal']).map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="blocks">
          {BLOCKS.map((b, bi) => {
            const items = plan[b.id];
            const u = used[b.id];
            const isActive = activeBlock === b.id;
            const isHover = hover === b.id;
            const empty = items.length === 0;
            const usedColor = u > targets[b.id] ? 'var(--warn)' : u === targets[b.id] ? 'var(--purple)' : 'var(--muted)';
            return (
              <section
                key={b.id}
                aria-label={b.name}
                className={`block${isActive ? ' is-active' : ''}${isHover ? ' is-hover' : ''}`}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  if (hover !== b.id) setHover(b.id);
                }}
                onDragLeave={(ev) => {
                  if (!ev.currentTarget.contains(ev.relatedTarget as Node)) setHover((h) => (h === b.id ? null : h));
                }}
                onDrop={(ev) => drop(ev, b.id)}
              >
                <button type="button" className="block-head" onClick={() => setActiveBlock(b.id)} aria-pressed={isActive}>
                  <span className="block-head-row">
                    <span className="block-num" style={{ background: b.color }}>
                      {bi + 1}
                    </span>
                    <span className="block-name">{b.name}</span>
                    <span className="block-used" style={{ color: usedColor }}>
                      {u}/{targets[b.id]}′
                    </span>
                  </span>
                  <span className="block-progress">
                    <span style={{ width: `${Math.min(100, Math.round((u / targets[b.id]) * 100))}%`, background: b.color }} />
                  </span>
                </button>
                <div className="block-body">
                  {items.map((it, idx) => {
                    const e = EXERCISE_BY_ID[it.ex];
                    const isDragging = dragging?.src === 'card' && dragging.from === b.id && dragging.idx === idx;
                    return (
                      <article
                        key={it.uid}
                        className={`plan-card${isDragging ? ' is-dragging' : ''}`}
                        draggable
                        onDragStart={(ev) => startDrag(ev, { src: 'card', from: b.id, idx }, 'move')}
                        onDragEnd={endDrag}
                      >
                        <div className="plan-card-media">
                          <Pitch variant={e.variant} />
                          <button
                            type="button"
                            className="plan-card-remove"
                            onClick={() => removeItem(b.id, idx)}
                            aria-label={`Verwijder ${e.title}`}
                          >
                            <CloseIcon />
                          </button>
                        </div>
                        <div className="plan-card-body">
                          <div className="lib-info" style={{ gap: 3 }}>
                            <Link to={`/oefeningen/${e.id}`} className="plan-card-title" draggable={false}>
                              {e.title}
                            </Link>
                            <span className="lib-meta">
                              <span className="dot" style={{ background: TYPE_COLOR[e.type] }} />
                              {e.type} · {e.players} spelers
                            </span>
                          </div>
                          <div className="stepper">
                            <button
                              type="button"
                              onClick={() => changeMinutes(b.id, idx, -5)}
                              disabled={it.min <= 5}
                              aria-label="5 minuten korter"
                            >
                              −
                            </button>
                            <span className="stepper-value">{it.min} min</span>
                            <button
                              type="button"
                              onClick={() => changeMinutes(b.id, idx, 5)}
                              disabled={it.min >= 45}
                              aria-label="5 minuten langer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  <div className={`drop-slot${empty ? ' is-empty' : ''}`}>
                    <PlusIcon size={22} strokeWidth={2} />
                    <span>
                      {empty
                        ? 'Sleep een oefening hierheen'
                        : u < targets[b.id]
                          ? `Nog ${targets[b.id] - u} min · sleep om aan te vullen`
                          : 'Sleep om te wisselen'}
                    </span>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {toast && (
        <div className="toast" role="status">
          <CheckIcon size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
