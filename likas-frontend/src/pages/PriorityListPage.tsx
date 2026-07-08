import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import PriorityCard from '../components/ui/PriorityCard';
import StreetHistoryModal from '../components/modals/StreetHistoryModal';
import { priorityService } from '../services';
import type { PriorityItem, Priority } from '../types';

const FILTERS: Array<Priority | 'All'> = ['All', 'High', 'Medium', 'Low'];

export default function PriorityListPage() {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<PriorityItem | null>(null);

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
    <div className="p-10">
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
          <p className="font-inter text-sm">No streets match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 custom-scrollbar">
          {filtered.map(item => (
            <PriorityCard 
              key={item.id} 
              item={item} 
              onViewDetails={() => setSelectedItem(item)} 
            />
          ))}
        </div>
      )}

      <StreetHistoryModal 
        open={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  );
}
