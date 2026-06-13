import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

/**
 * Top navigation bar for the dashboard layout.
 * Includes a mobile menu toggle and a user dropdown with logout.
 */
const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 glass border-x-0 border-t-0 rounded-none flex items-center justify-between px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700">
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((p) => !p)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/40 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-primary-600/90 backdrop-blur-sm text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            {initials || <UserIcon size={16} />}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl py-1 z-50">
            <div className="px-4 py-2 border-b border-white/40">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50/60 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
