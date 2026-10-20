import { supabase } from './supabase';

/** The optional choice in "Opmerking of fout melden"; the ids match the check in the `feedback` table. */
export const FEEDBACK_KINDS = [
  { id: 'tekening', label: 'Fout in de tekening' },
  { id: 'uitleg', label: 'Fout in de uitleg' },
  { id: 'idee', label: 'Idee' },
  { id: 'andere', label: 'Andere' },
] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]['id'];

export const MAX_FEEDBACK_LENGTH = 2000;

export interface FeedbackRow {
  exercise_id: string;
  version: string | null;
  kind: FeedbackKind | null;
  message: string;
}

/** The row to store, or null when there's no message. */
export function feedbackRow(exerciseId: string, version: string | null, kind: FeedbackKind | null, message: string): FeedbackRow | null {
  const text = message.trim().slice(0, MAX_FEEDBACK_LENGTH);
  if (!text) return null;
  return { exercise_id: exerciseId, version, kind, message: text };
}

/** Stores a feedback row (insert only, works without an account). Throws when it fails. */
export async function sendFeedback(row: FeedbackRow) {
  if (!supabase) throw new Error('Feedback is not configured');
  // No .select(): the table is insert-only, so asking the row back would be refused.
  const { error } = await supabase.from('feedback').insert(row);
  if (error) throw new Error(error.message);
}
