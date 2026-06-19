import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Onboarding from './routes/Onboarding';
import Dashboard from './routes/Dashboard';
import Nudges from './routes/Nudges';
import Pacts from './routes/Pacts';
import Profile from './routes/Profile';

/* ── Lazy-loaded route pages ─────────────────────────────── */
const Insights = lazy(() => import('./routes/Insights'));

/* ── Minimal dark loading fallback ───────────────────────── */
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060a04',
        color: '#a8b89e',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: '15px',
        letterSpacing: '0.04em',
      }}
    >
      <span style={{ opacity: 0.7 }}>Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nudges" element={<Nudges />} />
          <Route path="/pacts" element={<Pacts />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
