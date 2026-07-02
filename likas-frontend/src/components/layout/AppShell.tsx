import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function AppShell({ children, defaultExpanded = true }: AppShellProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050A30' }}>
      <Sidebar expanded={expanded} onToggle={() => setExpanded(e => !e)} />
      <main
        className="flex-1 overflow-y-auto bg-[#F0F4F7] rounded-tl-3xl"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
