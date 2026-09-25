import { useEffect, type RefObject } from 'react';

/** Closes a popover on Escape or a click outside `ref`, returning focus to its trigger on Escape. */
export function useDismiss(open: boolean, close: () => void, ref: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (ev: MouseEvent) => {
      if (!ref.current?.contains(ev.target as Node)) close();
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        close();
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref, trigger]);
}
