import { useState, type FormEvent } from 'react';
import { FEEDBACK_KINDS, MAX_FEEDBACK_LENGTH, feedbackRow, sendFeedback, type FeedbackKind } from '../data/feedback';
import { supabase } from '../data/supabase';
import { CheckIcon } from './icons';

/**
 * "Opmerking of fout melden" on an exercise page: a short anonymous form, stored in the `feedback` table.
 * Hidden when Supabase isn't configured, like the account UI.
 */
export function FeedbackForm({ exerciseId, version }: { exerciseId: string; version: string | null }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabase) return null;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const row = feedbackRow(exerciseId, version, kind, message);
    if (!row) return;
    setBusy(true);
    setError(null);
    try {
      await sendFeedback(row);
      setSent(true);
      setOpen(false);
      setKind(null);
      setMessage('');
    } catch (e) {
      console.warn('Melding versturen mislukt', e);
      setError('Je melding kon niet verstuurd worden. Controleer je verbinding en probeer het opnieuw.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-section feedback">
      <h2 className="panel-title" style={{ letterSpacing: '0.02em' }}>
        Opmerking of fout melden
      </h2>
      {sent && !open && (
        <p className="feedback-sent" role="status">
          <CheckIcon size={18} />
          Bedankt! We bekijken je melding.
        </p>
      )}
      {!open ? (
        <>
          <p className="feedback-note">Klopt er iets niet in de tekening of de uitleg, of heb je een idee? Laat het ons weten.</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setOpen(true);
              setSent(false);
            }}
          >
            {sent ? 'Nog iets melden' : 'Melding maken'}
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <div role="group" aria-label="Soort melding (optioneel)" className="chip-wrap">
            {FEEDBACK_KINDS.map((k) => (
              <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} onClick={() => setKind(kind === k.id ? null : k.id)}>
                {k.label}
              </button>
            ))}
          </div>
          <label className="account-label" htmlFor="feedback-message">
            Wat wil je melden?
          </label>
          <textarea
            id="feedback-message"
            className="feedback-input"
            required
            rows={4}
            maxLength={MAX_FEEDBACK_LENGTH}
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            placeholder={version ? `Bijvoorbeeld: in variant ${version} staat de verdediger verkeerd.` : 'Bijvoorbeeld: de pijl van de pass wijst de verkeerde kant op.'}
          />
          <div className="account-actions">
            <button type="submit" className="btn btn-primary" disabled={busy || !message.trim()}>
              {busy ? 'Bezig met versturen…' : 'Versturen'}
            </button>
            <button type="button" className="btn" disabled={busy} onClick={() => setOpen(false)}>
              Annuleren
            </button>
          </div>
          <p className="account-note">Je melding is anoniem. Wil je een antwoord, zet dan je naam of e-mailadres in je bericht.</p>
        </form>
      )}
      {error && (
        <p className="account-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
