import React, { useEffect, useRef, useState } from 'react';
import { MapPin, TrendingUp, Droplets } from 'lucide-react';
import type { PriorityItem } from '../../types';
import PriorityBadge from './PriorityBadge';
import MapPreview from './MapPreview';

interface PriorityCardProps {
  item: PriorityItem;
  onViewDetails?: () => void;
}

const SCORE_COLOR: Record<string, string> = {
  'High': 'text-red-500',
  'Medium': 'text-amber-500',
  'Low': 'text-emerald-600',
};

export default function PriorityCard({ item, onViewDetails }: PriorityCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col h-full"
    >
      {/* Top bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <PriorityBadge priority={item.priority} size="sm" />
        <span className={`text-xl font-heading font-bold ${SCORE_COLOR[item.priority] || 'text-gray-900'}`}>
          {item.priorityScore}
        </span>
      </div>

      {/* Static Literal Map Thumbnail */}
      <div className="mx-3 h-28 rounded-xl overflow-hidden relative bg-gray-50 flex items-center justify-center">
        {isVisible ? (
          <MapPreview
            center={[item.lat, item.lng]}
            zoom={16}
            markerPosition={[item.lat, item.lng]}
            height="100%"
            className="border-0 rounded-xl w-full"
            interactive={false}
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <div className="spinner-dark w-6 h-6 mb-2" />
            <span className="text-xs font-inter font-medium">Loading Map...</span>
          </div>
        )}
        
        {/* Overlay block to intercept ANY accidental clicks if Leaflet misses something */}
        <div className="absolute inset-0 z-[1000] cursor-default bg-transparent"></div>
      </div>



      {/* Details */}
      <div className="px-4 py-3">
        <h3 className="font-heading font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {item.streetName}
        </h3>
        <p className="text-xs font-inter text-gray-500 mb-2">{item.barangay}</p>

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

      {onViewDetails && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50 mt-auto transition-colors group-hover:bg-[#1B75BC]/5">
          <button 
            onClick={onViewDetails}
            className="w-full text-center text-xs font-inter font-semibold text-[#1B75BC] hover:text-[#050A30] transition-colors"
          >
            View Details & History
          </button>
        </div>
      )}
    </div>
  );
}
