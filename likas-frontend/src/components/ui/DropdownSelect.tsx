import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option { value: string; label: string; }

interface DropdownSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function DropdownSelect({
  options, value, onChange, placeholder = 'Select...', disabled, className = ''
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`w-full flex gap-3 items-justify justify-between px-5 py-1.5 bg-[#F0F4F7] border rounded-xl text-sm font-inter transition-all min-w-[120px] ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-gray-200 hover:border-[#1B75BC] cursor-pointer'
        } ${open ? 'border-[#1B75BC] ring-2 ring-[#1B75BC]/20' : ''}`}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm font-inter text-gray-400">No options available</div>
          ) : options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm font-inter hover:bg-[#F0F4F7] transition-colors ${
                opt.value === value ? 'bg-[#F0F4F7] text-[#050A30] font-semibold' : 'text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
