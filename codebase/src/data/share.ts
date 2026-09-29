import { EXERCISE_BY_ID, THEMES, type Theme } from './exercises';
import { BLOCKS, DURATIONS, clampMinutes, type Duration, type Plan } from './training';

/**
 * "Share by link": a training travels inside the link itself, so there is no server or account involved.
 * The link points at the home page (`/?training=<code>`), which the app forwards to the shared-training page.
 *
 * The code is base64url of a compact JSON array:
 * [version, date, team, theme, duration, warming-up items, kern items, partijvorm items], each item [exercise id, minutes].
 */
const VERSION = 1;
export const SHARE_PARAM = 'training';

/** What a shared link carries: a training without its local id. */
export interface SharedTraining {
  date: string;
  team: string;
  theme: Theme;
  duration: Duration;
  plan: Plan;
}

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (code: string) => {
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

export function encodeTraining(t: SharedTraining): string {
  const blocks = BLOCKS.map((b) => t.plan[b.id].map((it) => [it.ex, it.min]));
  return toBase64Url(JSON.stringify([VERSION, t.date, t.team.trim().slice(0, 60), t.theme, t.duration, ...blocks]));
}

/** Full link to share, e.g. https://trainingen.ikdien.be/?training=… */
export const shareUrl = (t: SharedTraining) => `${window.location.origin}${import.meta.env.BASE_URL}?${SHARE_PARAM}=${encodeTraining(t)}`;

let uid = 0;

/**
 * Reads a shared code, or returns null when it isn't a valid link. Like saved trainings, the content is
 * checked: exercises that no longer exist are dropped and minutes are rounded to 5 within the allowed range.
 */
export function decodeTraining(code: string): SharedTraining | null {
  let data: unknown;
  try {
    data = JSON.parse(fromBase64Url(code));
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data[0] !== VERSION) return null;
  const [, date, team, theme, duration, ...blocks] = data;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const plan: Plan = { wu: [], kern: [], pv: [] };
  BLOCKS.forEach((b, i) => {
    const items: unknown = blocks[i];
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (!Array.isArray(item)) continue;
      const [ex, min] = item;
      if (typeof ex !== 'string' || !(ex in EXERCISE_BY_ID)) continue;
      const minutes = typeof min === 'number' && Number.isFinite(min) ? clampMinutes(Math.round(min / 5) * 5) : EXERCISE_BY_ID[ex].min;
      plan[b.id].push({ uid: `s${uid++}`, ex, min: minutes });
    }
  });
  return {
    date,
    team: typeof team === 'string' ? team.trim().slice(0, 60) : '',
    theme: (THEMES as readonly unknown[]).includes(theme) ? (theme as Theme) : THEMES[0],
    duration: (DURATIONS as readonly unknown[]).includes(duration) ? (duration as Duration) : 90,
    plan,
  };
}
