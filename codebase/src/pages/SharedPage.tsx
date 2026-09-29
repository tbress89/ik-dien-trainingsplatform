import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, PrinterIcon } from '../components/icons';
import { TrainingSheet } from '../components/TrainingSheet';
import { SHARE_PARAM, decodeTraining } from '../data/share';
import { BLOCKS, trainingPath, useTraining } from '../data/training';
import { TRAINING_BUILDER } from '../features';

/**
 * A training someone shared by link: shown as the A4 sheet, ready to print, with the option to open it in
 * the builder and save it as your own.
 */
export function SharedPage() {
  const [params] = useSearchParams();
  const code = params.get(SHARE_PARAM) ?? '';
  const training = useMemo(() => decodeTraining(code), [code]);
  const { newTrainingFromShared } = useTraining();
  const navigate = useNavigate();

  if (!training) {
    return (
      <div className="not-found">
        <span className="empty-title">Deze link werkt niet</span>
        <p className="shared-invalid">De gedeelde training kon niet gelezen worden. Vraag de afzender om de link opnieuw te sturen.</p>
        <Link to="/" className="btn btn-primary">
          Naar de oefeningen
        </Link>
      </div>
    );
  }

  const count = BLOCKS.reduce((s, b) => s + training.plan[b.id].length, 0);

  return (
    <div className="print-page">
      <div className="print-toolbar">
        <div className="shared-intro">
          <span className="eyebrow">Gedeelde training</span>
          <span>
            {count} {count === 1 ? 'oefening' : 'oefeningen'}. Druk af, of open de training om ze aan te passen en op te slaan bij je eigen
            trainingen.
          </span>
        </div>
        <button type="button" className="btn" onClick={() => window.print()} disabled={count === 0}>
          <PrinterIcon />
          Afdrukken
        </button>
        {TRAINING_BUILDER && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              newTrainingFromShared(training);
              navigate(trainingPath(null));
            }}
          >
            Openen in de builder
            <ArrowRightIcon />
          </button>
        )}
      </div>
      <TrainingSheet training={training} />
    </div>
  );
}
