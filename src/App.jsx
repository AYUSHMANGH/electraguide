import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';

// Lazy loaded routes for efficiency
const Home = lazy(() => import('./pages/Home'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const Map = lazy(() => import('./pages/Map'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="eligibility" element={<Eligibility />} />
            <Route path="map" element={<Map />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
