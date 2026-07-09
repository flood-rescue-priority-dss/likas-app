import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Eye, Map as MapIcon, AlertTriangle } from 'lucide-react';
import PriorityBadge from '../components/ui/PriorityBadge';
import Modal from '../components/ui/Modal';
import MapPreview from '../components/ui/MapPreview';
import { priorityService, floodService } from '../services';
import type { PriorityItem, Priority, FloodIncident } from '../types';

const FILTERS: Array<Priority | 'All'> = ['All', 'High', 'Medium', 'Low'];

export default function PriorityListPage() {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedMapItem, setSelectedMapItem] = useState<PriorityItem | null>(null);
  const [streetFloods, setStreetFloods] = useState<FloodIncident[]>([]);
  const [loadingFloods, setLoadingFloods] = useState(false);

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

  const filtered = items.filter(i =>
    i.streetName.toLowerCase().includes(search.toLowerCase()) ||
    i.barangay.toLowerCase().includes(search.toLowerCase())
  );

  const FILTER_STYLE: Record<string, string> = {
    All: 'bg-[#050A30] text-white',
    High: 'bg-red-50 text-red-700 border border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    Low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <PageHeader
        title="PRIORITY LIST"
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-dark" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <AlertTriangle size={32} className="mb-3 text-gray-300" />
          <p className="font-inter text-sm">No streets match your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-gray-100">
                  <th className="py-3 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap text-center w-20">Rank</th>
                  <th className="py-3 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap w-32">Barangay</th>
                  <th className="py-3 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap">Location</th>
                  <th className="py-3 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap text-center w-28">Priority Level</th>
                  <th className="py-3 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap text-center w-64">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const barangayNum = item.barangay.replace(/Barangay /i, '');
                  return (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-6 text-sm font-inter text-gray-700 text-center">{i + 1}</td>
                      <td className="py-3 px-6 text-sm font-inter text-gray-700">{barangayNum}</td>
                      <td className="py-3 px-6 text-sm font-inter font-medium text-gray-900">{item.streetName}</td>
                      <td className="py-3 px-6 text-sm font-inter text-center">
                        <PriorityBadge priority={item.priority} size="sm" />
                      </td>
                      <td className="py-3 px-6 text-sm font-inter text-center">
                        <button 
                          onClick={() => setSelectedMapItem(item)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe] rounded-lg transition-colors font-medium text-xs font-inter w-full border border-[#bae6fd]"
                        >
                          <MapIcon size={14} />
                          View Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="font-inter text-[11px] text-gray-500 uppercase font-semibold mb-0.5">Vulnerability</span>
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
    </div>
  );
}
