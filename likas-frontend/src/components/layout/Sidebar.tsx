import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CloudRain, Users, Map, UserCircle,
  LogOut, ListChecks
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  children?: { to: string; label: string }[];
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    children: [{ to: '/dashboard/priority', label: 'Priority List' }],
  },
  { to: '/flood-records', icon: <CloudRain size={20} />, label: 'Flood Records' },
  { to: '/population', icon: <Users size={20} />, label: 'Barangay Vulnerability' },
  { to: '/street-registry', icon: <Map size={20} />, label: 'Street Registry' },
  { to: '/account', icon: <UserCircle size={20} />, label: 'Account' },
];

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to: string, end = false) => {
    if (end) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className="flex flex-col h-full bg-[#050A30] flex-shrink-0 transition-all duration-300"
      style={{ width: expanded ? '280px' : '80px' }}
    >
      {/* Logo / Toggle */}
      <div
        className="flex items-center gap-3 px-4 py-6 cursor-pointer select-none flex-shrink-0"
        onClick={onToggle}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <span className="text-[#050A30] font-bold text-sm font-heading">L</span>
        </div>
        {expanded && (
          <span className="text-white font-heading font-bold text-2xl tracking-wide">LIKAS</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const dashboardActive = item.to === '/dashboard' && location.pathname.startsWith('/dashboard');
          const isAccount = item.to === '/account';

          return (
            <div key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive: navIsActive }) => {
                  const activeState = navIsActive || dashboardActive;
                  return `flex items-center gap-3 px-3 py-2.5 rounded-l-full rounded-r-none transition-all duration-200 group ${
                    activeState && !item.children
                      ? 'bg-[#F0F4F7] text-[#C62828]'
                      : dashboardActive && item.children
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`;
                }}
              >
                {({ isActive: navIsActive }) => {
                  const activeState = navIsActive || dashboardActive;
                  return (
                    <>
                      <span className={`flex-shrink-0 ${
                        activeState && !item.children
                          ? 'text-[#C62828]'
                          : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {item.icon}
                      </span>
                      {expanded && (
                        <span className={`font-heading text-sm font-semibold whitespace-nowrap ${
                          activeState && !item.children
                            ? 'text-[#C62828]'
                            : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
              {/* Sub-items */}
              {expanded && item.children?.map(child => {
                const childActive = location.pathname === child.to;
                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={`flex items-center gap-3 pl-10 pr-3 py-2 ml-2 mt-0.5 rounded-l-full rounded-r-none transition-all duration-200 group ${
                      childActive
                        ? 'bg-[#F0F4F7] text-[#C62828]'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <ListChecks size={16} className={childActive ? 'text-[#C62828]' : 'text-gray-400 group-hover:text-white'} />
                    <span className={`font-heading text-sm font-semibold ${
                      childActive ? 'text-[#C62828]' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {child.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {expanded && <span className="font-heading text-sm font-semibold">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
