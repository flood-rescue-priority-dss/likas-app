import React, { useState } from 'react';
import Sidebar from './Sidebar';

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
  children 
}: AppShellProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const expanded = controlledExpanded ?? internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded(prev => !prev));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050A30' }}>
      <Sidebar expanded={expanded} onToggle={handleToggle} />
      <main
        className="flex-1 overflow-y-auto bg-[#F0F4F7] rounded-tl-3xl"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}