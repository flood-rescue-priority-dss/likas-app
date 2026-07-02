import React from 'react';
import { MapPin, TrendingUp, Droplets } from 'lucide-react';
import type { PriorityItem } from '../../types';
import PriorityBadge from './PriorityBadge';

interface PriorityCardProps {
  item: PriorityItem;
  onClick?: () => void;
}

const SCORE_COLOR: Record<string, string> = {
  'High': 'text-red-500',
  'Medium': 'text-amber-500',
  'Low': 'text-emerald-600',
};

export default function PriorityCard({ item, onClick }: PriorityCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {/* Top bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <PriorityBadge priority={item.priority} />
        <span className={`text-xl font-heading font-bold ${SCORE_COLOR[item.priority]}`}>
          {item.priorityScore}
        </span>
      </div>

      {/* Map thumbnail placeholder */}
      <div className="mx-4 h-28 bg-gradient-to-br from-[#E8F1F8] to-[#D0E4F0] rounded-xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #1B75BC 0, #1B75BC 1px, transparent 1px, transparent 20px),
                              repeating-linear-gradient(90deg, #1B75BC 0, #1B75BC 1px, transparent 1px, transparent 20px)`,
          }}
        />
        <div className="flex flex-col items-center gap-1 z-10">
          <MapPin size={24} className="text-[#C62828]" />
          <span className="text-xs font-inter text-gray-500 font-medium">{item.barangay}</span>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4">
        <h3 className="font-heading font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {item.streetName}
        </h3>
        <p className="text-xs font-inter text-gray-500 mb-3">{item.barangay}</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-gray-400" />
            <span className="text-xs font-inter text-gray-500">Vuln: <span className="font-semibold text-gray-700">{item.vulnerabilityScore}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets size={12} className="text-gray-400" />
            <span className="text-xs font-inter text-gray-500">Floods: <span className="font-semibold text-gray-700">{item.floodCount}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
