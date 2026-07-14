import React, { createContext, useContext, type ReactNode } from 'react';
import { useIncidentBadge } from '../hooks/useIncidentBadge';

interface IncidentBadgeContextType {
  displayCount: string | null;
  pendingCount: number;
  refresh: () => void;
}

const IncidentBadgeContext = createContext<IncidentBadgeContextType | null>(null);

export function IncidentBadgeProvider({ children }: { children: ReactNode }) {
  const badge = useIncidentBadge();
  return (
    <IncidentBadgeContext.Provider value={badge}>
      {children}
    </IncidentBadgeContext.Provider>
  );
}

export function useIncidentBadgeContext() {
  const ctx = useContext(IncidentBadgeContext);
  if (!ctx) throw new Error('useIncidentBadgeContext must be used within IncidentBadgeProvider');
  return ctx;
}
