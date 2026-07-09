// ─── Auth & User ────────────────────────────────────────────────────────────

export type UserRole = 'barangay' | 'admin';

export interface UserAccount {
  id: string;
  officeName: string;
  cityMunicipality: string;
  zone?: string;
  region?: string;
  officeContact: string;
  officeReferenceNo: string;
  registeredEmail: string;
  role: UserRole;
  lastLogin: string;
}

// ─── Geography ───────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
}

export interface City {
  id: string;
  districtId: string;
  name: string;
}

export interface Barangay {
  id: string;
  cityId: string;
  name: string;
  population: number;
  lat: number;
  lng: number;
}

// ─── Flood Records ────────────────────────────────────────────────────────────

export type FloodCause = 'Heavy Rainfall' | 'Tropical Cyclone' | 'High Tide' | 'Infrastructure Failure';
export type FloodStatus = 'PATV' | 'NPLV' | 'NPATV' | 'MPATV' | 'CLR';
export type Priority = 'Low' | 'Medium' | 'High';

export interface FloodIncident {
  id: string;
  barangayId: string;
  date: string;       // ISO date string
  time: string;       // HH:MM
  street: string;
  depthInches: number;
  status: FloodStatus;
  cause: FloodCause;
  priority: Priority;
}

export interface RecurrenceHotspot {
  street: string;
  eventCount: number;
  segmentLow: number;
  segmentMedium: number;
  segmentHigh: number;
  segmentVeryHigh: number;
}

// ─── Population Vulnerability ─────────────────────────────────────────────────

export interface StreetVulnerability {
  id: string;
  barangayId: string;
  streetName: string;
  pwd: number;
  elderly: number;
  children: number;
  pregnant: number;
  lastUpdated: string;
}

export interface BarangayVulnerability {
  id: string;
  cityId: string;
  name: string;
  population: number;
  pwd: number;
  elderly: number;
  children: number;
  pregnant: number;
  lastUpdated: string;
}

// ─── Street Registry ──────────────────────────────────────────────────────────

export interface StreetRegistryEntry {
  id: string;
  barangayId: string;
  streetName: string;
  priorityScore: number;
  vulnerabilityScore: number;
  priority: Priority;
  floodCount: number;
  lastUpdated: string;
  lat: number;
  lng: number;
}

// ─── Priority List ────────────────────────────────────────────────────────────

export interface PriorityItem {
  id: string;
  barangayId?: string;
  streetName: string;
  barangay: string;
  priority: Priority;
  priorityScore: number;
  vulnerabilityScore: number;
  floodCount: number;
  lat: number;
  lng: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalPopulation: number;
  totalStreets: number;
  totalFloodRecords: number;
  highPriorityAreas: number;
  populationComparison: {
    label: string;
    count: number;
    pwd: number;
    senior: number;
    children: number;
    pregnant: number;
    general: number;
    color: string;
  }[];
  topStreets: PriorityItem[];
  recentFloods: (FloodIncident & { barangayName: string })[];
}
