import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { TrainingProvider } from './data/training';
import { BuilderPage } from './pages/BuilderPage';
import { DetailPage } from './pages/DetailPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { TrainingsPage } from './pages/TrainingsPage';

export function App() {
  return (
    <BrowserRouter>
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
