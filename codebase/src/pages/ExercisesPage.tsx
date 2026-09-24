import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pitch } from '../components/Pitch';
import {
  AgeIcon,
  ArrowRightIcon,
  BookmarkIcon,
  ClockIcon,
  CloseIcon,
  DifficultyBars,
  PlayersIcon,
  PlusIcon,
  SearchIcon,
} from '../components/icons';
import {
  AGES,
  DIFFICULTY,
  EXERCISES,
  PHASES,
  TYPES,
  TYPE_COLOR,
  type AgeGroup,
  type Exercise,
  type ExerciseType,
  type Phase,
} from '../data/exercises';
import { BLOCKS, useTraining } from '../data/training';

type Sort = 'relevant' | 'duur' | 'moeilijkheid' | 'naam';

const MAX_PLAYERS = 22;

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function ExercisesPage() {
  const [ages, setAges] = useState<AgeGroup[]>([]);
  const [types, setTypes] = useState<ExerciseType[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [diff, setDiff] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(MAX_PLAYERS);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('relevant');

  const { favs, toggleFav, addExercise, activeBlock } = useTraining();
  const navigate = useNavigate();

  const reset = () => {
    setAges([]);
    setTypes([]);
    setPhases([]);
    setDiff(0);
    setMaxPlayers(MAX_PLAYERS);
    setQuery('');
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (e: Exercise, skipPhase = false) => {
      if (ages.length && !e.ages.some((a) => ages.includes(a))) return false;
      if (types.length && !types.includes(e.type)) return false;
      if (!skipPhase && phases.length && !phases.includes(e.phase)) return false;
      if (diff && e.diff !== diff) return false;
      if (e.pmin > maxPlayers) return false;
      if (q && !e.title.toLowerCase().includes(q)) return false;
      return true;
    };
  }, [ages, types, phases, diff, maxPlayers, query]);

  const list = useMemo(() => {
    const l = EXERCISES.filter((e) => matches(e));
    if (sort === 'duur') l.sort((a, b) => a.min - b.min);
    if (sort === 'moeilijkheid') l.sort((a, b) => a.diff - b.diff);
    if (sort === 'naam') l.sort((a, b) => a.title.localeCompare(b.title, 'nl'));
    return l;
  }, [matches, sort]);

  const active: { label: string; remove: () => void }[] = [
    ...ages.map((a) => ({ label: a.replace('–', ' – U'), remove: () => setAges((s) => toggle(s, a)) })),
    ...types.map((t) => ({ label: t, remove: () => setTypes((s) => toggle(s, t)) })),
    ...phases.map((p) => ({ label: p, remove: () => setPhases((s) => toggle(s, p)) })),
    ...(diff ? [{ label: DIFFICULTY[diff], remove: () => setDiff(0) }] : []),
    ...(maxPlayers < MAX_PLAYERS ? [{ label: `Tot ${maxPlayers} spelers`, remove: () => setMaxPlayers(MAX_PLAYERS) }] : []),
  ];

  const addToTraining = (e: Exercise) => {
    addExercise(activeBlock, e.id);
    const block = BLOCKS.find((b) => b.id === activeBlock)!;
    navigate('/trainingen', { state: { toast: `${e.title} toegevoegd aan ${block.name}` } });
  };

  return (
    <div className="dashboard">
      <aside aria-label="Filters" className="filters">
        <div className="filters-head">
          <h2 className="panel-title">Filters</h2>
          <button type="button" className="btn-link" onClick={reset}>
            Alles wissen
          </button>
        </div>

        <section className="filter-group">
          <h3 className="eyebrow">Leeftijdscategorie</h3>
          <div className="age-grid">
            {AGES.map((a) => (
              <button
                key={a}
                type="button"
                className="chip"
                aria-pressed={ages.includes(a)}
                onClick={() => setAges((s) => toggle(s, a))}
              >
                {a.replace('–', '-')}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group">
          <h3 className="eyebrow">Thema · type oefening</h3>
          <div className="chip-wrap">
            {TYPES.map((t) => {
              const on = types.includes(t.name);
              return (
                <button
                  key={t.name}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => setTypes((s) => toggle(s, t.name))}
                >
                  <span className="dot" style={{ background: on ? '#fff' : t.color }} />
                  {t.name}
                </button>
              );
            })}
          </div>
        </section>

        <fieldset className="filter-group" style={{ gap: 10 }}>
          <legend className="eyebrow" style={{ marginBottom: 12 }}>
            Speelfase
          </legend>
          {PHASES.map((p) => (
            <label key={p} className="check-row">
              <input type="checkbox" checked={phases.includes(p)} onChange={() => setPhases((s) => toggle(s, p))} />
              <span className="grow">{p}</span>
              <span className="count">{EXERCISES.filter((e) => e.phase === p && matches(e, true)).length}</span>
            </label>
          ))}
        </fieldset>

        <section className="filter-group">
          <h3 className="eyebrow">Moeilijkheid</h3>
          <div role="group" aria-label="Moeilijkheid" className="segmented">
            {DIFFICULTY.map((d, i) => (
              <button key={d} type="button" aria-pressed={diff === i} onClick={() => setDiff(i)}>
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group">
          <div className="range-head">
            <h3 className="eyebrow">
              <label htmlFor="spelers">Aantal spelers</label>
            </h3>
            <span className="range-value">tot {maxPlayers}</span>
          </div>
          <input
            id="spelers"
            type="range"
            min={2}
            max={MAX_PLAYERS}
            step={1}
            value={maxPlayers}
            onChange={(ev) => setMaxPlayers(Number(ev.target.value))}
          />
          <div className="range-scale">
            <span>2</span>
            <span>11</span>
            <span>22</span>
          </div>
        </section>

        <div className="promo">
          <span className="promo-title">Training van 60 tot 90 minuten?</span>
          <span className="promo-text">Stel je sessie samen in vier blokken en zie meteen of de tijd klopt.</span>
          <Link to="/trainingen">
            Open trainingsbouwer
            <ArrowRightIcon />
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        <div className="page-head">
          <div className="page-head-titles">
            <span className="kicker">Oefeningendatabank</span>
            <h1 className="page-title">Oefeningen</h1>
            <span className="page-sub">
              {list.length} {list.length === 1 ? 'oefening' : 'oefeningen'} · afgestemd op jeugdvoetbal
            </span>
          </div>
          <div className="toolbar">
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                aria-label="Zoek een oefening"
                placeholder="Zoek op naam, bv. rondo"
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
              />
            </label>
            <label className="sort">
              Sorteer
              <select value={sort} onChange={(ev) => setSort(ev.target.value as Sort)}>
                <option value="relevant">Aanbevolen</option>
                <option value="duur">Duur</option>
                <option value="moeilijkheid">Moeilijkheid</option>
                <option value="naam">Naam A–Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="active-filters">
          {active.length === 0 ? (
            <span>Geen filters actief. Kies een leeftijd of thema om te verfijnen.</span>
          ) : (
            active.map((a) => (
              <button key={a.label} type="button" className="active-chip" onClick={a.remove} aria-label={`Filter ${a.label} verwijderen`}>
                {a.label}
                <CloseIcon />
              </button>
            ))
          )}
        </div>

        {list.length === 0 ? (
          <div className="empty">
            <span className="empty-title">Geen oefeningen gevonden</span>
            <span className="empty-text">Probeer een andere zoekterm of pas de filters aan.</span>
            <button type="button" className="btn btn-primary" onClick={reset}>
              Filters wissen
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {list.map((e) => (
              <ExerciseCard
                key={e.id}
                exercise={e}
                isFav={favs.includes(e.id)}
                onFav={() => toggleFav(e.id)}
                onAdd={() => addToTraining(e)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ExerciseCard({
  exercise: e,
  isFav,
  onFav,
  onAdd,
}: {
  exercise: Exercise;
  isFav: boolean;
  onFav: () => void;
  onAdd: () => void;
}) {
  return (
    <article className="ex-card">
      <div className="ex-card-media">
        <Pitch variant={e.variant} />
        <span className="type-badge">
          <span className="dot" style={{ background: TYPE_COLOR[e.type] }} />
          {e.type}
        </span>
        <button type="button" className="icon-btn" onClick={onFav} aria-pressed={isFav} aria-label={`Bewaar ${e.title}`}>
          <BookmarkIcon filled={isFav} />
        </button>
      </div>
      <div className="ex-card-body">
        <div>
          <span className="ex-card-phase">{e.phase}</span>
          <h3 className="ex-card-title">
            <Link to={`/oefeningen/${e.id}`}>{e.title}</Link>
          </h3>
        </div>
        <div className="ex-card-meta">
          <span>
            <AgeIcon />
            {e.ageLabel}
          </span>
          <span>
            <PlayersIcon />
            {e.players} spelers
          </span>
          <span>
            <ClockIcon />
            {e.min} min
          </span>
        </div>
        <div className="ex-card-foot">
          <span className="ex-card-diff">
            <DifficultyBars level={e.diff} />
            {DIFFICULTY[e.diff]}
          </span>
          <button type="button" className="btn-soft" onClick={onAdd}>
            <PlusIcon />
            Aan training
          </button>
        </div>
      </div>
    </article>
  );
}
