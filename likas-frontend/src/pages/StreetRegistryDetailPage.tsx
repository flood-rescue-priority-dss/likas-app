import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Map, TrendingUp, Shield, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import PriorityBadge from '../components/ui/PriorityBadge';
import MapPreview from '../components/ui/MapPreview';
import { streetService, geoService } from '../services';
import type { StreetRegistryEntry, Barangay } from '../types';


export default function StreetRegistryDetailPage() {
  const { barangayId } = useParams<{ barangayId: string }>();
  const [barangay, setBarangay] = useState<Barangay | null>(null);
  const [streets, setStreets] = useState<StreetRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreet, setSelectedStreet] = useState<StreetRegistryEntry | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!barangayId) return;
    setLoading(true);
    Promise.all([
      geoService.getBarangayById(barangayId),
      streetService.getStreetRegistry(barangayId),
    ]).then(([brgy, strs]) => {
      setBarangay(brgy ?? null);
      setStreets(strs);
      setSelectedStreet(null); // Don't pre-select, wait for user click
      setLoading(false);
    });
  }, [barangayId]);

  const filteredStreets = streets.filter(s =>
    s.streetName.toLowerCase().includes(search.toLowerCase())
  );

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
    { key: 'streetName', header: 'Location', render: r => (
      <span className="font-semibold text-gray-800">{r.streetName}</span>
    )},
    { key: 'floodLevel', header: 'Flood Level', render: r => {
      const level = getFloodLevel(r.priorityScore);
      return <PriorityBadge priority={level as any} size="sm" />;
    }},
    { key: 'vulnerabilityScore', header: 'Vulnerability', render: r => {
      const vulnLevel = getFloodLevel(r.vulnerabilityScore);
      return <PriorityBadge priority={vulnLevel as any} size="sm" />;
    }},
    { key: 'priority', header: 'Priority', render: r => <PriorityBadge priority={r.priority} size="sm" /> },
    { key: 'lastUpdated', header: 'Last Updated', render: r => (
      <span className="text-gray-500 text-xs">{r.lastUpdated ? r.lastUpdated.split('T')[0] : 'N/A'}</span>
    )},
  ];

  const brgyName = barangay?.name ?? barangayId ?? '';
  const mapCenter: [number, number] = barangay
    ? [barangay.lat, barangay.lng]
    : [14.5931, 120.9748];
  const markerPos: [number, number] | undefined = selectedStreet
    ? [selectedStreet.lat, selectedStreet.lng]
    : undefined;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10">
        <PageHeader
          title="STREET REGISTRY"
          titleUppercase
          breadcrumbs={[
            { label: 'District 5', muted: true },
            { label: 'Port Area', muted: true },
            { label: brgyName },
          ]}
          search={{ value: search, onChange: setSearch, placeholder: 'Search' }}
        />

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-gray-800 text-sm">
              {selectedStreet ? selectedStreet.streetName : brgyName} — Map
            </h2>
            <span className="hidden sm:inline text-xs font-inter text-gray-400">Click a location row to update pin</span>
          </div>
          {loading ? (
            <div className="w-full bg-gray-100 animate-pulse rounded-xl" style={{ height: '360px' }} />
          ) : (
            <MapPreview
              center={mapCenter}
              zoom={selectedStreet ? 17 : 16}
              markerPosition={markerPos}
              markerLabel={selectedStreet ? selectedStreet.streetName : brgyName}
              highlightBoundary={brgyName}
              height="360px"
            />
          )}
        </div>

        {/* Streets table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h2 className="font-heading font-bold text-gray-900 text-base">All Locations</h2>
            <p className="text-xs font-inter text-gray-400 mt-0.5">
              {streets.length} available locations in {brgyName}
            </p>
          </div>
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
    </>
  );
}
