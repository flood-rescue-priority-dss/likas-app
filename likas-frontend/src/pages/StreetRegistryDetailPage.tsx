import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Map, TrendingUp, Shield, Info } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import PriorityBadge from '../components/ui/PriorityBadge';
import MapPreview from '../components/ui/MapPreview';
import type { DistrictOverlay } from '../components/ui/MapPreview';
import Modal from '../components/ui/Modal';
import SearchInput from '../components/ui/SearchInput';
import DropdownSelect from '../components/ui/DropdownSelect';
import { streetService, geoService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { StreetRegistryEntry, District, City, Barangay } from '../types';

// Matches boundaries.json keys exactly; same palette as DashboardPage
const DISTRICT_COLORS: Record<string, string> = {
  'District 1': '#3b82f6',
  'District 2': '#10b981',
  'District 3': '#f59e0b',
  'District 4': '#8b5cf6',
  'District 5': '#ef4444',
  'District 6': '#ec4899',
};


export default function StreetRegistryDetailPage() {
  const { barangayId: routeBarangayId } = useParams<{ barangayId: string }>();
  const { user } = useAuth();
  const isBarangay = user?.role === 'barangay';

  // ── Geography filter state ────────────────────────────────────────────────
  const [districts, setDistricts]   = useState<District[]>([]);
  const [cities,    setCities]      = useState<City[]>([]);
  const [barangays, setBarangays]   = useState<Barangay[]>([]);

  const [districtId, setDistrictId] = useState<string>('ALL');
  const [cityId,     setCityId]     = useState<string>('ALL');
  const [barangayId, setBarangayId] = useState<string>(routeBarangayId ?? 'ALL');

  // ── Data state ────────────────────────────────────────────────────────────
  const [streets, setStreets] = useState<StreetRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreet, setSelectedStreet] = useState<StreetRegistryEntry | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [showFloodInfo, setShowFloodInfo] = useState(false);
  const [showVulnInfo, setShowVulnInfo] = useState(false);
  const [showPrioInfo, setShowPrioInfo] = useState(false);

  // ── Load geography dropdowns on mount (admin only) ────────────────────────
  useEffect(() => {
    if (isBarangay) return;
    geoService.getDistricts().then(setDistricts);
  }, [isBarangay]);

  // 🔒 Barangay-role users: auto-scope to their own barangay 🔒
  const [myBarangayName, setMyBarangayName] = useState<string>((user as any)?.officeName || '');
  useEffect(() => {
    if (!isBarangay || routeBarangayId) return;
    const myId = (user as any)?.barangayId ?? user?.id;
    if (myId) setBarangayId(myId);
  }, [isBarangay, routeBarangayId, user]);

  useEffect(() => {
    const myId = (user as any)?.barangayId ?? user?.id;
    if (!isBarangay || !myId || myId === 'ALL') return;
    geoService.getBarangayById(myId)
      .then(b => {
        if (b?.name) setMyBarangayName(b.name);
      })
      .catch(() => { /* Keep the initial officeName */ });
  }, [isBarangay, routeBarangayId, user]);

  const handleDistrictChange = async (id: string) => {
    setDistrictId(id);
    setCityId('ALL');
    setBarangayId('ALL');
    setCities([]);
    setBarangays([]);
    if (id && id !== 'ALL') {
      const cs = await geoService.getCitiesByDistrict(id);
      setCities(cs);
    }
  };

  const handleCityChange = async (id: string) => {
    setCityId(id);
    setBarangayId('ALL');
    setBarangays([]);
    if (id && id !== 'ALL') {
      const bs = await geoService.getBarangaysByCity(id);
      setBarangays(bs);
    }
  };

  // ── Fetch street registry whenever filters change ─────────────────────────
  useEffect(() => {
    setLoading(true);
    const filters: any = {};
    if (districtId !== 'ALL') filters.districtId = districtId;
    if (cityId !== 'ALL') filters.cityId = cityId;
    if (barangayId !== 'ALL') filters.barangayId = barangayId;

    streetService.getStreetRegistryFiltered(filters)
      .then(strs => {
        setStreets(strs);
        setSelectedStreet(null);
        setLoading(false);
      })
      .catch(() => {
        setStreets([]);
        setLoading(false);
      });
  }, [districtId, cityId, barangayId]);

  // ── Client-side table search filter ──────────────────────────────────────
  const filteredStreets = useMemo(() => streets.filter(s =>
    !tableSearch || s.streetName.toLowerCase().includes(tableSearch.toLowerCase())
  ), [streets, tableSearch]);

  const avgPriority = streets.length
    ? Math.round(streets.reduce((s, st) => s + st.priorityScore, 0) / streets.length)
    : 0;

  const avgVuln = streets.length
    ? Math.round(streets.reduce((s, st) => s + st.vulnerabilityScore, 0) / streets.length)
    : 0;

  const highCount = streets.filter(s => s.priority === 'High').length;

  const getFloodLevel = (score: number) => {
    if (score < 5) return 'Low';
    if (score < 8) return 'Medium';
    return 'High';
  };

  const columns: Column<StreetRegistryEntry>[] = [
    { key: 'streetName', header: 'Location', sticky: true, sortable: true, render: r => (
      <span className="font-semibold text-gray-800">{r.streetName}</span>
    )},
    { key: 'floodLevel', sortable: true, sortAccessor: r => r.priorityScore, header: (
      <div className="flex items-center gap-1.5">
        Flood Hazard
        <button onClick={(e) => { e.stopPropagation(); setShowFloodInfo(true); }} className="text-gray-400 hover:text-blue-500 transition-colors">
          <Info size={14} />
        </button>
      </div>
    ), render: r => {
      const level = getFloodLevel(r.priorityScore);
      return <PriorityBadge priority={level as any} size="sm" />;
    }},
    { key: 'vulnerabilityScore', sortable: true, sortAccessor: r => r.vulnerabilityScore, header: (
      <div className="flex items-center gap-1.5">
        Vulnerability
        <button onClick={(e) => { e.stopPropagation(); setShowVulnInfo(true); }} className="text-gray-400 hover:text-blue-500 transition-colors">
          <Info size={14} />
        </button>
      </div>
    ), render: r => {
      const vulnLevel = getFloodLevel(r.vulnerabilityScore);
      return <PriorityBadge priority={vulnLevel as any} size="sm" />;
    }},
    { key: 'priority', sortable: true, sortAccessor: r => (r.priority === 'High' ? 3 : r.priority === 'Medium' ? 2 : r.priority === 'Low' ? 1 : 0), header: (
      <div className="flex items-center gap-1.5">
        Priority
        <button onClick={(e) => { e.stopPropagation(); setShowPrioInfo(true); }} className="text-gray-400 hover:text-blue-500 transition-colors">
          <Info size={14} />
        </button>
      </div>
    ), render: r => <PriorityBadge priority={r.priority} size="sm" /> },
    { key: 'lastUpdated', header: 'Last Updated', sortable: true, render: r => (
      <span className="text-gray-500 text-xs">{r.lastUpdated ? r.lastUpdated.split('T')[0] : 'N/A'}</span>
    )},
  ];

  // ── Resolved label for breadcrumb / card subtitle ─────────────────────────
  const selectedBarangay = barangays.find(b => b.id === barangayId);
  const selectedCity     = cities.find(c => c.id === cityId);
  const selectedDistrict = districts.find(d => d.id === districtId);
  const scopeLabel = isBarangay
    ? (myBarangayName || barangayId)
    : (selectedBarangay?.name ?? selectedCity?.name ?? selectedDistrict?.name ?? 'All Barangays');

  // ── Dropdown options with ALL fallback ────────────────────────────────────
  const districtOptions = [
    { value: 'ALL', label: 'All Districts' },
    ...districts.map(d => ({ value: d.id, label: d.name })),
  ];
  const cityOptions = [
    { value: 'ALL', label: 'All Areas' },
    ...cities.map(c => ({ value: c.id, label: c.name })),
  ];
  const barangayOptions = [
    { value: 'ALL', label: 'All Barangays' },
    ...barangays.map(b => ({ value: b.id, label: b.name })),
  ];

  // ── Map logic ──────────────────────────────────────────────────────────────
  const mapCenter: [number, number] = selectedStreet
    ? [selectedStreet.lat, selectedStreet.lng]
    : (selectedBarangay ? [selectedBarangay.lat, selectedBarangay.lng] : [14.5931, 120.9748]);
  
  const markerPos: [number, number] | undefined = selectedStreet
    ? [selectedStreet.lat, selectedStreet.lng]
    : undefined;

  // Zoom: street pin → 17, barangay → 16, city → 15, single district → 13, all → 12
  const mapZoom = selectedStreet ? 17
    : barangayId !== 'ALL' ? 16
    : cityId    !== 'ALL' ? 15
    : districtId !== 'ALL' ? 13
    : 12;

  // When "All Districts" is selected (admin, no narrower filter), show every
  // district as a color-coded overlay. For any narrower selection or for
  // barangay-role users, fall back to a single highlighted boundary.
  const showAllDistricts =
    !isBarangay &&
    !selectedStreet &&
    districtId === 'ALL' &&
    cityId     === 'ALL' &&
    barangayId === 'ALL' &&
    districts.length > 0;

  const districtOverlays: DistrictOverlay[] | undefined = showAllDistricts
    ? districts
        .map(d => ({ name: d.name, color: DISTRICT_COLORS[d.name] ?? '#64748b' }))
        .filter(o => !!o.color)
    : undefined;

  // Derive barangay name from a barangayId slug.
  // Mirrors the backend fallback: "b-barangay-651" → "Barangay 651",
  // "brgy-659-a" → "Barangay 659-A". These match boundaries.json keys exactly.
  const barangayNameFromId = (id: string): string | undefined => {
    const m = id.match(/(\d+(?:-[a-zA-Z])?)\s*$/);
    return m ? `Barangay ${m[1].toUpperCase()}` : undefined;
  };

  // When a street row is selected, show its barangay boundary regardless of
  // the current dropdown filter state.
  const selectedStreetBarangayName: string | undefined = selectedStreet
    ? (barangays.find(b => b.id === selectedStreet.barangayId)?.name
        ?? barangayNameFromId(selectedStreet.barangayId))
    : undefined;

  const singleHighlight: string | undefined = showAllDistricts
    ? undefined
    : selectedStreetBarangayName   // street selected → its barangay boundary
    ?? (isBarangay
      ? (myBarangayName || undefined)
      : (selectedBarangay?.name ?? selectedCity?.name ?? selectedDistrict?.name));

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10">
        <PageHeader
          title="STREET REGISTRY"
          titleUppercase
        />

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <MetricCard label="Total Streets" value={loading ? '—' : streets.length}
            icon={<Map size={14} className="text-[#1B75BC]" />} iconBg="bg-blue-50" />
          <MetricCard label="Avg. Priority Score" value={loading ? '—' : avgPriority}
            icon={<TrendingUp size={14} className="text-amber-500" />} iconBg="bg-amber-50" />
          <MetricCard label="Avg. Vulnerability Score" value={loading ? '—' : avgVuln}
            icon={<Shield size={14} className="text-purple-500" />} iconBg="bg-purple-50" />
          <MetricCard label="High Priority Streets" value={loading ? '—' : highCount}
            accent="text-[#C62828]"
            icon={<TrendingUp size={14} className="text-[#C62828]" />} iconBg="bg-red-50" />
        </div>

        {/* ── Unified filter bar ──────────────────────────────────────────── */}
        {!isBarangay && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6">
            <div className="flex flex-wrap items-center gap-5">
              {/* Label */}
              <span className="text-sm font-inter font-medium text-gray-800 uppercase whitespace-nowrap">
                Display By:
              </span>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200" />

              {/* District */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-inter text-gray-500 whitespace-nowrap">District</label>
                <DropdownSelect
                  options={districtOptions}
                  value={districtId}
                  onChange={handleDistrictChange}
                  placeholder="All Districts"
                  className="w-40"
                />
              </div>

              {/* Area / City */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-inter text-gray-500 whitespace-nowrap">Area</label>
                <DropdownSelect
                  options={cityOptions}
                  value={cityId}
                  onChange={handleCityChange}
                  placeholder="All Areas"
                  disabled={districtId === 'ALL'}
                  className="w-40"
                />
              </div>

              {/* Barangay */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-inter text-gray-500 whitespace-nowrap">Barangay</label>
                <DropdownSelect
                  options={barangayOptions}
                  value={barangayId}
                  onChange={setBarangayId}
                  placeholder="All Barangays"
                  disabled={cityId === 'ALL'}
                  className="w-42"
                />
              </div>

              {/* Clear */}
              {(districtId !== 'ALL' || cityId !== 'ALL' || barangayId !== 'ALL') && (
                <button
                  onClick={() => {
                    setDistrictId('ALL'); setCityId('ALL'); setBarangayId('ALL');
                    setCities([]); setBarangays([]);
                  }}
                  className="text-xs font-inter text-[#1B75BC] hover:underline whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected street indicator */}
        {selectedStreet && (
          <div className="mb-4 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#C62828]" />
            <span className="text-sm font-inter font-medium text-gray-700">
              Showing: <span className="font-semibold text-gray-900">{selectedStreet.streetName}</span>
            </span>
            <PriorityBadge priority={selectedStreet.priority} size="sm" />
            <span className="ml-auto text-xs font-inter text-gray-400">
              Score: {selectedStreet.priorityScore} · Vuln: {selectedStreet.vulnerabilityScore}
            </span>
          </div>
        )}

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Streets table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 pt-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="font-heading font-bold text-gray-900 text-base">All Locations</h2>
                  <p className="text-xs font-inter text-gray-400 mt-0.5">
                    {streets.length} available locations — {scopeLabel}
                  </p>
                </div>
                <SearchInput
                  value={tableSearch}
                  onChange={setTableSearch}
                  placeholder="Search streets…"
                  className="w-full sm:w-48 flex-shrink-0"
                />
              </div>
            </div>
            <div className="overflow-x-auto street-registry-table">
              <DataTable
                columns={columns}
                data={filteredStreets}
                keyExtractor={r => r.id}
                loading={loading}
                onRowClick={row => {
                  if (selectedStreet?.id === row.id) {
                    setSelectedStreet(null);
                  } else {
                    setSelectedStreet(row);
                  }
                }}
                selectedKey={selectedStreet?.id}
                pageSize={8}
              />
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Map size={16} className="text-gray-400" />
              <h2 className="font-heading font-bold text-gray-900 text-base">Map Preview</h2>
            </div>
            <p className="text-xs font-inter text-gray-400 mb-4">
              {selectedStreet ? selectedStreet.streetName : scopeLabel}
            </p>
            
            {/* Selected street indicator */}
            {selectedStreet && (
              <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C62828]" />
                <span className="text-xs font-inter font-medium text-gray-700">
                  {selectedStreet.streetName}
                </span>
              </div>
            )}

            <div className="flex-1 min-h-[360px] relative">
              {loading ? (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl" />
              ) : (
                <MapPreview
                  center={mapCenter}
                  zoom={mapZoom}
                  markerPosition={markerPos}
                  markerLabel={selectedStreet?.streetName ?? scopeLabel}
                  highlightBoundary={singleHighlight}
                  districtOverlays={districtOverlays}
                  showHoverBoundary
                  height="100%"
                />
              )}
            </div>
            
            <p className="text-xs font-inter text-gray-400 text-center mt-3">
              Click a location row to update pin
            </p>
          </div>
        </div>
      </div>
      <Modal open={showFloodInfo} onClose={() => setShowFloodInfo(false)} title="Flood Hazard Computation" size="sm">
        <div className="text-sm font-inter text-gray-600 space-y-3">
          <p>
            The Flood Hazard level is determined by mathematically analyzing historical flood reports on this street.
          </p>
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-100">
            <h4 className="font-semibold text-gray-800 mb-1 text-xs uppercase tracking-wider">Hazard Weights:</h4>
            <ul className="space-y-1 text-xs font-medium">
              <li>• Flood Severity (Depth): <span className="text-blue-700">70%</span></li>
              <li>• Historical Frequency: <span className="text-blue-700">30%</span></li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal open={showVulnInfo} onClose={() => setShowVulnInfo(false)} title="Vulnerability Index" size="sm">
        <div className="text-sm font-inter text-gray-600 space-y-3">
          <p>
            The Vulnerability Score is computed per capita, normalized on a 0-100 scale, based on the street's demographic profile.
          </p>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <h4 className="font-semibold text-gray-800 mb-1 text-xs uppercase tracking-wider">Demographic Weights:</h4>
            <ul className="space-y-1 text-xs font-medium">
              <li>• Seniors: <span className="text-purple-700">35%</span></li>
              <li>• PWDs: <span className="text-purple-700">35%</span></li>
              <li>• Pregnant: <span className="text-purple-700">20%</span></li>
              <li>• Children: <span className="text-purple-700">10%</span></li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal open={showPrioInfo} onClose={() => setShowPrioInfo(false)} title="Priority Computation" size="md">
        <div className="text-sm font-inter text-gray-600 space-y-4">
          <p>
            The final Priority Level is calculated using the Hybrid ML Engine that balances the natural hazard with the human impact factor.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 font-heading">Calculation Formula:</h4>
            <code className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded block mb-2">Priority = Vulnerability + Flood Hazard + Exposure</code>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Vulnerability (35%):</strong> Evaluates the at-risk demographics.</li>
              <li><strong>Flood Hazard (40%):</strong> Assesses the real-time reported depth and historical frequency.</li>
              <li><strong>Exposure (25%):</strong> Evaluates population density (Barangay Population relative to Total City Population).</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
