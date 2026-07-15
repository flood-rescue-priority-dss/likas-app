import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sticky?: boolean;
  /** Enables click-to-sort on this column's header. */
  sortable?: boolean;
  /**
   * Value to sort by for this column. Defaults to `row[col.key]`.
   * Provide this when the displayed cell (via `render`) isn't a plain
   * comparable value — e.g. a badge, or an ordinal like Priority (Low/Medium/High).
   */
  sortAccessor?: (row: T) => string | number | null | undefined;
}

type SortDir = 'asc' | 'desc';

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
  /** Column key to sort by initially (must match a `sortable` column). */
  defaultSortKey?: string;
  defaultSortDir?: SortDir;
  /** Shows a leading "No." column with the row's sequential position. Defaults to true. */
  showRowNumber?: boolean;
}

const WINDOW = 5;
const ENTRIES_OPTIONS: number[] = [10, 25, 50, 100, 150, 200];
const DEFAULT_ENTRIES = 10;

export default function DataTable<T>({
  columns, data, keyExtractor, loading, emptyMessage = 'No records found.',
  onRowClick, selectedKey, pageSize, className = '', headerAction,
  defaultSortKey, defaultSortDir = 'asc', showRowNumber = true
}: DataTableProps<T>) {
  const [entries, setEntries] = React.useState<number>(
    pageSize && ENTRIES_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_ENTRIES
  );
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | undefined>(defaultSortKey);
  const [sortDir, setSortDir] = React.useState<SortDir>(defaultSortDir);

  const handleSort = (key: string) => {
    setSortDir(prev => (sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
    setSortKey(key);
    setPage(1);
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return data;
    const getValue = (row: T) => col.sortAccessor ? col.sortAccessor(row) : (row as any)[col.key];
    return [...data].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      let cmp: number;
      if (av == null && bv == null) {
        cmp = 0;
      } else if (av == null) {
        cmp = 1;
      } else if (bv == null) {
        cmp = -1;
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      }
      // Tie-breaker: some columns (e.g. an "Updated" date with day-only
      // precision) legitimately share the same value across many rows.
      // Array.sort is stable, so ties would otherwise keep their previous
      // relative order no matter which direction is selected, making a
      // second click look like it "does nothing". Falling back to each
      // row's unique key keeps the order deterministic and lets it flip
      // along with everything else when the direction is toggled.
      if (cmp === 0) {
        const ak = keyExtractor(a);
        const bk = keyExtractor(b);
        cmp = ak < bk ? -1 : ak > bk ? 1 : 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns, keyExtractor]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / entries));
  const start = (page - 1) * entries;
  const pageData = sortedData.slice(start, start + entries);

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
    <div className={`flex flex-col min-h-0 bg-white ${className}`}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full relative">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {showRowNumber && (
                <th className="sticky left-0 z-20 w-14 px-4 py-3 text-left text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  No.
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={`px-4 py-3 text-left text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sticky ? `sticky z-10 bg-gray-50 ${showRowNumber ? 'left-14' : 'left-0'}` : ''
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700 transition-colors' : ''} ${col.className ?? ''}`}
                >
                  {col.sortable ? (
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      ) : (
                        <ChevronsUpDown size={13} className="text-gray-300" />
                      )}
                    </span>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (showRowNumber ? 1 : 0)} className="py-16 text-center">
                  <div className="spinner-dark mx-auto" />
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showRowNumber ? 1 : 0)} className="py-16 text-center text-sm font-inter text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : pageData.map((row, i) => {
              const key = keyExtractor(row);
              const isSelected = selectedKey === key;
              const hoverBg = isSelected ? 'group-hover:bg-blue-50' : 'group-hover:bg-[#F0F4F7]/80';
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`group ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F0F4F7]' : ''
                  } ${isSelected ? 'bg-blue-50 border-l-2 border-[#1B75BC]' : ''}`}
                >
                  {showRowNumber && (
                    <td className={`sticky left-0 z-10 w-14 px-4 py-3.5 text-sm font-inter text-gray-700 ${isSelected ? 'bg-blue-50' : 'bg-white'} ${hoverBg} transition-none`}>
                      {start + i + 1}
                    </td>
                  )}
                  {columns.map(col => (
                    <td 
                      key={col.key} 
                      className={`px-4 py-3.5 text-sm font-inter text-gray-700 ${
                        col.sticky ? `sticky z-10 ${showRowNumber ? 'left-14' : 'left-0'} ${isSelected ? 'bg-blue-50' : 'bg-white'} ${hoverBg} transition-none` : ''
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 flex-shrink-0 mt-auto bg-white">
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
