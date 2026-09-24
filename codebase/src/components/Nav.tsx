import { Link, NavLink, useLocation } from 'react-router-dom';

export function Nav() {
  const { pathname } = useLocation();
  const onExercises = pathname === '/' || pathname.startsWith('/oefeningen');

  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <img src="/ikdien-paars.png" alt="" width={32} height={44} />
          <span className="nav-brand-text">
            <span className="nav-club">Kon. Ik Dien FC</span>
            <span className="nav-sub">Trainingsplatform</span>
          </span>
        </Link>
        <nav aria-label="Hoofdnavigatie" className="nav-links">
          <NavLink to="/" className={onExercises ? 'active' : ''}>
            Oefeningen
          </NavLink>
          <NavLink to="/trainingen">Trainingen</NavLink>
        </nav>
      </div>
    </header>
  );
}
