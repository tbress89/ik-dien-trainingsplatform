import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon } from '../components/icons';
import { TrainingSheet } from '../components/TrainingSheet';
import { BLOCKS, trainingPath, useTraining } from '../data/training';

/**
 * Print view of a training: a preview of the A4 sheet with a print button. Printing (or "Save as PDF")
 * leaves only the sheet.
 */
export function PrintPage() {
  const { id = 'nieuw' } = useParams();
  const { sessions, draftId, date, team, theme, duration, plan } = useTraining();

  // The training open in the builder (possibly unsaved), or a saved one by its id.
  const training = id === (draftId ?? 'nieuw') ? { date, team, theme, duration, plan } : sessions.find((s) => s.id === id);
  if (!training) return <Navigate to="/trainingen" replace />;
  const empty = BLOCKS.every((b) => training.plan[b.id].length === 0);

  return (
    <div className="print-page">
      <div className="print-toolbar">
        <Link to={trainingPath(id === 'nieuw' ? null : id)} className="btn">
          <ArrowLeftIcon />
          Terug naar de training
        </Link>
        <span className="print-toolbar-hint">Tip: kies "Opslaan als PDF" als printer om de training te delen.</span>
        <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={empty}>
          <PrinterIcon />
          Afdrukken
        </button>
      </div>
      <TrainingSheet training={training} />
    </div>
  );
}
