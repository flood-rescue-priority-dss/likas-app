import type {
  UserAccount, District, City, Barangay,
  FloodIncident, RecurrenceHotspot,
  StreetVulnerability, BarangayVulnerability,
  StreetRegistryEntry, PriorityItem,
  DashboardSummary, Priority, AnalyticsData
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('likas_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    let errMsg = 'API Error';
    try {
      const errData = await res.json();
      errMsg = errData.error || errData.message || errMsg;
    } catch (e) {
      // Ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string): Promise<UserAccount> {
    const data = await fetchApi<{ user: UserAccount, token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    sessionStorage.setItem('likas_token', data.token);
    sessionStorage.setItem('likas_user', JSON.stringify(data.user));
    return data.user;
  },

  // Throws if password is incorrect (lets callers surface the error message)
  async verifyPassword(password: string): Promise<void> {
    await fetchApi<{ verified: boolean }>('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await fetchApi<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async requestEmailChange(newEmail: string): Promise<void> {
    await fetchApi<{ success: boolean }>('/auth/request-email-change', {
      method: 'POST',
      body: JSON.stringify({ newEmail }),
    });
  },

  async confirmEmailChange(code: string): Promise<{ newEmail: string }> {
    return fetchApi<{ success: boolean; newEmail: string }>('/auth/confirm-email-change', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    const stored = sessionStorage.getItem('likas_user');
    if (!stored) return null;
    return JSON.parse(stored) as UserAccount;
  },

  async getCurrentUserFromServer(): Promise<UserAccount | null> {
    try {
      const user = await fetchApi<UserAccount>('/auth/me');
      return user;
    } catch {
      return null;
    }
  },

  async updateOfficeDetails(accountId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    const stored = sessionStorage.getItem('likas_user');
    if (stored) {
      const current = JSON.parse(stored) as UserAccount;
      if (current.id === accountId) {
        const updated = { ...current, ...updates };
        sessionStorage.setItem('likas_user', JSON.stringify(updated));
        return updated;
      }
    }
    throw new Error('Account not found');
  },

  logout() {
    sessionStorage.removeItem('likas_user');
    sessionStorage.removeItem('likas_token');
  },
};

// ─── Geography ───────────────────────────────────────────────────────────────

export const geoService = {
  async getDistricts(): Promise<District[]> {
    return fetchApi<District[]>('/geo/districts');
  },
  async getAllBarangays(): Promise<Barangay[]> {
    return fetchApi<Barangay[]>('/geo/barangays');
  },
  async getCitiesByDistrict(districtId: string): Promise<City[]> {
    return fetchApi<City[]>(`/geo/districts/${districtId}/cities`);
  },
  async getBarangaysByDistrict(districtId: string): Promise<Barangay[]> {
    return fetchApi<Barangay[]>(`/geo/districts/${districtId}/barangays`);
  },
  async getBarangaysByCity(cityId: string): Promise<Barangay[]> {
    return fetchApi<Barangay[]>(`/geo/cities/${cityId}/barangays`);
  },
  async getBarangayById(barangayId: string): Promise<Barangay | undefined> {
    return fetchApi<Barangay>(`/geo/barangays/${barangayId}`);
  },
};

// ─── Flood Incidents ──────────────────────────────────────────────────────────

export const floodService = {
  async getFloodRecordsByBarangay(barangayId: string): Promise<FloodIncident[]> {
    return fetchApi<FloodIncident[]>(`/flood/${barangayId}`);
  },
  async getFloodRecordsFiltered(filters: { districtId?: string; cityId?: string; barangayId?: string; approvalStatus?: string; year?: number; }): Promise<FloodIncident[]> {
    const params = new URLSearchParams();
    if (filters.districtId) params.append('districtId', filters.districtId);
    if (filters.cityId) params.append('cityId', filters.cityId);
    if (filters.barangayId) params.append('barangayId', filters.barangayId);
    if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
    if (filters.year) params.append('year', filters.year.toString());
    const query = params.toString();
    return fetchApi<FloodIncident[]>(`/flood${query ? `?${query}` : ''}`);
  },
  async getAvailableYears(): Promise<number[]> {
    return fetchApi<number[]>('/flood/years');
  },
  async getPendingApprovals(): Promise<FloodIncident[]> {
    return fetchApi<FloodIncident[]>('/flood?approvalStatus=Pending');
  },
  async createFloodIncident(incident: Omit<FloodIncident, 'id' | 'loggedByRole' | 'approvalStatus' | 'loggedByEmail'>, force: boolean = false, remarksFile?: File): Promise<FloodIncident> {
    const formData = new FormData();
    formData.append('date', incident.date);
    formData.append('time', incident.time);
    formData.append('street', incident.street);
    formData.append('depthInches', incident.depthInches.toString());
    formData.append('status', incident.status);
    formData.append('cause', incident.cause);
    formData.append('priority', incident.priority);
    formData.append('force', force.toString());
    
    if (remarksFile) {
      formData.append('remarksAttachment', remarksFile);
    }

    const token = sessionStorage.getItem('likas_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/flood/${incident.barangayId}`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      let errMsg = 'API Error';
      try {
        const errData = await res.json();
        errMsg = errData.error || errData.message || errMsg;
      } catch (e) {
        // Ignore
      }
      throw new Error(errMsg);
    }
    return res.json();
  },
  async updateFloodIncident(incidentId: string, updates: { date: string; time: string; street: string; depthInches: number; cause: string; }, remarksFile?: File | null): Promise<FloodIncident> {
    // If a new attachment file is provided, use multipart/form-data
    if (remarksFile) {
      const formData = new FormData();
      formData.append('date', updates.date);
      formData.append('time', updates.time);
      formData.append('street', updates.street);
      formData.append('depthInches', updates.depthInches.toString());
      formData.append('cause', updates.cause);
      formData.append('remarksAttachment', remarksFile);

      const token = sessionStorage.getItem('likas_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/flood/incident/${incidentId}`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      if (!res.ok) {
        let errMsg = 'API Error';
        try { const d = await res.json(); errMsg = d.error || d.message || errMsg; } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      return res.json();
    }

    // No file — send as JSON (keeps existing attachment unchanged)
    return fetchApi<FloodIncident>(`/flood/incident/${incidentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteFloodIncident(incidentId: string): Promise<{ success: boolean; id: string }> {
    return fetchApi<{ success: boolean; id: string }>(`/flood/incident/${incidentId}`, {
      method: 'DELETE'
    });
  },
  async approveIncident(incidentId: string): Promise<FloodIncident> {
    return fetchApi<FloodIncident>(`/flood/incident/${incidentId}/approve`, {
      method: 'POST'
    });
  },
  async rejectIncident(incidentId: string): Promise<FloodIncident> {
    return fetchApi<FloodIncident>(`/flood/incident/${incidentId}/reject`, {
      method: 'POST'
    });
  },
  async getRecurrenceHotspots(barangayId: string): Promise<RecurrenceHotspot[]> {
    return fetchApi<RecurrenceHotspot[]>(`/flood/${barangayId}/hotspots`);
  },
};

// ─── Population Vulnerability ─────────────────────────────────────────────────

export const populationService = {
  async getStreetVulnerabilityByBarangay(barangayId: string): Promise<StreetVulnerability[]> {
    return fetchApi<StreetVulnerability[]>(`/population/streets/${barangayId}`);
  },
  async getAllBarangayVulnerabilities(): Promise<BarangayVulnerability[]> {
    return fetchApi<BarangayVulnerability[]>('/population/barangays');
  },
  async updateStreetVulnerability(id: string, updates: Partial<Omit<StreetVulnerability, 'id'>>): Promise<StreetVulnerability> {
    return fetchApi<StreetVulnerability>(`/population/streets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
};

// ─── Street Registry ──────────────────────────────────────────────────────────

export interface StreetFilters {
  districtId?: string;
  cityId?: string;
  barangayId?: string;
}

export const streetService = {
  async getStreetRegistry(barangayId: string): Promise<StreetRegistryEntry[]> {
    return fetchApi<StreetRegistryEntry[]>(`/street/${barangayId}`);
  },
  async getStreetRegistryFiltered(filters: StreetFilters): Promise<StreetRegistryEntry[]> {
    const params = new URLSearchParams();
    if (filters.districtId) params.append('districtId', filters.districtId);
    if (filters.cityId) params.append('cityId', filters.cityId);
    if (filters.barangayId) params.append('barangayId', filters.barangayId);
    const query = params.toString();
    return fetchApi<StreetRegistryEntry[]>(`/street${query ? `?${query}` : ''}`);
  },
};

// ─── Dashboard & Priority List ────────────────────────────────────────────────

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    return fetchApi<DashboardSummary>('/dashboard/summary');
  },
  async getPopulationComparison(barangayIds: string[]): Promise<any[]> {
    return fetchApi<any[]>('/dashboard/population-comparison', {
      method: 'POST',
      body: JSON.stringify({ barangayIds })
    });
  },
};

export const priorityService = {
  async getPriorityList(filter: Priority | 'All' = 'All'): Promise<PriorityItem[]> {
    return fetchApi<PriorityItem[]>(`/priority?filter=${filter}`);
  },
};

export const analyticsService = {
  getAnalytics: (): Promise<AnalyticsData> => fetchApi<AnalyticsData>('/analytics'),
};
