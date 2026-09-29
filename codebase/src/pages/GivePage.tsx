import { useMemo } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { PitchMode } from '../components/PitchMode';
import { SHARE_PARAM, decodeTraining } from '../data/share';
import { trainingPath, useTraining } from '../data/training';

/**
 * "Training geven" for a training of your own (`/trainingen/<id>/geven`, also the unsaved one in the
 * builder) or a shared link (`/gedeeld/geven?training=…`).
 */
export function GivePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const code = params.get(SHARE_PARAM);
  const { sessions, draftId, date, team, theme, duration, plan } = useTraining();
  const shared = useMemo(() => (code ? decodeTraining(code) : null), [code]);

  if (id === undefined) {
    if (!shared) return <Navigate to="/" replace />;
    return <PitchMode training={shared} backTo={`/gedeeld?${SHARE_PARAM}=${code}`} />;
  }
  // The training open in the builder (possibly unsaved), or a saved one by its id.
  const training = id === (draftId ?? 'nieuw') ? { date, team, theme, duration, plan } : sessions.find((s) => s.id === id);
  if (!training) return <Navigate to="/trainingen" replace />;
  return <PitchMode training={training} backTo={trainingPath(id === 'nieuw' ? null : id)} />;
}
