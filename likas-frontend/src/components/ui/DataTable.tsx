import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sticky?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  /** @deprecated Superseded by the built-in "Show entries" control, which defaults to 25. Kept only for backward compatibility; used as the initial selection if it matches one of ENTRIES_OPTIONS. */
  pageSize?: number;
  className?: string;
  headerAction?: React.ReactNode;
}

const WINDOW = 5;
const ENTRIES_OPTIONS: number[] = [10, 25, 50, 100, 150, 200];
const DEFAULT_ENTRIES = 10;

export default function DataTable<T>({
  columns, data, keyExtractor, loading, emptyMessage = 'No records found.',
  onRowClick, selectedKey, pageSize, className = '', headerAction
}: DataTableProps<T>) {
  const [entries, setEntries] = React.useState<number>(
    pageSize && ENTRIES_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_ENTRIES
  );
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / entries));
  const start = (page - 1) * entries;
  const pageData = data.slice(start, start + entries);

  // Reset to page 1 whenever the dataset or the entries-per-page selection changes.
  React.useEffect(() => { setPage(1); }, [data, entries]);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  // Grouped window: pages 1–5 → window 1, pages 6–10 → window 2, etc.
  // windowStart is always the first page of the current group.
  const windowStart = Math.floor((page - 1) / WINDOW) * WINDOW + 1;
  const windowEnd = Math.min(windowStart + WINDOW - 1, totalPages);
  const pageButtons = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sticky ? 'sticky left-0 z-10 bg-gray-50' : ''
                  } ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="spinner-dark mx-auto" />
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-sm font-inter text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : pageData.map(row => {
              const key = keyExtractor(row);
              const isSelected = selectedKey === key;
              const hoverBg = isSelected ? 'group-hover:bg-blue-50' : 'group-hover:bg-[#F0F4F7]/80';
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F0F4F7]/80' : ''
                  } ${isSelected ? 'bg-blue-50 border-l-2 border-[#1B75BC]' : ''}`}
                >
                  {columns.map(col => (
                    <td 
                      key={col.key} 
                      className={`px-4 py-3.5 text-sm font-inter text-gray-700 ${
                        col.sticky ? `sticky left-0 z-10 ${isSelected ? 'bg-blue-50' : 'bg-white'} ${hoverBg}` : ''
                      } ${col.className ?? ''}`}
                    >
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer: entries selector + pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-inter text-gray-400 flex-shrink-0">
          <span>Show</span>
          <select
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
            className="border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-xs font-inter font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1B75BC] cursor-pointer appearance-none bg-no-repeat bg-[right_0.4rem_center] bg-[length:10px]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")" }}
          >
            {ENTRIES_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span>entries of {data.length}</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page number buttons — fade in/out smoothly when window shifts */}
            <div className="flex items-center gap-1">
              {pageButtons.map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-inter font-semibold transition-all duration-200 ${
                    p === page
                      ? 'bg-[#050A30] text-white scale-105 shadow-sm'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
