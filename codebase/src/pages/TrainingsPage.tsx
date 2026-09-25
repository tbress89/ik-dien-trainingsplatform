import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pitch } from '../components/Pitch';
import { ArrowRightIcon, ChevronDownIcon, ChevronRightIcon, PlayersIcon, PlusIcon, SearchIcon, TagIcon } from '../components/icons';
import { useDismiss } from '../components/useDismiss';
import { EXERCISE_BY_ID, THEMES, type Theme } from '../data/exercises';
import { SQUAD_SIZE, type Session } from '../data/sessions';
import {
  BLOCKS,
  BLOCK_TARGETS,
  MONTH_NAMES,
  formatTrainingDate,
  parseISODate,
  todayISO,
  trainingPath,
  useTraining,
  type BlockId,
  type Duration,
} from '../data/training';

type Tab = 'up' | 'past' | 'all';
const TABS: [Tab, string][] = [
  ['up', 'Komende'],
  ['past', 'Afgelopen'],
  ['all', 'Alle'],
];

const TEMPLATES: { duration: Duration; name: string }[] = [
  { duration: 60, name: 'Korte training' },
  { duration: 75, name: 'Standaard training' },
  { duration: 90, name: 'Lange training' },
];

// Block colours on the dark "next training" card; the purple kern colour is lightened to stay visible.
const DARK_BLOCK_COLOR: Record<BlockId, string> = { wu: '#F2A541', kern: '#8B63E0', pv: '#FFFFFF' };
const BLOCK_COLOR = Object.fromEntries(BLOCKS.map((b) => [b.id, b.color])) as Record<BlockId, string>;
const BLOCK_NAME = Object.fromEntries(BLOCKS.map((b) => [b.id, b.name])) as Record<BlockId, string>;

