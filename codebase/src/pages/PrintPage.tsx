import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Pitch } from '../components/Pitch';
import { ArrowLeftIcon, PrinterIcon } from '../components/icons';
import { EXERCISE_BY_ID, getLoadedExerciseDetails, loadExerciseDetails, materialNames } from '../data/exercises';
import { BLOCKS, formatTrainingDate, trainingPath, useTraining, type BlockId } from '../data/training';

/**
 * A training as an A4 sheet to take to the pitch: the blocks with their minutes, and per exercise the
 * diagram, how it's set up and played, and the coaching points. On screen it shows a preview of the
 * paper with a print button; printing (or "Save as PDF") leaves only the sheet.
 */
export function PrintPage() {
  const { id = 'nieuw' } = useParams();
  const { sessions, draftId, date, team, theme, duration, plan } = useTraining();
  const [details, setDetails] = useState(getLoadedExerciseDetails);
  const [failed, setFailed] = useState(false);

  // The training open in the builder (possibly unsaved), or a saved one by its id.
  const training = id === (draftId ?? 'nieuw') ? { date, team, theme, duration, plan } : sessions.find((s) => s.id === id);

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

  // The document title becomes the suggested file name when saving as PDF.
  useEffect(() => {
    if (!training) return;
    const previous = document.title;
    document.title = `Training ${formatTrainingDate(training.date)}${training.team ? ` – ${training.team}` : ''}`;
    return () => {
      document.title = previous;
    };
  }, [training?.date, training?.team]);

  if (!training) return <Navigate to="/trainingen" replace />;

  const used = Object.fromEntries(BLOCKS.map((b) => [b.id, training.plan[b.id].reduce((s, it) => s + it.min, 0)])) as Record<
    BlockId,
    number
  >;
  const total = BLOCKS.reduce((s, b) => s + used[b.id], 0);
  const denom = Math.max(training.duration, total);
  const mats: string[] = [];
  BLOCKS.forEach((b) =>
    training.plan[b.id].forEach((it) => materialNames(EXERCISE_BY_ID[it.ex]).forEach((m) => !mats.includes(m) && mats.push(m))),
  );
  const empty = total === 0;
  // Minute marks: each exercise starts where the previous one ended.
  let clock = 0;

  return (
    <div className="print-page">
      <div className="print-toolbar">
        <Link to={trainingPath(id === 'nieuw' ? null : id)} className="btn">
          <ArrowLeftIcon />
          Terug naar de training
        </Link>
        <span className="print-toolbar-hint">Tip: kies "Opslaan als PDF" als printer om de training te delen.</span>
        <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={empty || !details}>
          <PrinterIcon />
          Afdrukken
        </button>
      </div>

      <article className="sheet" aria-label="Afdrukbare training">
        <header className="sheet-head">
          <div className="sheet-brand">
            <img src={`${import.meta.env.BASE_URL}ikdien-paars.png`} alt="" width={30} height={41} />
            <span>
              <span className="sheet-club">Kon. Ik Dien FC</span>
              <span className="sheet-sub">Training</span>
            </span>
          </div>
          <div className="sheet-title">
            <h1>{formatTrainingDate(training.date)}</h1>
            <span>
              {training.team || 'Geen team'} · {training.theme} · {total}/{training.duration} min
            </span>
          </div>
        </header>

        <section className="sheet-overview" aria-label="Overzicht">
          <div className="sheet-bar">
            {BLOCKS.map((b) => (
              <span key={b.id} style={{ width: `${(used[b.id] / denom) * 100}%`, background: b.color }} />
            ))}
          </div>
          <div className="sheet-overview-row">
            {BLOCKS.map((b) => (
              <span key={b.id}>
                <span className="sheet-sq" style={{ background: b.color }} />
                {b.name} <strong>{used[b.id]}′</strong>
              </span>
            ))}
            <span className="sheet-mats">
              <strong>Materiaal:</strong> {mats.length ? mats.join(', ') : '–'}
            </span>
          </div>
        </section>

        {empty && <p className="sheet-empty">Deze training heeft nog geen oefeningen.</p>}
        {failed && <p className="sheet-empty">De beschrijvingen konden niet geladen worden. Herlaad de pagina.</p>}

        {BLOCKS.map((b) =>
          training.plan[b.id].length === 0 ? null : (
            <section key={b.id} className="sheet-block">
              <h2 style={{ borderColor: b.color }}>
                <span className="sheet-block-name">{b.name}</span>
                <span className="sheet-block-min">{used[b.id]} min</span>
              </h2>
              {training.plan[b.id].map((it) => {
                const e = EXERCISE_BY_ID[it.ex];
                const d = details?.[it.ex];
                // The minutes come from the plan, so the exercise's own "Ritme" step is left out.
                const steps = d?.steps.filter((s) => s.title !== 'Ritme.') ?? [];
                const from = clock;
                clock += it.min;
                return (
                  <div key={it.uid} className="sheet-ex">
                    <div className="sheet-ex-media">
                      <div className="sheet-diagram">
                        <Pitch variant={e.variant} />
                      </div>
                      <span className="sheet-ex-facts">
                        {e.players} spelers · {e.field}
                      </span>
                    </div>
                    <div className="sheet-ex-main">
                      <h3>
                        <span>{e.title}</span>
                        <span className="sheet-ex-min">
                          {it.min} min{' '}
                          <span className="sheet-ex-clock">
                            ({from}′–{clock}′)
                          </span>
                        </span>
                      </h3>
                      {steps.map((s) => (
                        <p key={s.title}>
                          <strong>{s.title}</strong> {s.text}
                        </p>
                      ))}
                    </div>
                    <div className="sheet-ex-coach">
                      <span className="sheet-label">Coaching</span>
                      <ul>
                        {d?.coaching.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </section>
          ),
        )}

        {!empty && (
          <section className="sheet-notes" aria-label="Notities">
            <span className="sheet-label">Notities</span>
            <div className="sheet-lines" />
          </section>
        )}

        <footer className="sheet-foot">Kon. Ik Dien FC · trainingen.ikdien.be</footer>
      </article>
    </div>
  );
}
