import { Link } from 'react-router-dom';
import { BLOCKS, daysBetween, formatTrainingDate, relativeDay, todayISO, trainingPath, useTraining } from '../data/training';
import { ArrowRightIcon, WhistleIcon } from './icons';

/** Only trainings in the coming week get the strip; one three weeks away isn't what a coach opens the app for. */
const SHOW_WITHIN_DAYS = 6;

/**
 * A compact "Volgende training" bar above the exercise database, so on a training day the next session
 * (and "Training geven") is one tap from the home page. Shown only when a training is planned soon.
 */
export function NextTrainingStrip() {
  const { sessions } = useTraining();
  const today = todayISO();
  const next = sessions
    .filter((s) => s.date >= today && daysBetween(today, s.date) <= SHOW_WITHIN_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!next) return null;

  const count = BLOCKS.reduce((n, b) => n + next.plan[b.id].length, 0);
  const minutes = BLOCKS.reduce((n, b) => n + next.plan[b.id].reduce((m, it) => m + it.min, 0), 0);
  const date = formatTrainingDate(next.date);
  const facts = [next.team, next.theme, `${count} ${count === 1 ? 'oefening' : 'oefeningen'}`, `${minutes} min`].filter(Boolean);

  return (
    <section className="next-strip" aria-label="Volgende training">
      <div className="next-strip-text">
        <span className="next-strip-kicker">
          <span className="next-dot" aria-hidden="true" />
          Volgende training · {relativeDay(next.date, today)}
        </span>
        <span className="next-strip-title">
          <strong>{date[0].toUpperCase() + date.slice(1)}</strong>
          <span>{facts.join(' · ')}</span>
        </span>
      </div>
      <div className="next-strip-actions">
        <Link to={trainingPath(next.id)} className="next-strip-link">
          Bekijken
          <ArrowRightIcon />
        </Link>
        {count > 0 && (
          <Link to={`${trainingPath(next.id)}/geven`} className="next-strip-give">
            <WhistleIcon />
            Training geven
          </Link>
        )}
      </div>
    </section>
  );
}
