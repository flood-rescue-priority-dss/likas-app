import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0F4F7]">
        <div className="spinner-dark" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppShell expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(prev => !prev)}>
              <Routes>
                <Route path="dashboard/*" element={<DashboardPage />} />
                <Route path="flood-records" element={<FloodRecordsDetailPage />} />
                <Route path="incident-management" element={<IncidentLogManagementPage />} />
                <Route path="population" element={<PopulationVulnerabilityPage />} />
                <Route path="street-registry" element={<StreetRegistryDetailPage />} />
                <Route path="account" element={<AccountSettingsPage />} />
                <Route path="accounts" element={<AccountManagementPage />} />
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
