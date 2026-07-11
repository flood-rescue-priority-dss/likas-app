import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset the search box each time the dropdown closes, and focus it each
  // time it opens, so re-opening always starts from a clean slate.
  useEffect(() => {
    if (open) {
      setSearch('');
      // Focus after the dropdown has actually rendered.
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // "All ..." (or any other meta option like an empty-value placeholder) stays
  // pinned at the top regardless of sorting/search -- it isn't a real place,
  // so alphabetizing it in with everything else would be confusing.
  const pinned = options.filter(o => o.value === 'ALL');
  const rest = options.filter(o => o.value !== 'ALL');

  const visibleRest = useMemo(() => {
    const filtered = search.trim()
      ? rest.filter(o => o.label.toLowerCase().includes(search.trim().toLowerCase()))
      : rest;
    return [...filtered].sort((a, b) => a.label.localeCompare(b.label));
  }, [rest, search]);

  const visiblePinned = search.trim()
    ? pinned.filter(o => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : pinned;

  const visibleOptions = [...visiblePinned, ...visibleRest];

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
          {options.length > 7 && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full text-sm font-inter text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
                onKeyDown={e => {
                  // Prevent the outside-click handler's parent form (if any)
                  // from accidentally submitting on Enter.
                  if (e.key === 'Enter') e.preventDefault();
                }}
              />
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {visibleOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm font-inter text-gray-400">
                {options.length === 0 ? 'No options available' : 'No matches found'}
              </div>
            ) : visibleOptions.map(opt => (
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
        </div>
      )}
    </div>
  );
}
