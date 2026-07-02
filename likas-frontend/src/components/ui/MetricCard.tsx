import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  subtext?: string;
  accent?: string;
}

export default function MetricCard({ label, value, icon, iconBg, subtext, accent }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-inter font-medium text-gray-500 leading-snug">{label}</p>
        {icon && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconBg ?? 'bg-[#F0F4F7]'}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-heading font-bold leading-tight truncate ${accent ?? 'text-gray-900'}`}>
        {value}
      </p>
      {subtext && <p className="text-xs font-inter text-gray-400">{subtext}</p>}
    </div>
  );
}
