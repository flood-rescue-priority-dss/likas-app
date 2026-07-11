import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, AlertTriangle, Users } from 'lucide-react';
import { geoService, dashboardService } from '../../services';
import type { Barangay } from '../../types';

export default function PopulationComparisonCard() {
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [maxCount, setMaxCount] = useState<number>(5);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geoService.getAllBarangays()
      .then(setBarangays)
      .catch(err => {
        console.error('Failed to load barangays:', err);
        setError('Failed to load barangay list.');
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= maxCount) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleMaxCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMax = parseInt(e.target.value, 10);
    setMaxCount(newMax);
    if (selectedIds.length > newMax) {
      setSelectedIds(prev => prev.slice(0, newMax));
    }
  };

  const handleLoad = async () => {
    if (selectedIds.length === 0) {
      setChartData([]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setIsDropdownOpen(false);
    
    try {
      const data = await dashboardService.getPopulationComparison(selectedIds);
      setChartData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch population data.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
      <h2 className="font-heading font-semibold text-gray-800 text-base mb-4 w-full text-left flex items-center gap-2">
        <Users size={18} className="text-[#1B75BC]" />
        Population per Barangay
      </h2>

      {/* Controls Container */}
      <div className="w-full mb-6">
        
        {/* Max Count Selector */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label htmlFor="maxCount" className="text-sm font-inter text-gray-700 font-medium">
            Number of barangays to compare:
          </label>
          <div className="relative">
            <select 
              id="maxCount"
              value={maxCount}
              onChange={handleMaxCountChange}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-inter text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B75BC] focus:border-transparent transition-all cursor-pointer"
            >
              {[2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-inter text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1B75BC] focus:border-transparent transition-all"
            >
              <span className="truncate">Select up to {maxCount} Barangays...</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 custom-scrollbar">
                {barangays.map(b => {
                  const isSelected = selectedIds.includes(b.id);
                  const disabled = !isSelected && selectedIds.length >= maxCount;
                  return (
                    <div
                      key={b.id}
                      onClick={() => !disabled && toggleSelection(b.id)}
                      className={`px-4 py-2 text-sm font-inter cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[#1B75BC]/10 text-[#1B75BC] font-medium' 
                          : disabled 
                            ? 'opacity-50 cursor-not-allowed text-gray-400' 
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {b.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleLoad}
            disabled={isLoading || selectedIds.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#050A30] hover:bg-[#0a1545] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-inter font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Load
          </button>
        </div>

        {/* Selected Tags Indicator */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-inter font-medium text-gray-500">
              {selectedCount}/{maxCount} Selected
            </span>
          </div>
          {selectedIds.map(id => {
            const bName = barangays.find(b => b.id === id)?.name || id;
            return (
              <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-inter font-medium bg-[#050A30]/10 text-[#050A30] border border-[#050A30]/20">
                {bName}
              </span>
            );
          })}
          {selectedCount > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-inter font-medium text-[#C62828] hover:text-red-800 transition-colors underline decoration-dotted underline-offset-2 ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-64 flex-col gap-2 w-full bg-gray-50 rounded-xl">
          <AlertTriangle className="text-red-500" size={24} />
          <span className="text-gray-500 font-inter text-sm">{error}</span>
        </div>
      ) : chartData.length > 0 ? (
        <div className="flex flex-col w-full flex-1 min-h-[350px]">
          <div className="w-full">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  shared={false}
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Inter' }}
                />
                <Bar dataKey="general" stackId="a" fill="#8B5CF6" name="General Population" />
                <Bar dataKey="children" stackId="a" fill="#38BDF8" name="Children" />
                <Bar dataKey="senior" stackId="a" fill="#F97316" name="Senior" />
                <Bar dataKey="pwd" stackId="a" fill="#EAB308" name="PWD" />
                <Bar dataKey="pregnant" stackId="a" fill="#EC4899" name="Pregnant Women" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#8B5CF6]" /><span className="font-inter text-[11px] text-gray-600">General Population</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#38BDF8]" /><span className="font-inter text-[11px] text-gray-600">Children</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#F97316]" /><span className="font-inter text-[11px] text-gray-600">Senior</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#EAB308]" /><span className="font-inter text-[11px] text-gray-600">PWD</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#EC4899]" /><span className="font-inter text-[11px] text-gray-600">Pregnant Women</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Users size={32} className="text-gray-300 mb-2" />
          <p className="text-sm font-inter text-gray-500">Select barangays and click Load</p>
        </div>
      )}
    </div>
  );
}
