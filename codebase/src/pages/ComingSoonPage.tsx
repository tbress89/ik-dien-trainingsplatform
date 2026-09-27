import { Link } from 'react-router-dom';

/** Shown on the Trainingen routes while the training builder is switched off (see features.ts). */
export function ComingSoonPage() {
  return (
    <div className="trainings">
      <div className="trainings-head">
        <h1 className="page-title">Trainingen</h1>
      </div>
      <div className="trainings-body coming-soon-body">
        <div className="empty">
          <span className="soon-badge">Binnenkort</span>
          <span className="empty-title">De trainingsbouwer komt eraan</span>
          <span className="empty-text">
            Stel straks je training van 60 tot 90 minuten samen uit de oefeningen, in drie blokken, en zie meteen of de tijd
            klopt.
          </span>
          <Link to="/" className="btn btn-primary">
            Naar de oefeningen
          </Link>
        </div>
      </div>
    </div>
  );
}
