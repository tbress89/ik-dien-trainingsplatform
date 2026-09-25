import type { Theme } from './exercises';
import type { BlockId, Duration, Plan } from './training';

export interface Session {
  id: string;
  /** ISO date, e.g. "2026-09-29". */
  date: string;
  team: string;
  theme: Theme;
  duration: Duration;
  plan: Plan;
  /** Players present, for trainings that already took place. */
  attendance?: number;
}

/** Squad size used for attendance ("15/16 aanwezig"). */
export const SQUAD_SIZE = 16;

function plan(id: string, items: [BlockId, string, number][]): Plan {
  const p: Plan = { wu: [], kern: [], pv: [] };
  items.forEach(([block, ex, min], i) => p[block].push({ uid: `${id}-${i}`, ex, min }));
  return p;
}

export const SESSIONS: Session[] = [
  {
    id: 's1', date: '2026-09-29', team: 'U11 Rangers', theme: 'Omschakelen', duration: 90,
    plan: plan('s1', [['wu', 'rondo', 5], ['wu', 'pass', 10], ['kern', 'trans', 20], ['kern', 'fin', 15], ['kern', 'duel', 15], ['pv', 'game', 25]]),
  },
  {
    id: 's2', date: '2026-10-01', team: 'U17 Lazio', theme: 'Opbouw van achteruit', duration: 75,
    plan: plan('s2', [['wu', 'pass', 12], ['kern', 'pos', 20], ['pv', 'game5', 20]]),
  },
  {
    id: 's3', date: '2026-10-06', team: 'U11 Rangers', theme: 'Afwerken', duration: 90,
    plan: plan('s3', [['wu', 'coord', 10], ['wu', 'rondo', 5], ['kern', 'fin', 15], ['kern', 'duel', 15], ['kern', 'pos', 20], ['pv', 'game', 25]]),
  },
  {
    id: 's4', date: '2026-10-08', team: 'U17 Lazio', theme: 'Druk zetten', duration: 60,
    plan: plan('s4', [['wu', 'rondo', 5], ['kern', 'press', 18]]),
  },
  {
    id: 'p1', date: '2026-09-22', team: 'U11 Rangers', theme: 'Druk zetten', duration: 90, attendance: 15,
    plan: plan('p1', [['wu', 'rondo', 5], ['kern', 'press', 18], ['kern', 'pos', 20], ['pv', 'game', 25]]),
  },
  {
    id: 'p2', date: '2026-09-17', team: 'U17 Lazio', theme: 'Omschakelen', duration: 75, attendance: 14,
    plan: plan('p2', [['wu', 'pass', 12], ['kern', 'trans', 20], ['pv', 'game5', 20]]),
  },
  {
    id: 'p3', date: '2026-09-15', team: 'U11 Rangers', theme: 'Dribbelen', duration: 90, attendance: 16,
    plan: plan('p3', [['wu', 'coord', 10], ['kern', 'fin', 15], ['kern', 'duel', 12], ['pv', 'game', 25]]),
  },
  {
    id: 'p4', date: '2026-09-10', team: 'U17 Lazio', theme: 'Positiespel', duration: 60, attendance: 13,
    plan: plan('p4', [['wu', 'rondo', 5], ['kern', 'pos', 20], ['pv', 'game5', 20]]),
  },
];
