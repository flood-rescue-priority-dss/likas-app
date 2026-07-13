import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Map, TrendingUp, Shield } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import PriorityBadge from '../components/ui/PriorityBadge';
import MapPreview from '../components/ui/MapPreview';
import SearchInput from '../components/ui/SearchInput';
import DropdownSelect from '../components/ui/DropdownSelect';
import { streetService, geoService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { StreetRegistryEntry, District, City, Barangay } from '../types';


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
    { key: 'floodLevel', header: 'Flood Level', sortable: true, sortAccessor: r => r.priorityScore, render: r => {
      const level = getFloodLevel(r.priorityScore);
      return <PriorityBadge priority={level as any} size="sm" />;
    }},
    { key: 'vulnerabilityScore', header: 'Vulnerability', sortable: true, sortAccessor: r => r.vulnerabilityScore, render: r => {
      const vulnLevel = getFloodLevel(r.vulnerabilityScore);
      return <PriorityBadge priority={vulnLevel as any} size="sm" />;
    }},
    { key: 'priority', header: 'Priority', sortable: true, sortAccessor: r => (r.priority === 'High' ? 3 : r.priority === 'Medium' ? 2 : r.priority === 'Low' ? 1 : 0), render: r => <PriorityBadge priority={r.priority} size="sm" /> },
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
                  zoom={selectedStreet ? 17 : 15}
                  markerPosition={markerPos}
                  markerLabel={selectedStreet?.streetName ?? scopeLabel}
                  highlightBoundary={selectedBarangay?.name ?? selectedCity?.name ?? selectedDistrict?.name}
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
    </>
  );
}
