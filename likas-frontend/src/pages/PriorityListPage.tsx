import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Eye, Map as MapIcon, AlertTriangle, Info } from 'lucide-react';
import PriorityBadge from '../components/ui/PriorityBadge';
import Modal from '../components/ui/Modal';
import MapPreview from '../components/ui/MapPreview';
import DataTable from '../components/ui/DataTable';
import StreetHistoryModal from '../components/modals/StreetHistoryModal';
import { priorityService, floodService } from '../services';
import type { PriorityItem, Priority, FloodIncident } from '../types';

const FILTERS: Array<Priority | 'All'> = ['All', 'High', 'Medium', 'Low'];

export default function PriorityListPage() {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedMapItem, setSelectedMapItem] = useState<PriorityItem | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PriorityItem | null>(null);
  const [streetFloods, setStreetFloods] = useState<FloodIncident[]>([]);
  const [loadingFloods, setLoadingFloods] = useState(false);
  const [showPrioInfo, setShowPrioInfo] = useState(false);
  const [showVulnInfo, setShowVulnInfo] = useState(false);

  useEffect(() => {
    if (selectedMapItem && selectedMapItem.barangayId) {
      setLoadingFloods(true);
      floodService.getFloodRecordsByBarangay(selectedMapItem.barangayId)
        .then(floods => {
          setStreetFloods(floods.filter(f => f.street === selectedMapItem.streetName));
          setLoadingFloods(false);
        })
        .catch(() => setLoadingFloods(false));
    } else {
      setStreetFloods([]);
    }
  }, [selectedMapItem]);

  useEffect(() => {
    setLoading(true);
    priorityService.getPriorityList(activeFilter).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [activeFilter]);

  const filtered = useMemo(() => {
    return items.filter(i =>
      i.streetName.toLowerCase().includes(search.toLowerCase()) ||
      i.barangay.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const FILTER_STYLE: Record<string, string> = {
    All: 'bg-[#050A30] text-white',
    High: 'bg-red-50 text-red-700 border border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    Low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };

  const dataWithRank = useMemo(() => {
    return filtered.map((item, i) => ({ ...item, rank: i + 1 }));
  }, [filtered]);

  const columns = [
    { key: 'rank', header: 'Rank', render: (r: any) => <div className="text-center">{r.rank}</div>, className: 'w-20', sortable: true, sortAccessor: (r: any) => r.rank },
    { key: 'barangay', header: 'Barangay', render: (r: any) => r.barangay.replace(/Barangay /i, ''), className: 'w-32', sortable: true },
    { key: 'streetName', header: 'Location', render: (r: any) => <span className="font-medium text-gray-900">{r.streetName}</span>, sortable: true },
    { key: 'priority', header: 'Priority Level', render: (r: any) => <div className="flex justify-center"><PriorityBadge priority={r.priority} size="sm" /></div>, className: 'w-32', sortable: true, sortAccessor: (r: any) => (r.priority === 'High' ? 3 : r.priority === 'Medium' ? 2 : r.priority === 'Low' ? 1 : 0) },
    { key: 'action', header: <div className="text-center">Action</div>, render: (r: any) => (
      <div className="flex justify-center gap-2">
        <button 
          onClick={() => setSelectedMapItem(r)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe] rounded-lg transition-colors font-medium text-xs font-inter w-full border border-[#bae6fd] max-w-[120px]"
        >
          <MapIcon size={14} />
          View Map
        </button>
      </div>
    ), className: 'w-40' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>PRIORITY LIST</span>
            <span className="text-[11px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center">
              AI-POWERED
            </span>
            <button 
              onClick={() => setShowPrioInfo(true)}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <Info size={18} />
            </button>
          </div>
        }
        titleUppercase
        search={{ value: search, onChange: setSearch, placeholder: 'Search streets...' }}
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-200 ${
              activeFilter === f
                ? FILTER_STYLE[f]
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-2 text-xs font-inter text-gray-400">
          {filtered.length} {filtered.length === 1 ? 'street' : 'streets'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <DataTable
          columns={columns}
          data={dataWithRank}
          keyExtractor={(r: any) => r.id}
          loading={loading}
          emptyMessage="No streets match your filter."
          showRowNumber={false}
        />
      </div>

      <Modal
        open={!!selectedMapItem}
        onClose={() => setSelectedMapItem(null)}
        title={selectedMapItem ? `${selectedMapItem.streetName} Map View` : 'Map View'}
        size="lg"
        headerRight={selectedMapItem ? <PriorityBadge priority={selectedMapItem.priority} size="sm" /> : undefined}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            {selectedMapItem && (
              <MapPreview
                center={[selectedMapItem.lat, selectedMapItem.lng]}
                zoom={16}
                markerPosition={[selectedMapItem.lat, selectedMapItem.lng]}
                markerLabel={selectedMapItem.streetName}
                highlightBoundary={selectedMapItem.barangay}
                height="350px"
              />
            )}
          </div>
          
          {selectedMapItem && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="font-inter text-[11px] text-gray-500 uppercase font-semibold mb-0.5">Priority Score</span>
                <span className="font-heading text-lg font-bold text-[#C62828]">{selectedMapItem.priorityScore?.toFixed(2)}</span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center text-center relative group">
                <span className="font-inter text-[11px] text-gray-500 uppercase font-semibold mb-0.5 flex items-center gap-1">
                  Vulnerability
                  <button onClick={() => setShowVulnInfo(true)} className="text-gray-400 hover:text-blue-500 transition-colors">
                    <Info size={12} />
                  </button>
                </span>
                <span className="font-heading text-lg font-bold text-gray-700">{selectedMapItem.vulnerabilityScore?.toFixed(2)}</span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="font-inter text-[11px] text-gray-500 uppercase font-semibold mb-0.5">Flood History</span>
                <span className="font-heading text-lg font-bold text-gray-700">{selectedMapItem.floodCount} Incidents</span>
              </div>
            </div>
          )}
          
          {selectedMapItem && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mt-1 h-48 flex flex-col">
              <h3 className="font-heading font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-[#C62828]" />
                Recent Incident Reports
              </h3>
              
              {loadingFloods ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="spinner-dark w-6 h-6 border-2" />
                </div>
              ) : streetFloods.length > 0 ? (
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 flex flex-col gap-2">
                  {streetFloods.map(flood => (
                    <div key={flood.id} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 flex justify-between items-center text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-inter font-medium text-gray-800">{flood.cause}</span>
                        <span className="font-inter text-xs text-gray-500">
                          {new Date(flood.date).toLocaleDateString()} at {flood.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-inter text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">
                          {flood.depthInches} inches
                        </span>
                        <PriorityBadge priority={flood.priority} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm font-inter text-gray-400">
                  No detailed incident history available for this street.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <StreetHistoryModal
        open={!!selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
        item={selectedHistoryItem}
      />

      <Modal open={showPrioInfo} onClose={() => setShowPrioInfo(false)} title="Priority Computation" size="md">
        <div className="text-sm font-inter text-gray-600 space-y-4">
          <p>
            The Priority Score determines the ranking of streets during flood incidents. It is calculated using an advanced Hybrid ML Engine that combines historical vulnerability data with real-time hazard severity.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 font-heading">Calculation Formula:</h4>
            <code className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded block mb-2">Priority = Vulnerability + Flood Hazard + Exposure</code>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Vulnerability (35%):</strong> Evaluates the at-risk demographics (Seniors, PWDs, Pregnant, Children).</li>
              <li><strong>Flood Hazard (40%):</strong> Assesses the real-time reported depth and historical frequency.</li>
              <li><strong>Exposure (25%):</strong> Evaluates population density (Barangay Population relative to Total City Population).</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal open={showVulnInfo} onClose={() => setShowVulnInfo(false)} title="Vulnerability Index" size="sm">
        <div className="text-sm font-inter text-gray-600 space-y-3">
          <p>
            The Vulnerability Score is computed per capita, normalized on a 0-100 scale, based on the street's demographic profile.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-gray-800 mb-1 text-xs uppercase tracking-wider">Formula Weights:</h4>
            <ul className="space-y-1 text-xs font-medium">
              <li>• Seniors: <span className="text-blue-700">35%</span></li>
              <li>• PWDs: <span className="text-blue-700">35%</span></li>
              <li>• Pregnant: <span className="text-blue-700">20%</span></li>
              <li>• Children: <span className="text-blue-700">10%</span></li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
