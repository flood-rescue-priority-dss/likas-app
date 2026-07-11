import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import PriorityBadge from '../components/ui/PriorityBadge';
import MapPreview from '../components/ui/MapPreview';
import type { DistrictOverlay } from '../components/ui/MapPreview';
import { Users, Map, CloudRain, AlertTriangle, Clock } from 'lucide-react';
import { dashboardService } from '../services';
import type { DashboardSummary } from '../types';
import PriorityListPage from './PriorityListPage';
import PriorityCard from '../components/ui/PriorityCard';
import PopulationComparisonCard from '../components/ui/PopulationComparisonCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const MANILA_CENTER: [number, number] = [14.5995, 120.9842];

// One color per congressional district. Keys must match boundaries.json exactly.
const DISTRICT_OVERLAYS: DistrictOverlay[] = [
  { name: 'District 1', color: '#3b82f6' },   // blue
  { name: 'District 2', color: '#10b981' },   // emerald
  { name: 'District 3', color: '#f59e0b' },   // amber
  { name: 'District 4', color: '#8b5cf6' },   // violet
  { name: 'District 5', color: '#ef4444' },   // red
  { name: 'District 6', color: '#ec4899' },   // pink
];

function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.getDashboardSummary()
      .then(setData)
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setError(true);
      });
  }, []);

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K` :
    n.toLocaleString();

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <PageHeader
        title="DASHBOARD"
        titleUppercase
        search={{ value: search, onChange: setSearch, placeholder: 'Search...' }}
      />

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Population"
          value={data ? formatNum(data.totalPopulation) : '—'}
          icon={<Users size={16} className="text-[#1B75BC]" />}
          iconBg="bg-blue-50"
        />
        <MetricCard
          label="Total Streets"
          value={data ? data.totalStreets.toLocaleString() : '—'}
          icon={<Map size={16} className="text-emerald-500" />}
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="Total Flood Records"
          value={data ? formatNum(data.totalFloodRecords) : '—'}
          icon={<CloudRain size={16} className="text-sky-500" />}
          iconBg="bg-sky-50"
        />
        <MetricCard
          label="High Priority Areas"
          value={data ? data.highPriorityAreas : '—'}
          icon={<AlertTriangle size={16} className="text-[#C62828]" />}
          iconBg="bg-red-50"
          accent="text-[#C62828]"
        />
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-gray-800 text-base">City of Manila, Philippines</h2>
          {/* District color legend */}
          <div className="hidden sm:flex items-center gap-3 flex-wrap justify-end">
            {DISTRICT_OVERLAYS.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: d.color, borderColor: d.color }} />
                <span className="text-xs font-inter text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
        <MapPreview
          center={MANILA_CENTER}
          zoom={12}
          markerPosition={MANILA_CENTER}
          markerLabel="City of Manila"
          districtOverlays={DISTRICT_OVERLAYS}
          height="320px"
        />
        {/* Mobile legend */}
        <div className="sm:hidden flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
          {DISTRICT_OVERLAYS.map(d => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: d.color, borderColor: d.color }} />
              <span className="text-xs font-inter text-gray-500">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle row: Priority Cards (Full Width Horizontal Scroll) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mb-6">
        <div className="p-6 pb-2 flex justify-between items-center">
          <h2 className="font-heading font-semibold text-gray-800 text-base">Priority Ranking</h2>
          <button onClick={() => navigate('/dashboard/priority')} className="text-[#2563eb] hover:text-blue-700 font-inter text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer">
            View all <span className="text-lg leading-none">&rsaquo;</span>
          </button>
        </div>
        {error ? (
          <div className="flex items-center justify-center h-40 flex-col gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            <span className="text-gray-500 font-inter text-sm">Failed to connect to server</span>
          </div>
        ) : data ? (
          <div className="w-full pb-6 px-6">
            <div className="flex overflow-x-auto gap-4 pb-2 snap-x custom-scrollbar">
              {(data.topStreets || []).map((item) => (
                <div key={item.id || item.streetName} className="w-[300px] min-w-[300px] snap-start">
                  <PriorityCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="spinner-dark" />
          </div>
        )}
      </div>

      {/* Bottom row: Chart & Timeline (Admin Only) */}
      {user?.role === 'admin' && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PopulationComparisonCard />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-[420px]">
            <h2 className="font-heading font-semibold text-gray-800 text-base mb-4 flex items-center gap-2">
              <Clock size={18} className="text-[#1B75BC]" />
              Recent Flood Reports
            </h2>
            {data.recentFloods && data.recentFloods.length > 0 ? (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {data.recentFloods.map(flood => (
                  <div key={flood.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2 transition-colors hover:bg-white hover:border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-heading font-semibold text-gray-900 text-sm">{flood.street}</p>
                        <p className="font-inter text-xs text-gray-500 mt-0.5">{flood.barangayName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-gray-500 font-inter font-medium uppercase tracking-wider">Flood Level</span>
                        <PriorityBadge priority={flood.priority} size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/60">
                      <span className="font-inter text-xs font-medium text-gray-600">{flood.cause}</span>
                      <span className="font-inter text-xs text-gray-400">
                        {new Date(flood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {flood.time.substring(0, 5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                <span className="font-inter text-sm">No recent floods reported.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="priority" element={<PriorityListPage />} />
      </Routes>
    </>
  );
}
