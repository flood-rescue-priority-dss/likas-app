import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CloudRain, Droplets, AlertTriangle, BarChart2, Plus, Calendar } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import PriorityBadge from '../components/ui/PriorityBadge';
import SearchInput from '../components/ui/SearchInput';
import LogIncidentModal from '../components/modals/LogIncidentModal';
import { floodService, geoService } from '../services';
import type { FloodIncident, RecurrenceHotspot, Barangay } from '../types';

export default function FloodRecordsDetailPage() {
  const { barangayId } = useParams<{ barangayId: string }>();

  const [barangay, setBarangay] = useState<Barangay | null>(null);
  const [incidents, setIncidents] = useState<FloodIncident[]>([]);
  const [hotspots, setHotspots] = useState<RecurrenceHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!barangayId) return;
    setLoading(true);
    Promise.all([
      geoService.getBarangayById(barangayId).catch(() => null),
      floodService.getFloodRecordsByBarangay(barangayId).catch(() => []),
      floodService.getRecurrenceHotspots(barangayId).catch(() => []),
    ]).then(([brgy, inc, hs]) => {
      setBarangay(brgy ?? null);
      setIncidents(inc || []);
      setHotspots(hs || []);
      setLoading(false);
    });
  }, [barangayId]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => {
      const matchSearch = !tableSearch ||
        i.street.toLowerCase().includes(tableSearch.toLowerCase()) ||
        i.cause.toLowerCase().includes(tableSearch.toLowerCase());
      const matchStart = !startDate || i.date >= startDate;
      const matchEnd = !endDate || i.date <= endDate;
      return matchSearch && matchStart && matchEnd;
    });
  }, [incidents, tableSearch, startDate, endDate]);

  const avgDepth = incidents.length
    ? Math.round(incidents.reduce((s, i) => s + i.depthInches, 0) / incidents.length)
    : 0;

  const avgPriorityScore = () => {
    if (!incidents.length) return 'N/A';
    const scores = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
    const avg = incidents.reduce((s, i) => s + (scores[i.priority] || 1), 0) / incidents.length;
    if (avg < 1.5) return 'Low';
    if (avg < 2.5) return 'Medium';
    if (avg < 3.5) return 'High';
    return 'Very High';
  };

  const handleIncidentSaved = (newIncident: FloodIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
    floodService.getRecurrenceHotspots(barangayId!).then(setHotspots);
  };

  const columns = [
    { key: 'date', header: 'Date (YY/MM/DD)', render: (r: FloodIncident) => r.date },
    { key: 'time', header: 'Time', render: (r: FloodIncident) => r.time },
    { key: 'street', header: 'Location', render: (r: FloodIncident) => (
      <span className="font-semibold text-gray-800">{r.street}</span>
    )},
    { key: 'depth', header: 'Depth (in)', render: (r: FloodIncident) => r.depthInches },
    { key: 'status', header: 'Status', render: (r: FloodIncident) => (
      <span className="px-2 py-0.5 rounded text-xs font-inter font-medium bg-gray-100 text-gray-600">{r.status}</span>
    )},
    { key: 'cause', header: 'Cause', render: (r: FloodIncident) => (
      <span className="text-xs font-inter text-gray-600">{r.cause}</span>
    )},
    { key: 'priority', header: 'Priority', render: (r: FloodIncident) => (
      <PriorityBadge priority={r.priority} size="sm" />
    )},
    { key: 'loggedByRole', header: 'Role', render: (r: FloodIncident) => (
      r.loggedByRole === 'admin'
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter font-semibold bg-blue-100 text-blue-700">MDRRMO</span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter font-semibold bg-slate-100 text-slate-600">Barangay</span>
    )},
  ];

  const districtName = 'District 5';
  const cityName = 'Port Area';
  const brgyName = barangay?.name ?? barangayId ?? '';

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10">
        <PageHeader
          title="FLOOD RECORDS"
          titleUppercase
          breadcrumbs={[
            { label: districtName, muted: true },
            { label: cityName, muted: true },
            { label: brgyName },
          ]}
          search={{ value: search, onChange: setSearch }}
          action={
            <button
              id="log-incident-btn"
              onClick={() => setLogOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C62828] hover:bg-red-800 text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={16} />
              Log Incident
            </button>
          }
        />

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Flood Records" value={loading ? '—' : incidents.length} />
          <MetricCard label="Avg. Depth" value={loading ? '—' : `${avgDepth} in`}
            icon={<Droplets size={14} className="text-sky-500" />} iconBg="bg-sky-50" />
          <MetricCard label="Total Incidents" value={loading ? '—' : filteredIncidents.length}
            icon={<CloudRain size={14} className="text-blue-500" />} iconBg="bg-blue-50" />
          <MetricCard label="Avg. Priority" value={loading ? '—' : avgPriorityScore()}
            icon={<AlertTriangle size={14} className="text-amber-500" />} iconBg="bg-amber-50" />
        </div>

<<<<<<< HEAD
        {/* Main content */}
=======
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

        {/* ── Main content ────────────────────────────────────────────────── */}
>>>>>>> 86a6aa86d4dd3d969cf91b8988ee57a5001b89bd
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Log */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 pt-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="font-heading font-bold text-gray-900 text-base">Incident Log</h2>
                  <p className="text-xs font-inter text-gray-400 mt-0.5">
                    All recorded flood events across {brgyName}
                  </p>
                </div>
                <SearchInput
                  value={tableSearch}
                  onChange={setTableSearch}
                  placeholder="Search Streets…"
                  className="w-full sm:w-48 flex-shrink-0"
                />
              </div>
              {/* Date filter */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs font-inter text-gray-500">Time Interval:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="pl-3 pr-3 py-1.5 text-xs font-inter border border-gray-200 rounded-lg bg-[#F0F4F7] focus:outline-none focus:ring-1 focus:ring-[#1B75BC]"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="pl-3 pr-3 py-1.5 text-xs font-inter border border-gray-200 rounded-lg bg-[#F0F4F7] focus:outline-none focus:ring-1 focus:ring-[#1B75BC]"
                />
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-xs font-inter text-[#1B75BC] hover:underline">Clear</button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
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
            <p className="text-xs font-inter text-gray-400 mb-5">Most affected streets</p>

            {loading ? (
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
                      {h.segmentLow > 0 && <div className="bg-emerald-400 rounded-full" style={{ flex: h.segmentLow }} />}
                      {h.segmentMedium > 0 && <div className="bg-amber-400 rounded-full" style={{ flex: h.segmentMedium }} />}
                      {h.segmentHigh > 0 && <div className="bg-red-400 rounded-full" style={{ flex: h.segmentHigh }} />}
                      {h.segmentVeryHigh > 0 && <div className="bg-[#C62828] rounded-full" style={{ flex: h.segmentVeryHigh }} />}
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-50 flex flex-wrap gap-3">
                  {[
                    { color: 'bg-emerald-400', label: 'Low' },
                    { color: 'bg-amber-400', label: 'Medium' },
                    { color: 'bg-red-400', label: 'High' },
                    { color: 'bg-[#C62828]', label: 'Very High' },
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
        barangayId={barangayId!}
        onSaved={handleIncidentSaved}
      />
    </>
  );
}
