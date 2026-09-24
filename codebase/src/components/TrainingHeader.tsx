import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { EXERCISES, THEMES } from '../data/exercises';
import {
  BUSY_DATES,
  DEFAULT_TEAM,
  MONTH_NAMES,
  TRAINING_WEEKDAYS,
  formatTrainingDate,
  parseISODate,
  toISODate,
  useTraining,
} from '../data/training';
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon } from './icons';

const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

/** Closes a popover on Escape or a click outside `ref`, returning focus to its trigger on Escape. */
function useDismiss(open: boolean, close: () => void, ref: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (ev: MouseEvent) => {
      if (!ref.current?.contains(ev.target as Node)) close();
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        close();
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref, trigger]);
}

/** Breadcrumb, date + team title and theme picker at the top of the training builder. */
export function TrainingHeader() {
  const { date, team, setTeam } = useTraining();
  const title = formatTrainingDate(date);

  return (
    <div className="page-head-titles" style={{ gap: 8 }}>
      <span className="crumbs">
        <Link to="/trainingen">Trainingen</Link> <span aria-hidden="true">/</span> <strong>Nieuwe training</strong>
      </span>
      <h1 className="builder-title">
        <DatePicker label={title[0].toUpperCase() + title.slice(1)} />
        <span aria-hidden="true">·</span>
        <label className="title-team">
          <span className="visually-hidden">Team</span>
          <input
            type="text"
            value={team}
            size={Math.max(4, team.length + 1)}
            placeholder="Team"
            onChange={(ev) => setTeam(ev.target.value)}
            onBlur={() => setTeam(team.trim() || DEFAULT_TEAM)}
          />
          <span className="title-icon">
            <PencilIcon size={18} />
          </span>
        </label>
      </h1>
      <div className="pill-row">
        <ThemePicker />
      </div>
    </div>
  );
}

function DatePicker({ label }: { label: string }) {
  const { date, setDate } = useTraining();
  const [open, setOpen] = useState(false);
  const selected = parseISODate(date);
  const [view, setView] = useState({ y: selected.getFullYear(), m: selected.getMonth() });
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef(() => setOpen(false)).current;
  useDismiss(open, close, wrap, trigger);

  const toggle = () => {
    if (!open) setView({ y: selected.getFullYear(), m: selected.getMonth() });
    setOpen(!open);
  };
  const shiftMonth = (delta: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const today = toISODate(new Date());
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday-first grid
  const days = new Date(view.y, view.m + 1, 0).getDate();

  return (
    <div className="title-date" ref={wrap}>
      <button
        ref={trigger}
        type="button"
        className="title-date-btn"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Datum kiezen, nu ${label}`}
      >
        {label}
        <span className="title-icon">
          <CalendarIcon size={20} />
        </span>
      </button>
      {open && (
        <div role="dialog" aria-label="Kies de datum van de training" className="calendar">
          <div className="calendar-head">
            <button type="button" className="calendar-nav" onClick={() => shiftMonth(-1)} aria-label="Vorige maand">
              <ChevronLeftIcon />
            </button>
            <span className="calendar-month">
              {MONTH_NAMES[view.m]} {view.y}
            </span>
            <button type="button" className="calendar-nav" onClick={() => shiftMonth(1)} aria-label="Volgende maand">
              <ChevronRightIcon />
            </button>
          </div>
          <div className="calendar-grid">
            {WEEKDAYS.map((w) => (
              <span key={w} className="calendar-weekday">
                {w}
              </span>
            ))}
            {Array.from({ length: lead }, (_, i) => (
              <span key={`blank${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const day = new Date(view.y, view.m, i + 1);
              const iso = toISODate(day);
              const isSelected = iso === date;
              const isPast = iso < today;
              const isBusy = BUSY_DATES.includes(iso) && !isSelected;
              const isTrainingDay = TRAINING_WEEKDAYS.includes(day.getDay());
              const disabled = isPast || isBusy;
              const name = formatTrainingDate(iso);
              const classes = ['calendar-day'];
              if (isSelected) classes.push('is-selected');
              else if (disabled) classes.push('is-disabled');
              else if (isTrainingDay) classes.push('is-training');
              if (iso === today && !isSelected) classes.push('is-today');
              return (
                <button
                  key={iso}
                  type="button"
                  className={classes.join(' ')}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={`${name}${isBusy ? ', er staat al een training' : ''}${isPast ? ', voorbij' : ''}`}
                  title={isBusy ? 'Er staat al een training op deze dag' : isPast ? 'Deze dag is voorbij' : isTrainingDay ? 'Vaste trainingsdag' : undefined}
                  onClick={() => {
                    setDate(iso);
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                >
                  {i + 1}
                  {isBusy && <span className="calendar-busy" />}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>
              <span className="legend-training" />
              Trainingsdag
            </span>
            <span>
              <span className="legend-busy" />
              Al een training
            </span>
            <button type="button" className="calendar-done" onClick={() => setOpen(false)}>
              Klaar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTraining();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef(() => setOpen(false)).current;
  useDismiss(open, close, wrap, trigger);

  return (
    <div className="theme-picker" ref={wrap}>
      <button
        ref={trigger}
        type="button"
        className="pill pill-dark theme-picker-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        Thema: {theme}
        <ChevronDownIcon />
      </button>
      {open && (
        <div role="listbox" aria-label="Thema van de training" className="theme-list">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={t === theme}
              className="theme-option"
              onClick={() => {
                setTheme(t);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <span>{t}</span>
              <span className="theme-count">{EXERCISES.filter((e) => e.themes.includes(t)).length} oef.</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
