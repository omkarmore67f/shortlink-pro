import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Link2, BarChart3, User, Link as LinkIcon, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/links', label: 'My Links', icon: Link2 },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

/**
 * Sidebar navigation for the dashboard layout.
 *
 * On mobile, it's rendered as an off-canvas drawer controlled by
 * `isOpen`/`onClose` (toggled from the Navbar's hamburger button).
 * On desktop (lg breakpoint+), it's always visible as a fixed column.
 */
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 glass-sidebar transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:flex lg:flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/40">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
              <LinkIcon className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900">ShortLink Pro</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-white/70 text-primary-700 shadow-sm backdrop-blur-sm'
                      : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/40">
          <p className="text-xs text-gray-400 text-center">ShortLink Pro &copy; {new Date().getFullYear()}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
