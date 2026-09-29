import { useEffect, useState } from 'react';
import type { ANIMATIONS } from '../data/animations';
import type { DEMOS } from '../data/demos';
import { getLoadedExerciseDetails, loadExerciseDetails } from '../data/exercises';

/** The detail text for all exercises; loads its chunk on first use and re-renders when it arrives. */
export function useExerciseDetails() {
  const [details, setDetails] = useState(getLoadedExerciseDetails);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (details) return;
    let cancelled = false;
    loadExerciseDetails()
      .then((d) => !cancelled && setDetails(d))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [details]);

  return { details, failed };
}

export interface Animations {
  pitch: typeof ANIMATIONS;
  demos: typeof DEMOS;
}

let loadedAnimations: Animations | null = null;

/**
 * The diagram animations (players on the pitch) and instruction demos (body movement); like the detail
 * text they load as their own chunks, since only a few pages use them.
 */
export function useAnimations() {
  const [animations, setAnimations] = useState(loadedAnimations);

  useEffect(() => {
    if (animations) return;
    let cancelled = false;
    // If the chunk fails to load, pages simply show no "Afspelen" button.
    Promise.all([import('../data/animations'), import('../data/demos')])
      .then(([a, d]) => {
        loadedAnimations = { pitch: a.ANIMATIONS, demos: d.DEMOS };
        if (!cancelled) setAnimations(loadedAnimations);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [animations]);

  return animations;
}
