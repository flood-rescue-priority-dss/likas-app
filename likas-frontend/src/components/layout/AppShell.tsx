import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

interface AppShellProps {
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export default function AppShell({
  defaultExpanded = true,
  expanded: controlledExpanded,
  onToggle,
  children,
}: AppShellProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);

  const expanded = controlledExpanded ?? internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded(prev => !prev));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050A30' }}>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar expanded={expanded} onToggle={handleToggle} />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar expanded={true} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ minWidth: 0 }}
      >
        {/* Mobile top bar — sits outside the scroll area, so it never moves with the page */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#050A30] flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-heading font-bold text-lg tracking-wide">LIKAS</span>
        </div>

        {/* Scrollable page content */}
        <div
          className="flex-1 overflow-y-auto bg-[#F0F4F7] rounded-tl-3xl md:rounded-tl-3xl rounded-tl-none"
          style={{ minWidth: 0 }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
