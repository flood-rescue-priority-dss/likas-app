import React from 'react';
import type { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

const CONFIG: Record<Priority, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  High: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
};

export default function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = CONFIG[priority] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
  const { bg, text, border } = config;
  return (
    <span
      className={`inline-flex items-center border font-semibold rounded-full font-inter ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      } ${bg} ${text} ${border}`}
    >
      {priority}
    </span>
  );
}
