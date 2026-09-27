import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A modal confirmation built on the native <dialog>, which traps focus and closes on Escape.
 * Clicking the backdrop cancels too.
 */
export function ConfirmDialog({ open, title, text, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-text"
      onCancel={(ev) => {
        ev.preventDefault();
        onCancel();
      }}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onCancel();
      }}
    >
      <div className="confirm-body">
        <h2 id="confirm-title" className="confirm-title">
          {title}
        </h2>
        <p id="confirm-text" className="confirm-text">
          {text}
        </p>
        <div className="confirm-actions">
          <button type="button" className="btn" onClick={onCancel} autoFocus>
            Annuleren
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