const DAY_SHORT = ['ZO', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA'];

const exerciseCount = (n: number) => `${n} ${n === 1 ? 'oefening' : 'oefeningen'}`;

/** Exercises of a session in block order, as [block, exercise id, minutes]. */
const exercisesOf = (s: Session) => BLOCKS.flatMap((b) => s.plan[b.id].map((it) => [b.id, it.ex, it.min] as const));

function relativeDay(iso: string, today: string): string {
  const days = Math.round((parseISODate(iso).getTime() - parseISODate(today).getTime()) / 86_400_000);
  return days === 0 ? 'vandaag' : days === 1 ? 'morgen' : `over ${days} dagen`;
}

function BlockBar({ duration, colors }: { duration: Duration; colors: Record<BlockId, string> }) {
  const targets = BLOCK_TARGETS[duration];
  return (
    <>
      {BLOCKS.map((b) => (
        <span key={b.id} style={{ width: `${(targets[b.id] / duration) * 100}%`, background: colors[b.id] }} />
      ))}
    </>
  );
}

export function TrainingsPage() {
  const { sessions, newTraining } = useTraining();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('up');
  const [theme, setTheme] = useState<Theme | 'Alle'>('Alle');

  const today = todayISO();
  const upcoming = sessions.filter((s) => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = sessions.filter((s) => s.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const byTab: Record<Tab, Session[]> = { up: upcoming, past, all: [...upcoming, ...past] };
  const next = upcoming[0];
  const rows = byTab[tab].filter((s) => theme === 'Alle' || s.theme === theme);

  const startNew = (duration?: Duration) => {
    newTraining(duration);
    navigate(trainingPath(null));
  };

  return (
    <div className="trainings">
      <div className="trainings-head">
        <h1 className="page-title">Trainingen</h1>
        <button type="button" className="btn btn-primary trainings-new" onClick={() => startNew()}>
          <PlusIcon size={16} />
          Nieuwe training
        </button>
      </div>

      {next && <NextTraining session={next} today={today} />}

      <div className="trainings-body">
        <section aria-label="Alle trainingen" className="trainings-list">
          <div className="trainings-toolbar">
            <div role="group" aria-label="Weergave" className="trainings-tabs">
              {TABS.map(([key, label]) => (
                <button key={key} type="button" aria-pressed={tab === key} onClick={() => setTab(key)}>
                  {label}
                  <span className="count-badge">{byTab[key].length}</span>
                </button>
              ))}
            </div>
            <ThemeFilter theme={theme} setTheme={setTheme} sessions={byTab[tab]} />
          </div>

          <div className="session-grid session-grid-head" aria-hidden="true">
            <span>Datum</span>
            <span>Training</span>
            <span>Opbouw</span>
            <span>Oefeningen</span>
            <span />
          </div>

          {rows.length === 0 && (
            <div className="trainings-empty">
              {sessions.length === 0
                ? 'Nog geen trainingen. Maak de eerste training aan.'
                : 'Geen trainingen met dit thema. Kies een ander thema of maak een nieuwe training.'}
            </div>
          )}

          <div className="session-rows">
            {rows.map((s) => {
              const date = parseISODate(s.date);
              const isNext = s.id === next?.id;
              const isPast = s.date < today;
              const exercises = exercisesOf(s);
              const thumbs = exercises.slice(0, exercises.length > 3 ? 2 : 3);
              const targets = BLOCK_TARGETS[s.duration];
              return (
                <Link
                  key={s.id}
                  to={trainingPath(s.id)}
                  className={`session-grid session-row${isNext ? ' is-next' : ''}${isPast ? ' is-past' : ''}`}
                >
                  <span className="session-date">
                    <span>{DAY_SHORT[date.getDay()]}</span>
                    <span className="session-date-num">{date.getDate()}</span>
                    <span>{MONTH_NAMES[date.getMonth()].slice(0, 3).toUpperCase()}</span>
                  </span>
                  <span className="session-info">
                    <span className="session-team">{s.team}</span>
                    <span className="session-theme">{s.theme}</span>
                    <span className="session-extra">
                      {exerciseCount(exercises.length)}
                      {isPast && s.attendance !== undefined && ` · ${s.attendance}/${SQUAD_SIZE} aanwezig`}
                    </span>
                  </span>
                  <span className="session-build">
                    <span className="session-bar">
                      <BlockBar duration={s.duration} colors={BLOCK_COLOR} />
                    </span>
                    <span>
                      <strong>{s.duration} min</strong> · {targets.wu} · {targets.kern} · {targets.pv}
                    </span>
                  </span>
                  <span className="session-thumbs">
                    {thumbs.map(([, ex], i) => (
                      <span key={i} className="session-thumb">
                        <Pitch variant={EXERCISE_BY_ID[ex].variant} />
                      </span>
                    ))}
                    {exercises.length > 3 && (
                      <span className="session-thumb session-more" aria-label={`${exercises.length - 2} oefeningen meer`}>
                        +{exercises.length - 2}
                      </span>
                    )}
                  </span>
                  <ChevronRightIcon size={20} className="session-chevron" />
                </Link>
              );
            })}
          </div>
        </section>

        <aside>
          <section className="card-section">
            <div>
              <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
                Start vanuit sjabloon
              </h2>
              <span className="template-sub">Blokken en tijden staan al klaar.</span>
            </div>
            {TEMPLATES.map((t) => {
              const targets = BLOCK_TARGETS[t.duration];
              return (
                <button key={t.duration} type="button" className="template" onClick={() => startNew(t.duration)}>
                  <span className="template-duration">{t.duration}′</span>
                  <span className="template-text">
                    <strong>{t.name}</strong>
                    <span>
                      {targets.wu}′ warming-up · {targets.kern}′ kern · {targets.pv}′ partijvorm
                    </span>
                  </span>
                </button>
              );
            })}
          </section>
        </aside>
      </div>
    </div>
  );
}

function NextTraining({ session: s, today }: { session: Session; today: string }) {
  const exercises = exercisesOf(s);
  const hasMore = exercises.length > 4;
  const shown = exercises.slice(0, hasMore ? 3 : 4);
  const rest = exercises.slice(3);
  const title = formatTrainingDate(s.date);

  return (
    <section aria-label="Volgende training" className="next-training">
      <div className="next-intro">
        <span className="next-kicker">
          <span className="next-dot" />
          Volgende training · {relativeDay(s.date, today)}
        </span>
        <span className="next-title">{title[0].toUpperCase() + title.slice(1)}</span>
        <span className="next-pills">
          <span className="next-pill next-pill-team">
            <PlayersIcon size={14} strokeWidth={2.2} />
            {s.team}
          </span>
          <span className="next-pill">Thema: {s.theme}</span>
        </span>
      </div>
      <div className="next-exercises">
        <div className="next-exercise-grid">
          {shown.map(([block, ex, min], i) => (
            <div key={i} className="next-exercise">
              <div className="next-thumb">
                <Pitch variant={EXERCISE_BY_ID[ex].variant} />
              </div>
              <span className="next-exercise-text">
                <span className="next-block" style={{ color: block === 'wu' ? '#F2C07A' : '#CDBEF5' }}>
                  {BLOCK_NAME[block]} · {min}′
                </span>
                <span className="next-exercise-title">{EXERCISE_BY_ID[ex].title}</span>
              </span>
            </div>
          ))}
          {hasMore && (
            <Link to={trainingPath(s.id)} className="next-exercise" aria-label={`${rest.length} oefeningen meer`}>
              <span className="next-thumb next-more">
                <span className="next-more-num">+{rest.length}</span>
                <span>meer</span>
              </span>
              <span className="next-exercise-text">
                <span className="next-block" style={{ color: '#CDBEF5' }}>
                  {rest.reduce((sum, [, , min]) => sum + min, 0)}′ samen
                </span>
                <span className="next-exercise-title">Bekijk alle oefeningen</span>
              </span>
            </Link>
          )}
        </div>
        <div className="next-bar">
          <BlockBar duration={s.duration} colors={DARK_BLOCK_COLOR} />
        </div>
      </div>
      <div className="next-cta">
        <Link to={trainingPath(s.id)} className="next-open">
          Bekijk training
          <ArrowRightIcon />
        </Link>
        <span>
          {s.duration} min · {exerciseCount(exercises.length)}
        </span>
      </div>
    </section>
  );
}

function ThemeFilter({
  theme,
  setTheme,
  sessions,
}: {
  theme: Theme | 'Alle';
  setTheme: (t: Theme | 'Alle') => void;
  sessions: Session[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef(() => setOpen(false)).current;
  useDismiss(open, close, wrap, trigger);

  const q = query.trim().toLowerCase();
  const options = (['Alle', ...THEMES] as const).filter((t) => (q ? t !== 'Alle' && t.toLowerCase().includes(q) : true));

  return (
    <div className="theme-filter" ref={wrap}>
      <button
        ref={trigger}
        type="button"
        className={`theme-filter-btn${theme !== 'Alle' ? ' is-set' : ''}`}
        onClick={() => {
          setOpen(!open);
          setQuery('');
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="theme-filter-label">
          <TagIcon size={13} />
          <span className="muted">Thema</span>
          <strong>{theme === 'Alle' ? "Alle thema's" : theme}</strong>
        </span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="theme-filter-panel">
          <label className="search theme-filter-search">
            <SearchIcon size={16} />
            <input
              type="search"
              aria-label="Zoek een thema"
              placeholder="Zoek een thema"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
              autoFocus
            />
          </label>
          <div role="listbox" aria-label="Thema" className="theme-filter-options">
            {options.map((t) => {
              const count = sessions.filter((s) => t === 'Alle' || s.theme === t).length;
              return (
                <button
                  key={t}
                  type="button"
                  role="option"
                  aria-selected={theme === t}
                  className={`theme-option${count === 0 ? ' is-empty' : ''}`}
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                >
                  <span>{t === 'Alle' ? "Alle thema's" : t}</span>
                  <span className="count-badge">{count}</span>
                </button>
              );
            })}
            {options.length === 0 && <span className="theme-filter-none">Geen thema gevonden.</span>}
          </div>
        </div>
      )}
    </div>
  );
}

