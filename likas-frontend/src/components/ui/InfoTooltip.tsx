import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text?: string;
}

export default function InfoTooltip({
  text = 'Please make sure all information entered is correct before proceeding.'
}: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1B75BC] hover:border-[#1B75BC] transition-colors"
      >
        <Info size={14} />
      </button>
      {visible && (
        <div className="absolute right-0 top-9 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50 text-xs font-inter text-gray-600 leading-relaxed">
          {/* Pointer arrow */}
          <div className="absolute -top-[6px] right-2.5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
          <span className="text-[#C62828] font-bold mr-1">*</span>
          {text}
        </div>
      )}
    </div>
  );
}
