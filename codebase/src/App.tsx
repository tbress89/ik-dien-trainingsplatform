import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { loadExerciseDetails } from './data/exercises';
import { SHARE_PARAM } from './data/share';
import { TrainingProvider } from './data/training';
import { TRAINING_BUILDER } from './features';
import { BuilderPage } from './pages/BuilderPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { DetailPage } from './pages/DetailPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { GivePage } from './pages/GivePage';
import { PrintPage } from './pages/PrintPage';
import { SharedPage } from './pages/SharedPage';
import { TrainingsPage } from './pages/TrainingsPage';

/**
 * Shared links point at the home page (`/?training=…`), which GitHub Pages serves as a normal page (deeper
 * paths come from the 404 fallback, which link previews in chat apps may skip). Forward them to the shared page.
 */
function Home() {
  const { search } = useLocation();
  return new URLSearchParams(search).has(SHARE_PARAM) ? <Navigate to={`/gedeeld${search}`} replace /> : <ExercisesPage />;
}

export function App() {
  // The detail-page text is a separate chunk; fetch it once the browser is idle after the first render,
  // so opening an exercise doesn't have to wait for it.
  useEffect(() => {
    const preload = () => void loadExerciseDetails().catch(() => {});
    if ('requestIdleCallback' in window) window.requestIdleCallback(preload, { timeout: 3000 });
    else setTimeout(preload, 1500);
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <TrainingProvider>
        <div className="app">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gedeeld" element={<SharedPage />} />
            <Route path="/gedeeld/geven" element={<GivePage />} />
            <Route path="/oefeningen/:id" element={<DetailPage />} />
            <Route path="/trainingen" element={TRAINING_BUILDER ? <TrainingsPage /> : <ComingSoonPage />} />
            <Route path="/trainingen/:id" element={TRAINING_BUILDER ? <BuilderPage /> : <ComingSoonPage />} />
            <Route path="/trainingen/:id/afdrukken" element={TRAINING_BUILDER ? <PrintPage /> : <ComingSoonPage />} />
            <Route path="/trainingen/:id/geven" element={TRAINING_BUILDER ? <GivePage /> : <ComingSoonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </TrainingProvider>
    </BrowserRouter>
  );
}
