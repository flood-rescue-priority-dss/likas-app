import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CloudRain, Droplets, AlertTriangle, BarChart2, Plus, Pencil, Trash2, Database, Archive, Info, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import PriorityBadge from '../components/ui/PriorityBadge';
import SearchInput from '../components/ui/SearchInput';
import DropdownSelect from '../components/ui/DropdownSelect';
import LogIncidentModal from '../components/modals/LogIncidentModal';
import EditIncidentModal from '../components/modals/EditIncidentModal';
import DeleteIncidentModal from '../components/modals/DeleteIncidentModal';
import AttachmentLightboxModal from '../components/modals/AttachmentLightboxModal';
import Modal from '../components/ui/Modal';
import { floodService, geoService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { FloodIncident, RecurrenceHotspot, District, City, Barangay } from '../types';

export default function FloodRecordsDetailPage() {
  const { barangayId: routeBarangayId } = useParams<{ barangayId: string }>();
  const { user } = useAuth();
  const isBarangay = user?.role === 'barangay';

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // ── Year filter state ─────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // ── Geography filter state ────────────────────────────────────────────────
  const [districts, setDistricts]   = useState<District[]>([]);
  const [cities,    setCities]      = useState<City[]>([]);
  const [barangays, setBarangays]   = useState<Barangay[]>([]);

  const [districtId, setDistrictId] = useState<string>('ALL');
  const [cityId,     setCityId]     = useState<string>('ALL');
  const [barangayId, setBarangayId] = useState<string>(routeBarangayId ?? 'ALL');

  // ── Date filter state ─────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');

  // ── Data state ────────────────────────────────────────────────────────────
  const [incidents, setIncidents] = useState<FloodIncident[]>([]);
  const [hotspots,  setHotspots]  = useState<RecurrenceHotspot[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tableSearch, setTableSearch] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<FloodIncident | null>(null);

  // ── Lightbox state ────────────────────────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ── Load geography dropdowns on mount (admin only) ────────────────────────
  useEffect(() => {
    if (isBarangay) return;
    geoService.getDistricts().then(setDistricts);
  }, [isBarangay]);

  // ── Load available years on mount ─────────────────────────────────────────
  useEffect(() => {
    floodService.getAvailableYears().then(years => {
      setAvailableYears(years);
      // If current year is not in the list, default to the most recent year
      if (years.length > 0 && !years.includes(currentYear)) {
        setSelectedYear(years[0]);
      }
    });
  }, [currentYear]);

  // ── Barangay-role users: auto-scope to their own barangay ─────────────────
  // Barangay accounts don't hit this page with a :barangayId in the route,
  // so we pull it from the signed-in user instead — otherwise barangayId is
  // stuck on 'ALL' and hotspots (which require a specific barangay) never load.
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

  // ── Resolve which barangays are in scope given the current filters ───────
  // Mirrors the same district → city → barangay traversal the dropdowns use
  // (getCitiesByDistrict / getBarangaysByCity), since the backend has no
  // single "get all flood records" endpoint — only GET /flood/:barangayId.
  const resolveScopeBarangayIds = async (): Promise<string[]> => {
    if (barangayId !== 'ALL') return [barangayId];

    if (cityId !== 'ALL') {
      const bs = barangays.length ? barangays : await geoService.getBarangaysByCity(cityId);
      return bs.map(b => b.id);
    }

    if (districtId !== 'ALL') {
      const cs = cities.length ? cities : await geoService.getCitiesByDistrict(districtId);
      const barangayLists = await Promise.all(cs.map(c => geoService.getBarangaysByCity(c.id)));
      return barangayLists.flat().map(b => b.id);
    }

    // Fully unfiltered — we don't need to return all IDs anymore, we just return 'ALL' or similar.
    // The new endpoint will handle everything if we just don't pass specific IDs.
    return [];
  };

  // ── Fetch flood records whenever filters change ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Determine which year to query based on the active tab
        const queryYear = activeTab === 'active' ? currentYear : selectedYear;
        
        const results = await floodService.getFloodRecordsFiltered({
          districtId: districtId !== 'ALL' ? districtId : undefined,
          cityId: cityId !== 'ALL' ? cityId : undefined,
          barangayId: barangayId !== 'ALL' ? barangayId : undefined,
          year: queryYear,
        });
        
        const merged = results.filter(i =>
          (!startDate || i.date >= startDate) &&
          (!endDate   || i.date <= endDate)
        );
        if (!cancelled) { setIncidents(merged); setLoading(false); }
      } catch {
        if (!cancelled) { setIncidents([]); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [districtId, cityId, barangayId, startDate, endDate, activeTab, selectedYear, currentYear]);

  // Hotspots: only meaningful when a single barangay is selected
  useEffect(() => {
    if (barangayId && barangayId !== 'ALL') {
      floodService.getRecurrenceHotspots(barangayId).then(setHotspots).catch(() => setHotspots([]));
    } else {
      setHotspots([]);
    }
  }, [barangayId]);

  // ── Client-side table search filter ──────────────────────────────────────
  const filteredIncidents = useMemo(() => incidents.filter(i =>
    !tableSearch ||
    i.street.toLowerCase().includes(tableSearch.toLowerCase()) ||
    i.cause.toLowerCase().includes(tableSearch.toLowerCase())
  ), [incidents, tableSearch]);

  // ── Derived metrics ───────────────────────────────────────────────────────
  const avgDepth = incidents.length
    ? Math.round(incidents.reduce((s, i) => s + i.depthInches, 0) / incidents.length)
    : 0;

  const avgPriorityScore = () => {
    if (!incidents.length) return 'N/A';
    const scores: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
    const avg = incidents.reduce((s, i) => s + (scores[i.priority] || 1), 0) / incidents.length;
    if (avg < 1.5) return 'Low';
    if (avg < 2.5) return 'Medium';
    return 'High';
  };

  const handleIncidentSaved = (newIncident: FloodIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
    if (barangayId && barangayId !== 'ALL') {
      floodService.getRecurrenceHotspots(barangayId).then(setHotspots);
    }
  };

  const handleIncidentUpdated = (updatedIncident: FloodIncident) => {
    setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
    if (barangayId && barangayId !== 'ALL') {
      floodService.getRecurrenceHotspots(barangayId).then(setHotspots);
    }
  };

  const handleIncidentDeleted = (deletedId: string) => {
    setIncidents(prev => prev.filter(i => i.id !== deletedId));
    if (barangayId && barangayId !== 'ALL') {
      floodService.getRecurrenceHotspots(barangayId).then(setHotspots);
    }
  };

  const handleEditClick = (incident: FloodIncident) => {
    setSelectedIncident(incident);
    setEditOpen(true);
  };

  const handleDeleteClick = (incident: FloodIncident) => {
    setSelectedIncident(incident);
    setDeleteOpen(true);
  };

  const handleViewAttachment = (incident: FloodIncident) => {
    setSelectedIncident(incident);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const priorityOrdinal = (p?: string) => (p === 'High' ? 3 : p === 'Medium' ? 2 : p === 'Low' ? 1 : 0);

  const columns = [
    { 
      key: 'street', 
      header: 'Location',    
      render: (r: FloodIncident) => <span className="font-semibold text-gray-800">{r.street}</span>,
      sticky: true,
      sortable: true,
      className: 'min-w-[200px] w-[24%]'
    },
    { key: 'date',   header: 'Date',        render: (r: FloodIncident) => r.date, sortable: true },
    { key: 'time',   header: 'Time',        render: (r: FloodIncident) => r.time, sortable: true },
    { key: 'depth',  header: 'Depth (in)',  render: (r: FloodIncident) => r.depthInches, sortable: true, sortAccessor: (r: FloodIncident) => r.depthInches },
    { key: 'status', header: 'Status',      render: (r: FloodIncident) => (
      <span className="px-2 py-0.5 rounded text-xs font-inter font-medium bg-gray-100 text-gray-600">{r.status}</span>
    ), sortable: true },
    { key: 'cause',  header: 'Cause',       render: (r: FloodIncident) => (
      <span className="text-xs font-inter text-gray-600">{r.cause}</span>
    ), sortable: true },
    { key: 'priority', header: 'Priority',  render: (r: FloodIncident) => <PriorityBadge priority={r.priority} size="sm" />, sortable: true, sortAccessor: (r: FloodIncident) => priorityOrdinal(r.priority) },
    { key: 'loggedByRole', header: 'Role/Affiliation', sortable: true, render: (r: FloodIncident) => {
      if (r.loggedByRole === 'admin') {
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-inter font-semibold bg-blue-100 text-blue-700">
            MDRRMO
          </span>
        );
      }

      // Look up the barangay name or fallback to just 'Barangay'
      const bName = (r as any).barangayName || barangays.find(b => b.id === r.barangayId)?.name || 'Barangay';

      return (
        <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-inter font-semibold bg-slate-100 text-slate-600">
          {bName}
        </span>
      );
    }},
    { key: 'loggedByEmail', header: 'Logged By', sortable: true, render: (r: FloodIncident) => (
      <span className="text-xs font-inter text-gray-700 font-medium">{r.loggedByEmail}</span>
    )},
    ...(user?.role === 'admin' || isBarangay ? [{
      key: 'actions',
      header: 'Actions',
      render: (r: FloodIncident) => (
        <div className="flex items-center gap-2">
          {r.remarksAttachment && (
            <button
              onClick={() => handleViewAttachment(r)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View attachment"
            >
              <Eye size={16} />
            </button>
          )}
          <button
            onClick={() => handleEditClick(r)}
            className="p-1.5 text-gray-600 hover:text-[#1B75BC] hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit incident"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(r)}
            className="p-1.5 text-gray-600 hover:text-[#C62828] hover:bg-red-50 rounded-lg transition-colors"
            title="Delete incident"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }] : []),
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

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Page header */}
        <PageHeader
          title="FLOOD RECORDS"
          titleUppercase
          action={
            <div className="relative group">
              <button
                id="log-incident-btn"
                onClick={() => setLogOpen(true)}
                disabled={!isBarangay && barangayId === 'ALL'}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#C62828] hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={16} />
                Log Incident
              </button>
              {!isBarangay && barangayId === 'ALL' && (
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50 animate-fadeIn">
                  <div className="bg-[#2D3748] text-white text-xs font-inter px-4 py-3 rounded-lg shadow-xl min-w-[280px]">
                    <p className="font-medium text-gray-200 leading-relaxed">
                      Please select District, Area, and Barangay to log an Incident
                    </p>
                    <div className="absolute bottom-full right-4 mb-[-4px]">
                      <div className="border-[6px] border-transparent border-b-[#2D3748]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <MetricCard 
            label="Total Flood Records" 
            value={loading ? '-' : incidents.length} 
            icon={<Database size={14} className="text-indigo-500" />}
            iconBg="bg-indigo-50"
          />
          <MetricCard
            label="Avg. Depth"
            value={loading ? '—' : `${avgDepth} in`}
            icon={<Droplets size={14} className="text-sky-500" />}
            iconBg="bg-sky-50"
          />
          <MetricCard
            label="Filtered Incidents"
            value={loading ? '—' : filteredIncidents.length}
            icon={<CloudRain size={14} className="text-blue-500" />}
            iconBg="bg-blue-50"
          />
          <MetricCard
            label="Avg. Priority"
            value={loading ? '—' : avgPriorityScore()}
            icon={<AlertTriangle size={14} className="text-amber-500" />}
            iconBg="bg-amber-50"
          />
        </div>

        {/* ── Unified filter bar ──────────────────────────────────────────── */}
        {!isBarangay && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6">
            <div className="flex flex-wrap items-center gap-5">
              {/* Label */}
              <span className="text-sm font-inter font-medium text-gray-800 uppercase  whitespace-nowrap">
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

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200" />

              {/* Date range */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-inter text-gray-500 whitespace-nowrap">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 text-xs font-inter border border-gray-200 rounded-xl bg-[#F0F4F7] focus:outline-none focus:ring-1 focus:ring-[#1B75BC]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-inter text-gray-500 whitespace-nowrap">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 text-xs font-inter border border-gray-200 rounded-xl bg-[#F0F4F7] focus:outline-none focus:ring-1 focus:ring-[#1B75BC]"
                />
              </div>

              {/* Clear */}
              {(districtId !== 'ALL' || cityId !== 'ALL' || barangayId !== 'ALL' || startDate || endDate) && (
                <button
                  onClick={() => {
                    setDistrictId('ALL'); setCityId('ALL'); setBarangayId('ALL');
                    setCities([]); setBarangays([]);
                    setStartDate(''); setEndDate('');
                  }}
                  className="text-xs font-inter text-[#1B75BC] hover:underline whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Time interval filter for barangay-role users (admins get date range in the bar above) */}
        {isBarangay && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-inter font-medium text-gray-800 uppercase whitespace-nowrap">
                Time Interval:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 text-xs font-inter border border-gray-200 rounded-xl bg-[#F0F4F7] focus:outline-none focus:ring-1 focus:ring-[#1B75BC]"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 text-xs font-inter border border-gray-200 rounded-xl bg-[#F0F4F7] focus:outline-none focus:ring-1 focus:ring-[#1B75BC]"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs font-inter text-[#1B75BC] hover:underline whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Log */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 pt-6 pb-4">
              {/* Tabs and Year Filter */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all ${
                      activeTab === 'active'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Database size={14} />
                    Active Records
                  </button>
                  <button
                    onClick={() => setActiveTab('archived')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all ${
                      activeTab === 'archived'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Archive size={14} />
                    Archived Flood Records
                  </button>
                </div>

                {/* Year Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-inter text-gray-500 uppercase">Year</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="pl-3 pr-8 py-2 text-sm font-inter border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1B75BC] cursor-pointer appearance-none bg-no-repeat bg-[right_0.65rem_center] bg-[length:10px]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")" }}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="font-heading font-bold text-gray-900 text-base">
                    {activeTab === 'active' ? 'Incident Log' : 'Archived Incident Log'}
                  </h2>
                  <p className="text-xs font-inter text-gray-400 mt-0.5">
                    {activeTab === 'active' 
                      ? `Approved flood events from ${selectedYear}` 
                      : `Historical records partitioned for ${selectedYear}`}
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
            <div className="overflow-x-auto flood-records-table">
              <DataTable
                columns={columns as any}
                data={filteredIncidents}
                keyExtractor={r => r.id}
                loading={loading}
                pageSize={8}
              />
            </div>
          </div>

          {/* Recurrence Hotspots */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={16} className="text-gray-400" />
              <h2 className="font-heading font-bold text-gray-900 text-base">Recurrence Hotspots</h2>
            </div>
            <p className="text-xs font-inter text-gray-400 mb-5">
              {barangayId !== 'ALL' ? 'Most affected streets' : 'Select a barangay to view hotspots'}
            </p>

            {barangayId === 'ALL' ? (
              <p className="text-sm font-inter text-gray-400 text-center py-8">
                Filter by a specific barangay to see hotspot data.
              </p>
            ) : loading ? (
              <div className="flex items-center justify-center h-40"><div className="spinner-dark" /></div>
            ) : hotspots.length === 0 ? (
              <p className="text-sm font-inter text-gray-400 text-center py-8">No hotspots recorded.</p>
            ) : (
              <div className="space-y-5">
                {hotspots.map((h, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-inter font-semibold text-gray-800">{h.street}</span>
                      <span className="text-xs font-inter text-gray-400">
                        {h.eventCount} {h.eventCount === 1 ? 'event' : 'events'}
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                      {h.segmentLow      > 0 && <div className="bg-emerald-400 rounded-full" style={{ flex: h.segmentLow }} />}
                      {h.segmentMedium   > 0 && <div className="bg-amber-400 rounded-full"   style={{ flex: h.segmentMedium }} />}
                      {h.segmentHigh     > 0 && <div className="bg-red-400 rounded-full"     style={{ flex: h.segmentHigh }} />}
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-50 flex flex-wrap gap-3">
                  {[
                    { color: 'bg-emerald-400', label: 'Low' },
                    { color: 'bg-amber-400',   label: 'Medium' },
                    { color: 'bg-red-400',     label: 'High' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-xs font-inter text-gray-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogIncidentModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        barangayId={barangayId !== 'ALL' && barangayId ? barangayId : (isBarangay ? ((user as any)?.barangayId ?? user?.id ?? '') : '')}
        onSaved={handleIncidentSaved}
      />

      <EditIncidentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        incident={selectedIncident}
        onSaved={handleIncidentUpdated}
      />

      <DeleteIncidentModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        incidentId={selectedIncident?.id ?? null}
        onDeleted={handleIncidentDeleted}
      />

      {/* Attachment Lightbox Modal */}
      {selectedIncident && (
        <AttachmentLightboxModal
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          imageUrl={selectedIncident.remarksAttachment || ''}
          date={selectedIncident.date}
          time={selectedIncident.time}
          loggedBy={selectedIncident.loggedByEmail || 'Unknown'}
          street={selectedIncident.street}
        />
      )}
    </>
  );
}
