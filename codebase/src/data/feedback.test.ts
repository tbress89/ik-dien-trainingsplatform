import { describe, expect, it } from 'vitest';
import { MAX_FEEDBACK_LENGTH, feedbackRow } from './feedback';
import { createCounter } from './usage';

describe('feedback rows', () => {
  it('trim the message and keep the exercise, version and kind', () => {
    expect(feedbackRow('rondo', '2. Met verdediger', 'tekening', '  Pijl wijst verkeerd  ')).toEqual({
      exercise_id: 'rondo',
      version: '2. Met verdediger',
      kind: 'tekening',
      message: 'Pijl wijst verkeerd',
    });
  });

  it('need a message', () => {
    expect(feedbackRow('rondo', null, 'idee', '   ')).toBeNull();
  });

  it('cut off overly long messages at the database limit', () => {
    expect(feedbackRow('rondo', null, null, 'x'.repeat(MAX_FEEDBACK_LENGTH + 50))?.message).toHaveLength(MAX_FEEDBACK_LENGTH);
  });
});

describe('usage counter', () => {
  it('counts each key once per page load', () => {
    const sent: string[] = [];
    const count = createCounter(async (kind, item) => {
      sent.push(`${kind}:${item}`);
    });
    count('oefening', 'rondo');
    count('oefening', 'rondo');
    count('oefening', 'fshot');
    count('geven', 'eigen', 'training-1');
    count('geven', 'eigen', 'training-1');
    count('geven', 'eigen', 'training-2');
    expect(sent).toEqual(['oefening:rondo', 'oefening:fshot', 'geven:eigen', 'geven:eigen']);
  });

  it('ignores failures', async () => {
    const count = createCounter(() => Promise.reject(new Error('offline')));
    expect(() => count('oefening', 'rondo')).not.toThrow();
  });
});
