import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  pageSize?: number;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function DataTable<T>({
  columns, data, keyExtractor, loading, emptyMessage = 'No records found.',
  onRowClick, selectedKey, pageSize = 10, className = '', headerAction
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  React.useEffect(() => { setPage(1); }, [data]);

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.className ?? ''}`}
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
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F0F4F7]/80' : ''
                  } ${isSelected ? 'bg-blue-50 border-l-2 border-[#1B75BC]' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3.5 text-sm font-inter text-gray-700 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <p className="text-xs font-inter text-gray-400">
          Showing {data.length === 0 ? 0 : start + 1} to {Math.min(start + pageSize, data.length)} of {data.length} records
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {(() => {
            const windowSize = 5;
            const half = Math.floor(windowSize / 2);
            let startPage = Math.max(1, page - half);
            let endPage = startPage + windowSize - 1;
            if (endPage > totalPages) {
              endPage = totalPages;
              startPage = Math.max(1, endPage - windowSize + 1);
            }
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-inter font-semibold transition-colors ${
                  p === page
                    ? 'bg-[#050A30] text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ));
          })()}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
