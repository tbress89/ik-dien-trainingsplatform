import { useEffect, useRef, useState } from 'react';
import { loadExerciseDetails } from '../data/exercises';
import type { SharedTraining } from '../data/share';
import { supabase } from '../data/supabase';
import { createWatchCode, watchPayload, type WatchCode } from '../data/watch';
import { CloseIcon, WatchIcon } from './icons';

type State = { kind: 'loading' } | { kind: 'ready'; code: WatchCode } | { kind: 'error' };

/** 754000 ms → "12:34" */
const minutesLeft = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * "Naar horloge" in Training geven: puts the training on the Apple Watch with a 4-digit code that the
 * coach types in the Ik Dien app on the watch (see data/watch.ts). Hidden when Supabase isn't configured.
 */
export function WatchHandoff({ training }: { training: SharedTraining }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [now, setNow] = useState(Date.now);
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef(0);

  const fetchCode = async () => {
    const id = ++request.current;
    setState({ kind: 'loading' });
    try {
      const details = await loadExerciseDetails().catch(() => null);
      const code = await createWatchCode(watchPayload(training, details));
      if (id === request.current) setState({ kind: 'ready', code });
    } catch {
      if (id === request.current) setState({ kind: 'error' });
    }
  };

  const show = () => {
    setOpen(true);
    fetchCode();
  };
  const close = () => {
    request.current++;
    setOpen(false);
  };

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // The countdown of the code's validity.
  const ready = state.kind === 'ready';
  useEffect(() => {
    if (!open || !ready) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open, ready]);

  if (!supabase) return null;

  const expired = state.kind === 'ready' && now >= state.code.expiresAt;

  return (
    <>
      <button type="button" className="pm-watch" onClick={show}>
        <WatchIcon size={18} />
        <span className="pm-watch-label">Naar horloge</span>
      </button>
      <dialog
        ref={dialog}
        className="confirm-dialog watch-dialog"
        aria-labelledby="watch-title"
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) close();
        }}
      >
        <div className="confirm-body">
          <div className="watch-dialog-head">
            <h2 id="watch-title" className="confirm-title">
              Naar horloge
            </h2>
            <button type="button" className="watch-dialog-close" onClick={close} aria-label="Sluiten">
              <CloseIcon size={18} />
            </button>
          </div>

          {state.kind === 'loading' && <p className="confirm-text">Code aanmaken…</p>}

          {state.kind === 'error' && (
            <>
              <p className="confirm-text">De code kon niet aangemaakt worden. Controleer je internetverbinding en probeer opnieuw.</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-primary" onClick={fetchCode}>
                  Opnieuw
                </button>
              </div>
            </>
          )}

          {state.kind === 'ready' && !expired && (
            <>
              <p className="confirm-text">Open Ik Dien op je Apple Watch, tik op Code en typ:</p>
              <p className="watch-code" aria-label={`Code ${state.code.code.split('').join(' ')}`}>
                {state.code.code.split('').map((digit, i) => (
                  <span key={i}>{digit}</span>
                ))}
              </p>
              <p className="watch-valid" aria-live="off">
                Nog {minutesLeft(state.code.expiresAt - now)} geldig · werkt één keer
              </p>
            </>
          )}

          {expired && (
            <>
              <p className="confirm-text">Deze code is verlopen.</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-primary" onClick={fetchCode}>
                  Nieuwe code
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
