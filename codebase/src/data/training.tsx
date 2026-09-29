import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { EXERCISE_BY_ID, THEMES, type Theme } from './exercises';
import type { ReferenceTraining } from './referenceTrainings';

export type BlockId = 'wu' | 'kern' | 'pv';

export interface Block {
  id: BlockId;
  name: string;
  color: string;
}

/** Block colours are CSS tokens (see styles.css), so they adapt to dark mode. */
export const BLOCKS: Block[] = [
  { id: 'wu', name: 'Warming-up', color: 'var(--block-wu)' },
  { id: 'kern', name: 'Kern', color: 'var(--block-kern)' },
  { id: 'pv', name: 'Partijvorm', color: 'var(--block-pv)' },
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

/** A saved training. */
export interface Session {
  id: string;
  /** ISO date, e.g. "2026-09-29". */
  date: string;
  team: string;
  theme: Theme;
  duration: Duration;
  plan: Plan;
  /** When the training was last saved (ms since epoch); a new training takes the team of the latest one. */
  savedAt: number;
}

/** A training being edited in the builder; `id` is null until it's saved for the first time. */
export type Training = Omit<Session, 'id' | 'savedAt'> & { id: string | null };

/** The team of the most recently saved training, or '' when there are no saved trainings yet. */
export function lastTeam(trainings: Session[]): string {
  let latest: Session | undefined;
  for (const t of trainings) if (!latest || t.savedAt >= latest.savedAt) latest = t;
  return latest?.team ?? '';
}

/** Builder URL for a training: `/trainingen/nieuw` or `/trainingen/<id>`. */
export const trainingPath = (id: string | null) => `/trainingen/${id ?? 'nieuw'}`;

const copyPlan = (p: Plan): Plan => ({ wu: [...p.wu], kern: [...p.kern], pv: [...p.pv] });

/** Unique id that stays unique across page loads (trainings and plan items are stored). */
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

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
  /** Starts a new, unsaved training with the plan, theme and duration of a reference training. */
  newTrainingFrom: (ref: ReferenceTraining) => void;
  /** Writes the draft into `sessions` and returns its id. */
  saveTraining: () => string;
  /** Removes a saved training; if it's open in the builder, the builder starts a new one. */
  deleteTraining: (id: string) => void;
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

/** Saved ("bewaarde") exercises are remembered in this browser only; there are no accounts yet. */
const FAVS_KEY = 'ikdien:bewaard';

function loadFavs(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(FAVS_KEY) ?? '[]');
    // Drop ids of exercises that no longer exist.
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string' && id in EXERCISE_BY_ID) : [];
  } catch {
    return [];
  }
}

function storeFavs(favs: string[]) {
  try {
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  } catch {
    // Storage unavailable (private mode, blocked site data): saving still works until the page is closed.
  }
}

/**
 * Saved trainings are kept in this browser only (there are no accounts yet), like the saved exercises.
 * Stored data is validated on load, so a malformed entry or an exercise that no longer exists can't break the pages.
 */
const TRAININGS_KEY = 'ikdien:trainingen';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function readPlan(raw: unknown): Plan {
  const plan: Plan = { wu: [], kern: [], pv: [] };
  if (!isRecord(raw)) return plan;
  for (const b of BLOCKS) {
    const items = raw[b.id];
    if (!Array.isArray(items)) continue;
    for (const it of items) {
      if (!isRecord(it) || typeof it.ex !== 'string' || !(it.ex in EXERCISE_BY_ID)) continue;
      const min = typeof it.min === 'number' && Number.isFinite(it.min) ? clampMinutes(Math.round(it.min / 5) * 5) : EXERCISE_BY_ID[it.ex].min;
      plan[b.id].push({ uid: typeof it.uid === 'string' ? it.uid : newId('i'), ex: it.ex, min });
    }
  }
  return plan;
}

