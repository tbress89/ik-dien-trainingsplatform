import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { EXERCISE_BY_ID, type Theme } from './exercises';
import { SESSIONS, type Session } from './sessions';

export type BlockId = 'wu' | 'kern' | 'pv';

export interface Block {
  id: BlockId;
  name: string;
  color: string;
}

export const BLOCKS: Block[] = [
  { id: 'wu', name: 'Warming-up', color: '#F2A541' },
  { id: 'kern', name: 'Kern', color: '#5B2BC4' },
  { id: 'pv', name: 'Partijvorm', color: '#2A1464' },
];

export const DURATIONS = [60, 75, 90] as const;
export type Duration = (typeof DURATIONS)[number];

/** Target minutes per block; each set adds up to its duration. */
export const BLOCK_TARGETS: Record<Duration, Record<BlockId, number>> = {
  60: { wu: 10, kern: 30, pv: 20 },
  75: { wu: 15, kern: 40, pv: 20 },
  90: { wu: 15, kern: 50, pv: 25 },
};

const DAY_NAMES = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
export const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

/** The team's regular training weekdays (0 = Sunday), highlighted in the date picker. */
export const TRAINING_WEEKDAYS = [2, 4];

export const DEFAULT_TEAM = 'U11 Rangers';

/** "2026-09-29" → Date at local midnight. */
export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** "2026-09-29" → "dinsdag 29 september". */
export function formatTrainingDate(iso: string): string {
  const date = parseISODate(iso);
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

export interface PlanItem {
  uid: string;
  ex: string;
  min: number;
}

export type Plan = Record<BlockId, PlanItem[]>;

export const clampMinutes = (m: number) => Math.max(5, Math.min(45, m));

export const todayISO = () => toISODate(new Date());

/** A training being edited in the builder; `id` is null until it's saved for the first time. */
export interface Training {
  id: string | null;
  date: string;
  team: string;
  theme: Theme;
  duration: Duration;
  plan: Plan;
  attendance?: number;
}

/** Builder URL for a training: `/trainingen/nieuw` or `/trainingen/<id>`. */
export const trainingPath = (id: string | null) => `/trainingen/${id ?? 'nieuw'}`;

const copyPlan = (p: Plan): Plan => ({ wu: [...p.wu], kern: [...p.kern], pv: [...p.pv] });

/** First regular training day from today on that doesn't have a training yet. */
function nextFreeTrainingDay(busy: string[]): string {
  const d = parseISODate(todayISO());
  for (let i = 0; i < 366; i++, d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    if (TRAINING_WEEKDAYS.includes(d.getDay()) && !busy.includes(iso)) return iso;
  }
  return todayISO();
}

interface TrainingContextValue {
  /** All planned and past trainings. */
  sessions: Session[];
  /** Id of the training open in the builder (null = new, unsaved). */
  draftId: string | null;
  /** Dates that already have another training; the date picker blocks them. */
  busyDates: string[];
  openTraining: (id: string) => void;
  newTraining: (duration?: Duration) => void;
  /** Writes the draft into `sessions` and returns its id. */
  saveTraining: () => string;
  date: string;
  setDate: (iso: string) => void;
  team: string;
  setTeam: (team: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  plan: Plan;
  duration: Duration;
  setDuration: (d: Duration) => void;
  activeBlock: BlockId;
  setActiveBlock: (id: BlockId) => void;
  addExercise: (block: BlockId, exId: string, min?: number) => void;
  removeItem: (block: BlockId, index: number) => void;
  changeMinutes: (block: BlockId, index: number, delta: number) => void;
  moveItem: (from: BlockId, index: number, to: BlockId) => void;
  favs: string[];
  toggleFav: (exId: string) => void;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  // The builder opens on the first training in the list until another one is chosen.
  const [draft, setDraft] = useState<Training>(() => ({ ...SESSIONS[0], plan: copyPlan(SESSIONS[0].plan) }));
  const [activeBlock, setActiveBlock] = useState<BlockId>('kern');
  const [favs, setFavs] = useState<string[]>(['trans']);
  const uid = useRef(10);

  const busyDates = useMemo(() => sessions.filter((s) => s.id !== draft.id).map((s) => s.date), [sessions, draft.id]);

  const update = useCallback(<K extends keyof Training>(key: K) => (value: Training[K]) => setDraft((d) => ({ ...d, [key]: value })), []);
  const setDate = useMemo(() => update('date'), [update]);
  const setTeam = useMemo(() => update('team'), [update]);
  const setTheme = useMemo(() => update('theme'), [update]);
  const setDuration = useMemo(() => update('duration'), [update]);
  const setPlan = useCallback((fn: (p: Plan) => Plan) => setDraft((d) => ({ ...d, plan: fn(d.plan) })), []);

  const openTraining = useCallback(
    (id: string) => {
      const s = sessions.find((x) => x.id === id);
      if (!s) return;
      setDraft({ ...s, plan: copyPlan(s.plan) });
      setActiveBlock('kern');
    },
    [sessions],
  );

  const newTraining = useCallback(
    (duration: Duration = 90) => {
      setDraft({
        id: null,
        date: nextFreeTrainingDay(sessions.map((s) => s.date)),
        team: DEFAULT_TEAM,
        theme: 'Omschakelen',
        duration,
        plan: { wu: [], kern: [], pv: [] },
      });
      setActiveBlock('wu');
    },
    [sessions],
  );

  const saveTraining = useCallback(() => {
    const id = draft.id ?? `t${uid.current++}`;
    const saved: Session = { ...draft, id, plan: copyPlan(draft.plan) };
    setSessions((list) => (list.some((s) => s.id === id) ? list.map((s) => (s.id === id ? saved : s)) : [...list, saved]));
    setDraft((d) => ({ ...d, id }));
    return id;
  }, [draft]);

  const addExercise = useCallback((block: BlockId, exId: string, min?: number) => {
    const item = { uid: `n${uid.current++}`, ex: exId, min: min ?? EXERCISE_BY_ID[exId].min };
    setPlan((p) => ({ ...p, [block]: [...p[block], item] }));
    setActiveBlock(block);
  }, []);

  const removeItem = useCallback((block: BlockId, index: number) => {
    setPlan((p) => ({ ...p, [block]: p[block].filter((_, i) => i !== index) }));
  }, []);

  const changeMinutes = useCallback((block: BlockId, index: number, delta: number) => {
    setPlan((p) => ({
      ...p,
      [block]: p[block].map((it, i) => (i === index ? { ...it, min: clampMinutes(it.min + delta) } : it)),
    }));
  }, []);

  const moveItem = useCallback((from: BlockId, index: number, to: BlockId) => {
    setPlan((p) => {
      const moved = p[from][index];
      if (!moved) return p;
      const next = { ...p, [from]: p[from].filter((_, i) => i !== index) };
      next[to] = [...next[to], moved];
      return next;
    });
    setActiveBlock(to);
  }, []);

  const toggleFav = useCallback((exId: string) => {
    setFavs((f) => (f.includes(exId) ? f.filter((x) => x !== exId) : [...f, exId]));
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      draftId: draft.id,
      busyDates,
      openTraining,
      newTraining,
      saveTraining,
      date: draft.date,
      setDate,
      team: draft.team,
      setTeam,
      theme: draft.theme,
      setTheme,
      plan: draft.plan,
      duration: draft.duration,
      setDuration,
      activeBlock,
      setActiveBlock,
      addExercise,
      removeItem,
      changeMinutes,
      moveItem,
      favs,
      toggleFav,
    }),
    [sessions, draft, busyDates, openTraining, newTraining, saveTraining, setDate, setTeam, setTheme, setDuration, activeBlock, addExercise, removeItem, changeMinutes, moveItem, favs, toggleFav],
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used inside <TrainingProvider>');
  return ctx;
}
