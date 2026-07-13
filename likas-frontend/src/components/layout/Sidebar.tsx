import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CloudRain, Users, Map, UserCircle,
  LogOut, ListChecks, AlertTriangle, UserCog, BarChart2
} from 'lucide-react';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import likasLogo from '../../assets/likas_logo_1.png';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  children?: { to: string; label: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    children: [
      { to: '/dashboard/priority', label: 'Priority List' },
      { to: '/dashboard/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' }
    ],
  },
  { to: '/flood-records', icon: <CloudRain size={20} />, label: 'Flood Records' },
  { to: '/incident-management', icon: <AlertTriangle size={20} />, label: 'Incident Management' },
  { to: '/population', icon: <Users size={20} />, label: 'Population Vulnerability' },
  { to: '/street-registry', icon: <Map size={20} />, label: 'Street Registry' },
  { to: '/accounts', icon: <UserCog size={20} />, label: 'Manage Accounts' },
  { to: '/account', icon: <UserCircle size={20} />, label: 'Account' },
];

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const recalc = () => {
      const activeEl = navRef.current?.querySelector('[data-active="true"]') as HTMLElement;
      if (!activeEl || !sliderRef.current || !navRef.current) return;

      const navTop = navRef.current.getBoundingClientRect().top;
      const elRect = activeEl.getBoundingClientRect();
      const isChild = activeEl.dataset.navType === 'child';

      sliderRef.current.style.top = `${elRect.top - navTop + navRef.current.scrollTop}px`;
      sliderRef.current.style.height = `${elRect.height}px`;
      sliderRef.current.style.left = isChild && expanded ? '30px' : '12px';
      sliderRef.current.style.right = '0px';
      sliderRef.current.style.borderRadius = '9999px 0 0 9999px';
      sliderRef.current.style.opacity = '1';
    };

    recalc();

    if (!navRef.current) return;
    const ro = new ResizeObserver(recalc);
    ro.observe(navRef.current);
    navRef.current.querySelectorAll('a').forEach(el => ro.observe(el));
    return () => ro.disconnect();
  }, [location.pathname, expanded]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  return (
    <aside
      className="app-sidebar flex flex-col h-full bg-[#050A30] flex-shrink-0 transition-all duration-300"
      style={{ width: expanded ? '250px' : '80px' }}
    >
      {/* Logo / Toggle */}
      <div
        className="flex items-center gap-3 px-4 py-6 cursor-pointer select-none flex-shrink-0 "
        onClick={onToggle}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-none rounded-full flex items-center justify-center transition-all duration-300 bg-cover bg-center hover:scale-105 hover:shadow-[0_0_6px_1px_rgba(255,255,255,0.3)]"
        style={{ backgroundImage: `url(${likasLogo})` }}>

        </div>
        {expanded && (
          <span className="text-white font-heading font-bold text-2xl tracking-wide">LIKAS</span>
        )}
      </div>

      {/* Nav Items — pl-3 only, no pr so items bleed to right edge */}
      <nav
        ref={navRef}
        className="flex-1 pl-3 space-y-1 overflow-y-auto overflow-x-hidden relative"
      >
        {/* Sliding pill */}
        <div
          ref={sliderRef}
          className="absolute bg-[#F0F4F7] pointer-events-none z-0 opacity-0"
          style={{
            transition:
              'top 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s ease',
          }}
        />

        {navItems
          .filter(item => {
            // Hide "Incident Management" from barangay users
            if (item.label === 'Incident Management' && user?.role !== 'admin') return false;
            // Hide "Manage Accounts" from barangay users
            if (item.label === 'Manage Accounts' && user?.role !== 'admin') return false;
            return true;
          })
          .map((item) => {
          const dashboardActive = item.to === '/dashboard' && location.pathname.startsWith('/dashboard');
          const childRouteActive = dashboardActive && location.pathname !== '/dashboard';

          return (
            <div key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/dashboard'}
                data-nav-type="parent"
                data-active={
                  (location.pathname === item.to ||
                  (item.to === '/dashboard' && location.pathname === '/dashboard'))
                    ? 'true'
                    : 'false'
                }
                className={({ isActive: navIsActive }) => {
                  const activeState = navIsActive || dashboardActive;
                  const parentDimmed = childRouteActive && !navIsActive;
                  return [
                    'flex items-center gap-3 px-3 py-2.5 rounded-l-full group relative z-10 w-full',
                    activeState && !parentDimmed
                      ? 'text-[#C62828]'
                      : parentDimmed
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white',
                  ].join(' ');
                }}
              >
                {({ isActive: navIsActive }) => {
                  const activeState = navIsActive || dashboardActive;
                  const parentDimmed = childRouteActive && !navIsActive;
                  const textColor = activeState && !parentDimmed
                    ? 'text-[#C62828]'
                    : parentDimmed
                      ? 'text-white'
                      : 'text-gray-300 group-hover:text-white';
                  return (
                    <>
                      {!activeState && !parentDimmed && (
                        <span className="absolute inset-0 rounded-l-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0" />
                      )}
                      {parentDimmed && (
                        <span className="absolute inset-0 rounded-l-full bg-white/10 z-0" />
                      )}
                      <span className={`relative flex-shrink-0 transition-colors duration-200 ${textColor}`}>
                        {item.icon}
                      </span>
                      {expanded && (
                        <span className={`relative font-heading text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${textColor}`}>
                          {item.label}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>

              {/* Sub-items */}
              {item.children?.map(child => {
                const childActive = location.pathname === child.to;
                const childTextColor = childActive
                  ? 'text-[#C62828]'
                  : 'text-gray-300 group-hover:text-white';

                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    data-nav-type="child"
                    data-active={childActive ? 'true' : 'false'}
                    className={[
                      'flex items-center gap-3 h-9 mt-1 rounded-l-full group relative z-10 w-full',
                      'transition-[padding,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      expanded ? 'pl-3 pr-3 ml-5' : 'pl-3 pr-3 ml-0',
                      childActive ? 'text-[#C62828]' : 'text-gray-400 hover:text-white',
                    ].join(' ')}
                  >
                    {!childActive && (
                      <span className="absolute inset-0 rounded-l-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0" />
                    )}
                    {child.icon ? (
                      <span className={`relative flex-shrink-0 transition-colors duration-200 ${childTextColor}`}>
                        {child.icon}
                      </span>
                    ) : (
                      <ListChecks
                        size={18}
                        className={`relative flex-shrink-0 transition-colors duration-200 ${childTextColor}`}
                      />
                    )}
                    {expanded && (
                      <span className={`relative font-heading text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${childTextColor}`}>
                        {child.label}
                      </span>
                    )}
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
          onClick={handleLogoutClick}
          className="flex items-center gap-3 px-3 h-9 w-full rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {expanded && <span className="font-heading text-sm font-semibold whitespace-nowrap">Log out</span>}
        </button>
      </div>

      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-[#C62828]">
            <LogOut size={24} />
          </div>
          <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">Are you sure?</h3>
          <p className="text-gray-500 font-inter text-sm text-center mb-6">
            You are about to log out of the system.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 py-2.5 bg-[#C62828] hover:bg-red-800 text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}