function loadTrainings(): Session[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(TRAININGS_KEY) ?? '[]');
    if (!Array.isArray(stored)) return [];
    const trainings: Session[] = [];
    for (const t of stored) {
      if (!isRecord(t) || typeof t.id !== 'string' || typeof t.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) continue;
      if (trainings.some((x) => x.id === t.id)) continue;
      trainings.push({
        id: t.id,
        date: t.date,
        team: typeof t.team === 'string' ? t.team.trim() : '',
        theme: (THEMES as readonly unknown[]).includes(t.theme) ? (t.theme as Theme) : THEMES[0],
        duration: (DURATIONS as readonly unknown[]).includes(t.duration) ? (t.duration as Duration) : 90,
        plan: readPlan(t.plan),
        savedAt: typeof t.savedAt === 'number' && Number.isFinite(t.savedAt) ? t.savedAt : 0,
      });
    }
    return trainings;
  } catch {
    return [];
  }
}

function storeTrainings(trainings: Session[]) {
  try {
    localStorage.setItem(TRAININGS_KEY, JSON.stringify(trainings));
  } catch {
    // Storage unavailable (private mode, blocked site data): trainings still work until the page is closed.
  }
}

const emptyTraining = (trainings: Session[], duration: Duration = 90): Training => ({
  id: null,
  date: nextFreeTrainingDay(trainings.map((s) => s.date)),
  team: lastTeam(trainings),
  theme: 'Omschakelen',
  duration,
  plan: { wu: [], kern: [], pv: [] },
});

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(loadTrainings);
  // The builder opens on a new, empty training until an existing one is chosen.
  const [draft, setDraft] = useState<Training>(() => emptyTraining(sessions));
  const [activeBlock, setActiveBlock] = useState<BlockId>('wu');
  const [favs, setFavs] = useState<string[]>(loadFavs);

  // Persist every change, and pick up changes made in another tab.
  const skipStore = useRef(true);
  useEffect(() => {
    if (skipStore.current) {
      skipStore.current = false;
      return;
    }
    storeTrainings(sessions);
  }, [sessions]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TRAININGS_KEY) setSessions(loadTrainings());
      if (e.key === FAVS_KEY) setFavs(loadFavs());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
      setDraft(emptyTraining(sessions, duration));
      setActiveBlock('wu');
    },
    [sessions],
  );

  const newTrainingFrom = useCallback(
    (ref: ReferenceTraining) => {
      const plan: Plan = { wu: [], kern: [], pv: [] };
      ref.items.forEach(([block, ex, min]) => {
        if (ex in EXERCISE_BY_ID) plan[block].push({ uid: newId('i'), ex, min });
      });
      setDraft({ ...emptyTraining(sessions, ref.duration), theme: ref.theme, plan });
      setActiveBlock('wu');
    },
    [sessions],
  );

  const saveTraining = useCallback(() => {
    const id = draft.id ?? newId('t');
    const saved: Session = { ...draft, id, team: draft.team.trim(), plan: copyPlan(draft.plan), savedAt: Date.now() };
    setSessions((list) => (list.some((s) => s.id === id) ? list.map((s) => (s.id === id ? saved : s)) : [...list, saved]));
    setDraft((d) => ({ ...d, id }));
    return id;
  }, [draft]);

  const deleteTraining = useCallback(
    (id: string) => {
      const rest = sessions.filter((s) => s.id !== id);
      setSessions(rest);
      setDraft((d) => (d.id === id ? emptyTraining(rest) : d));
    },
    [sessions],
  );

  const addExercise = useCallback((block: BlockId, exId: string, min?: number) => {
    const item = { uid: newId('i'), ex: exId, min: min ?? EXERCISE_BY_ID[exId].min };
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

  useEffect(() => storeFavs(favs), [favs]);

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
      newTrainingFrom,
      saveTraining,
      deleteTraining,
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
    [sessions, draft, busyDates, openTraining, newTraining, newTrainingFrom, saveTraining, deleteTraining, setDate, setTeam, setTheme, setDuration, activeBlock, addExercise, removeItem, changeMinutes, moveItem, favs, toggleFav],
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used inside <TrainingProvider>');
  return ctx;
}
