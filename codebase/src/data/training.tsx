import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { EXERCISE_BY_ID } from './exercises';

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

const TRAINING_DATE = 'Ma 29 september';
const TRAINING_TEAM = 'U11 Rangers';

export const TRAINING_INFO = {
  title: `${TRAINING_DATE[0].toUpperCase()}${TRAINING_DATE.slice(1)} · ${TRAINING_TEAM}`,
  label: `${TRAINING_DATE} · ${TRAINING_TEAM}`,
  theme: 'Thema: omschakelen',
};

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
    () => ({ plan, duration, setDuration, activeBlock, setActiveBlock, addExercise, removeItem, changeMinutes, moveItem, favs, toggleFav }),
    [plan, duration, activeBlock, addExercise, removeItem, changeMinutes, moveItem, favs, toggleFav],
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used inside <TrainingProvider>');
  return ctx;
}
