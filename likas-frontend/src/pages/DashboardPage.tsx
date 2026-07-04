import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="p-6 pb-4">
            <h2 className="font-heading font-semibold text-gray-800 text-base">Priority Ranking</h2>
          </div>
          {data ? (
            <div className="flex flex-col w-full pb-6 flex-1">
              <div className="w-full mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-y border-gray-100">
                      <th className="py-4 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap text-center w-20">Rank</th>
                      <th className="py-4 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap w-32">Barangay</th>
                      <th className="py-4 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap">Location</th>
                      <th className="py-4 px-6 font-heading font-semibold text-[#475569] text-sm whitespace-nowrap text-center w-24">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topStreets.map((s, i) => {
                      const barangayNum = s.barangay.replace(/Barangay /i, '');
                      return (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-inter text-gray-700 text-center">{i + 1}</td>
                          <td className="py-4 px-6 text-sm font-inter text-gray-700">{barangayNum}</td>
                          <td className="py-4 px-6 text-sm font-inter text-gray-700">{s.street}</td>
                          <td className="py-4 px-6 text-sm font-inter text-center">
                            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#fee2e2] text-[#ef4444] font-medium text-xs font-inter w-20">
                              {s.level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="w-full flex justify-center mt-auto pb-2">
                <button onClick={() => navigate('/dashboard/priority')} className="text-[#2563eb] hover:text-blue-700 font-inter text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer">
                  View all <span className="text-lg leading-none">&rsaquo;</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="spinner-dark" />
            </div>
          )}
        </div>

        {/* Population Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center h-full">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-4 w-full text-left">Population Distribution</h2>
          {data ? (
            <div className="flex flex-col w-full flex-1">
              <div className="w-full mb-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[...data.populationDistribution].sort((a, b) => b.count - a.count)}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="label"
                      stroke="none"
                    >
                      {[...data.populationDistribution].sort((a, b) => b.count - a.count).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [String(value), String(name)]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Inter' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full flex justify-center mt-auto pb-2 flex-wrap gap-x-4 gap-y-2">
                {[...data.populationDistribution].sort((a, b) => b.count - a.count).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-inter text-[13px] font-medium" style={{ color: item.color }}>
                      {item.label}
                    </span>
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
