import { useState, useEffect, useCallback } from 'react';
import { floodService } from '../services';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Polling fallback interval in case SSE drops (ms)
const POLL_INTERVAL = 5_000;

/**
 * Tracks the number of pending (unresolved) incident submissions.
 *
 * - Admin users get real-time updates via SSE (/api/flood/events).
 * - Falls back to polling every 30 s + re-fetches on tab focus.
 * - `refresh()` can be called manually after an approve/reject for instant update.
 */
export function useIncidentBadge() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [pendingCount, setPendingCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const records = await floodService.getPendingApprovals();
      setPendingCount(records.length);
    } catch {
      // Silently ignore — badge keeps last known value
    }
  }, []);

  // Initial fetch + polling fallback + tab-focus refresh
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchCount();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchCount]);

  // SSE: real-time push for admin users
  useEffect(() => {
    if (!isAdmin) return;

    const token = sessionStorage.getItem('likas_token');
    if (!token) return;

    // EventSource can't set headers — pass token as query param
    // (auth middleware accepts ?token= for SSE clients)
    const es = new EventSource(`${API_BASE}/flood/events?token=${encodeURIComponent(token)}`);

    es.addEventListener('pending-update', () => {
      fetchCount();
    });

    es.onerror = () => {
      // Connection dropped — polling fallback will cover it
      es.close();
    };

    return () => {
      es.close();
    };
  }, [isAdmin, fetchCount]);

  const refresh = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  const displayCount = pendingCount > 9 ? '9+' : pendingCount > 0 ? String(pendingCount) : null;

  return { pendingCount, displayCount, refresh };
}
