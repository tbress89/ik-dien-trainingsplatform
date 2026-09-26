import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { loadExerciseDetails } from './data/exercises';
import { TrainingProvider } from './data/training';
import { BuilderPage } from './pages/BuilderPage';
import { DetailPage } from './pages/DetailPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { TrainingsPage } from './pages/TrainingsPage';

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
            <Route path="/" element={<ExercisesPage />} />
            <Route path="/oefeningen/:id" element={<DetailPage />} />
            <Route path="/trainingen" element={<TrainingsPage />} />
            <Route path="/trainingen/:id" element={<BuilderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </TrainingProvider>
    </BrowserRouter>
  );
}
