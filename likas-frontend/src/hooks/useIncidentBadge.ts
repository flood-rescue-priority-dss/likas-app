import { useState, useEffect, useCallback } from 'react';
import { floodService } from '../services';

// How often to re-fetch the pending count (ms)
const POLL_INTERVAL = 60_000;

/**
 * Tracks the number of pending (unresolved) incident submissions.
 *
 * The badge count equals the raw pending count from the API.
 * It only goes to 0 when every pending incident has been approved or rejected.
 * Visiting the Incident Management page does NOT clear the badge.
 */
export function useIncidentBadge() {
  const [pendingCount, setPendingCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const records = await floodService.getPendingApprovals();
      setPendingCount(records.length);
    } catch {
      // Silently ignore network errors — badge stays at last known value
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchCount]);

  /**
   * Call this after an approve/reject action to immediately reflect the change
   * rather than waiting for the next poll cycle.
   */
  const refresh = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  const displayCount = pendingCount > 9 ? '9+' : pendingCount > 0 ? String(pendingCount) : null;

  return { pendingCount, displayCount, refresh };
}
