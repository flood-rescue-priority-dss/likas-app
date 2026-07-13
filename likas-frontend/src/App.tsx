import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FloodRecordsDetailPage from './pages/FloodRecordsDetailPage';
import IncidentLogManagementPage from './pages/IncidentLogManagementPage';
import PopulationVulnerabilityPage from './pages/PopulationVulnerabilityPage';
import StreetRegistryDetailPage from './pages/StreetRegistryDetailPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import AccountManagementPage from './pages/AccountManagementPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// ── AuthGuard ────────────────────────────────────────────────────────────────
// Redirects unauthenticated users to login.
// If the user is authenticated but mustChangePassword is true, redirects them
// to /change-password for any route except /change-password itself (no loop).
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0F4F7]">
        <div className="spinner-dark" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  // Force password change — allow /change-password to render normally
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}

// ── AppRoutes ────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Forced password change — inside AuthGuard but outside AppShell */}
      <Route
        path="/change-password"
        element={
          <AuthGuard>
            <ChangePasswordPage />
          </AuthGuard>
        }
      />

      {/* All other authenticated routes — wrapped in AppShell */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppShell expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(prev => !prev)}>
              <Routes>
                <Route path="dashboard/*" element={<DashboardPage />} />
                <Route path="flood-records" element={<FloodRecordsDetailPage />} />
                {user?.role === 'admin' && (
                  <Route path="incident-management" element={<IncidentLogManagementPage />} />
                )}
                <Route path="population" element={<PopulationVulnerabilityPage />} />
                <Route path="street-registry" element={<StreetRegistryDetailPage />} />
                <Route path="account" element={<AccountSettingsPage />} />
                {user?.role === 'admin' && (
                  <Route path="accounts" element={<AccountManagementPage />} />
                )}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppShell>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
