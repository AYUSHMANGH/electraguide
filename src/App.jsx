import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Layout from './components/Layout';
import { logAnalyticsEvent } from './lib/firebase';

// ── Lazy-loaded routes (Code Splitting / Efficiency) ──────────────────────────
const Home        = lazy(() => import('./pages/Home'));
const Assistant   = lazy(() => import('./pages/Assistant'));
const Timeline    = lazy(() => import('./pages/Timeline'));
const Quiz        = lazy(() => import('./pages/Quiz'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const Map         = lazy(() => import('./pages/Map'));

/** Tracks page views via Firebase Analytics on every route change. */
function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    logAnalyticsEvent('page_view', { page_path: location.pathname });
  }, [location.pathname]);
  return null;
}

/** Full-screen loading spinner shown while lazy chunks are fetching. */
const PageLoader = (
  <div
    role="status"
    aria-label="Loading page"
    className="min-h-screen flex items-center justify-center bg-slate-50"
  >
    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
);

/**
 * Root application component.
 * Configures routing, lazy loading, and analytics tracking.
 */
function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Suspense fallback={PageLoader}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index            element={<Home />}        />
            <Route path="assistant" element={<Assistant />}   />
            <Route path="timeline"  element={<Timeline />}    />
            <Route path="quiz"      element={<Quiz />}        />
            <Route path="eligibility" element={<Eligibility />} />
            <Route path="map"       element={<Map />}         />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
