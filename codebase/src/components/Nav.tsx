import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../data/auth';
import { TRAINING_BUILDER } from '../features';

export function Nav() {
  const { enabled, user } = useAuth();
  const { pathname } = useLocation();
  const onExercises = pathname === '/' || pathname.startsWith('/oefeningen');
  // "Training geven" uses the whole screen on the pitch.
  if (pathname.endsWith('/geven')) return null;

  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <img src={`${import.meta.env.BASE_URL}ikdien-paars.png`} alt="" width={32} height={44} />
          <span className="nav-brand-text">
            <span className="nav-club">Kon. Ik Dien FC</span>
            <span className="nav-sub">Trainingsplatform</span>
          </span>
        </Link>
        <nav aria-label="Hoofdnavigatie" className="nav-links">
          <NavLink to="/" className={onExercises ? 'active' : ''}>
            Oefeningen
          </NavLink>
          <NavLink to="/trainingen">
            Trainingen
            {!TRAINING_BUILDER && <span className="soon-badge">Binnenkort</span>}
          </NavLink>
        </nav>
      </div>
      {enabled && (
        <Link to="/account" className={`nav-account${user ? ' signed-in' : ''}`} aria-label={user ? `Account (${user.email})` : 'Inloggen'}>
          {user ? (user.email?.[0] ?? '?').toUpperCase() : 'Inloggen'}
        </Link>
      )}
    </header>
  );
}
