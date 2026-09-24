import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { EXERCISE_BY_ID, type Theme } from './exercises';

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

/** Dates that already have a training planned; they can't be picked. */
export const BUSY_DATES = ['2026-09-10', '2026-09-15', '2026-09-17', '2026-09-22', '2026-10-01', '2026-10-06', '2026-10-08'];

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

const INITIAL_PLAN: Plan = {
  wu: [{ uid: 'a1', ex: 'rondo', min: 5 }],
  kern: [{ uid: 'a2', ex: 'trans', min: 20 }],
  pv: [{ uid: 'a3', ex: 'game', min: 25 }],
};

export const clampMinutes = (m: number) => Math.max(5, Math.min(45, m));

interface TrainingContextValue {
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
  const [date, setDate] = useState('2026-09-29');
  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [theme, setTheme] = useState<Theme>('Omschakelen');
  const [plan, setPlan] = useState<Plan>(INITIAL_PLAN);
  const [duration, setDuration] = useState<Duration>(90);
  const [activeBlock, setActiveBlock] = useState<BlockId>('kern');
  const [favs, setFavs] = useState<string[]>(['trans']);
  const uid = useRef(10);

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
    () => ({ date, setDate, team, setTeam, theme, setTheme, plan, duration, setDuration, activeBlock, setActiveBlock, addExercise, removeItem, changeMinutes, moveItem, favs, toggleFav }),
    [date, team, theme, plan, duration, activeBlock, addExercise, removeItem, changeMinutes, moveItem, favs, toggleFav],
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used inside <TrainingProvider>');
  return ctx;
}
