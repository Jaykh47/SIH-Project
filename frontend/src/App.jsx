import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import AuthProvider, { useAuth } from './hooks/useAuthContext';

// Public pages
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import AuthPage       from './components/Auth/AuthPage';

// Protected pages
import DashboardPage    from './pages/DashboardPage';
import MapPage          from './pages/MapPage';
import SearchPage       from './pages/SearchPage';
import ParcelDetailPage from './pages/ParcelDetailPage';
import AlertsPage       from './pages/AlertsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ServicesPage     from './pages/ServicesPage';
import WorkflowsPage    from './pages/WorkflowsPage';

// Layout
import MainLayout from './layouts/MainLayout';

// Loading spinner
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4, #f8faf9)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 14 }}>🌿</div>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800, fontSize: 20,
          color: 'var(--sb-700)', letterSpacing: '-0.02em',
        }}>SmartBhumi</div>
        <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Loading…</div>
      </div>
    </div>
  );
}

// Protected route wrapper — redirects to /login if not authenticated
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Redirect authenticated users away from public pages
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public routes ────────────────────────────────── */}
            <Route path="/"              element={<LandingPage />} />
            <Route path="/auth"          element={<PublicOnly><AuthPage /></PublicOnly>} />
            <Route path="/login"         element={<PublicOnly><AuthPage defaultTab="login" /></PublicOnly>} />
            <Route path="/register"      element={<PublicOnly><AuthPage defaultTab="signup" /></PublicOnly>} />
            <Route path="/officer-login" element={<PublicOnly><LoginPage /></PublicOnly>} />

            {/* ── Protected routes (under MainLayout) ──────────── */}
            <Route path="/dashboard" element={
              <Protected><MainLayout /></Protected>
            }>
              <Route index                  element={<DashboardPage />} />
            </Route>

            <Route path="/" element={
              <Protected><MainLayout /></Protected>
            }>
              <Route path="map"              element={<MapPage />} />
              <Route path="search"           element={<SearchPage />} />
              <Route path="parcels/:ulpin"   element={<ParcelDetailPage />} />
              <Route path="alerts"           element={<AlertsPage />} />
              <Route path="applications"     element={<ApplicationsPage />} />
              <Route path="services"         element={<ServicesPage />} />
              <Route path="workflows"        element={<WorkflowsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
