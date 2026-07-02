import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SelectionPage from './pages/SelectionPage';
import FloodRecordsDetailPage from './pages/FloodRecordsDetailPage';
import PopulationVulnerabilityPage from './pages/PopulationVulnerabilityPage';
import StreetRegistryDetailPage from './pages/StreetRegistryDetailPage';
import AccountSettingsPage from './pages/AccountSettingsPage';

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
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard/*" element={<AuthGuard><DashboardPage /></AuthGuard>} />
      <Route path="/flood-records" element={<AuthGuard><SelectionPage mode="flood" /></AuthGuard>} />
      <Route path="/flood-records/:barangayId" element={<AuthGuard><FloodRecordsDetailPage /></AuthGuard>} />
      <Route path="/population" element={<AuthGuard><PopulationVulnerabilityPage /></AuthGuard>} />
      <Route path="/street-registry" element={<AuthGuard><SelectionPage mode="street" /></AuthGuard>} />
      <Route path="/street-registry/:barangayId" element={<AuthGuard><StreetRegistryDetailPage /></AuthGuard>} />
      <Route path="/account" element={<AuthGuard><AccountSettingsPage /></AuthGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
