import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, BarChart3, Settings,
  LogOut, Menu, X, TrendingDown, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/expenses',   icon: Receipt,          label: 'Expenses'   },
  { to: '/analytics',  icon: BarChart3,         label: 'Analytics'  },
  { to: '/settings',   icon: Settings,          label: 'Settings'   },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);
  const [dark, setDark]   = useDarkMode();

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavItems = () => (
    <nav className="flex-1 space-y-0.5 px-2 py-4">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to} to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-brand-500 text-white shadow-glow'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
          <TrendingDown size={16} className="text-white" />
        </div>
        <span className="font-extrabold text-base tracking-tight">SpendLens</span>
      </div>

      <NavItems />

      {/* Bottom section */}
      <div className="px-2 pb-4 space-y-1 mt-auto border-t border-[var(--color-border)] pt-3">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* User / logout */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center
                          justify-center text-brand-600 dark:text-brand-300 text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-[10px] text-[var(--color-muted)] truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Log out"
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-muted)] hover:text-red-500 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0
                        bg-[var(--color-surface)] border-r border-[var(--color-border)]">
        {sidebarContent}
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                      px-4 h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <TrendingDown size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-sm">SpendLens</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-[var(--color-bg)]">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-[var(--color-surface)] h-full animate-slide-up">
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--color-bg)]">
              <X size={18} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
