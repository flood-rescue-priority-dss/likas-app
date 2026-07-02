import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import PriorityBadge from '../components/ui/PriorityBadge';
import MapPreview from '../components/ui/MapPreview';
import { Users, Map, CloudRain, AlertTriangle } from 'lucide-react';
import { dashboardService } from '../services';
import type { DashboardSummary } from '../types';
import PriorityListPage from './PriorityListPage';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function DashboardHome() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dashboardService.getDashboardSummary().then(setData);
  }, []);

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K` :
    n.toLocaleString();

  return (
    <div className="p-10">
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
        </div>
        <MapPreview
          center={[14.5995, 120.9842]}
          zoom={12}
          markerPosition={[14.5995, 120.9842]}
          markerLabel="City of Manila"
          height="320px"
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Barangays */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-4">Top Priority Barangays</h2>
          {data ? (
            <div className="space-y-3">
              {data.topBarangays.map((b, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F0F4F7] text-[#050A30] text-xs font-heading font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-inter font-medium text-gray-800">{b.name}</p>
                      <p className="text-xs font-inter text-gray-400">Water Depth: {b.waterDepth} in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-heading font-bold text-gray-700">{b.level}</span>
                    <PriorityBadge priority={b.level} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="spinner-dark" />
            </div>
          )}
        </div>

        {/* Population Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-4">Population Distribution</h2>
          {data ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.populationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="label"
                >
                  {data.populationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [String(value), String(name)]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Inter' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontFamily: 'Inter', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="spinner-dark" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell defaultExpanded={false}>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="priority" element={<PriorityListPage />} />
      </Routes>
    </AppShell>
  );
}
