import React from 'react';
import SearchInput from './SearchInput';

interface Crumb { label: string; muted?: boolean }

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Crumb[];
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  action?: React.ReactNode;
  titleUppercase?: boolean;
}

export default function PageHeader({ title, breadcrumbs, search, action, titleUppercase }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className={`text-2xl font-heading font-bold text-gray-900 leading-tight ${titleUppercase ? 'uppercase tracking-wide' : ''}`}>
          {title}
        </h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mt-1 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-400 text-sm">›</span>}
                <span className={`text-sm font-inter ${crumb.muted ? 'text-gray-400' : 'text-gray-600'}`}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {search && (
          <SearchInput
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder}
            className="w-52"
          />
        )}
        {action}
      </div>
    </div>
  );
}
