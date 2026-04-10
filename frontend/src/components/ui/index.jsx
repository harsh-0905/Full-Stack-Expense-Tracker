import { Loader2 } from 'lucide-react';

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />
);

// ── LoadingPage ───────────────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner size={32} />
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-2xl
                      flex items-center justify-center mb-4">
        <Icon size={28} className="text-[var(--color-muted)]" />
      </div>
    )}
    <h3 className="font-semibold text-base mb-1">{title}</h3>
    {description && <p className="text-sm text-[var(--color-muted)] max-w-xs mb-4">{description}</p>}
    {action}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  'Food & Dining':   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Transportation':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Shopping':        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Entertainment':   'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'Healthcare':      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Housing':         'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Education':       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Travel':          'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Personal Care':   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Other':           'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export const CategoryBadge = ({ category }) => (
  <span className={`badge ${CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']}`}>
    {category}
  </span>
);

// ── PageHeader ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-[var(--color-muted)] mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-[var(--color-surface)] rounded-2xl shadow-xl
                        border border-[var(--color-border)] animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-base">{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, icon: Icon, trend, color = 'brand' }) => {
  const colorMap = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-500',
    blue:  'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    red:   'bg-red-50 dark:bg-red-900/20 text-red-500',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon size={18} />
          </div>
        )}
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trend >= 0 ? 'text-red-500' : 'text-brand-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight">{value}</p>
        <p className="text-xs font-medium text-[var(--color-muted)]">{label}</p>
        {sub && <p className="text-[11px] text-[var(--color-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Format currency ───────────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
