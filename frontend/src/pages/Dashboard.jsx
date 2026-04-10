import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Activity, Plus, ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useDashboard } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { PageHeader, StatCard, CategoryBadge, LoadingPage, formatCurrency } from '../components/ui';
import ExpenseModal from '../components/ExpenseModal';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const PERIOD_OPTIONS = [
  { value: 'week',    label: '7D' },
  { value: 'month',   label: '1M' },
  { value: 'quarter', label: '3M' },
  { value: 'year',    label: '1Y' },
];

const CHART_COLORS = [
  '#22c55e','#3b82f6','#f97316','#a855f7',
  '#ec4899','#14b8a6','#f59e0b','#6366f1','#ef4444','#64748b',
];

export default function Dashboard() {
  const { user }                  = useAuth();
  const [period, setPeriod]       = useState('month');
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading }       = useDashboard(period);

  if (isLoading) return <LoadingPage />;

  const { summary, categoryBreakdown, dailyTrend, monthComparison, topExpenses } = data || {};
  const currency = user?.currency || 'INR';

  // ── Chart configs ──────────────────────────────────────────────────────────
  const lineData = {
    labels: (dailyTrend || []).map((d) => format(new Date(d.date), 'MMM d')),
    datasets: [{
      label: 'Daily Spend',
      data: (dailyTrend || []).map((d) => d.total),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#22c55e',
      borderWidth: 2,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(148,163,184,.1)' }, ticks: { font: { size: 11 } } },
    },
  };

  const doughnutData = {
    labels: (categoryBreakdown || []).map((c) => c.category),
    datasets: [{
      data: (categoryBreakdown || []).map((c) => c.total),
      backgroundColor: CHART_COLORS,
      borderWidth: 2,
      borderColor: 'var(--color-surface)',
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, padding: 14, usePointStyle: true } },
    },
  };

  const pctChange = monthComparison?.percentageChange ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your spending overview"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 gap-0.5">
              {PERIOD_OPTIONS.map((o) => (
                <button
                  key={o.value} onClick={() => setPeriod(o.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === o.value
                      ? 'bg-brand-500 text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} /> Add
            </button>
          </div>
        }
      />

      {/* Budget progress bar */}
      {user?.monthlyBudget > 0 && (
        <BudgetBar spent={summary?.total || 0} budget={user.monthlyBudget} currency={currency} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Spent" icon={Wallet}
          value={formatCurrency(summary?.total || 0, currency)}
          sub={`${summary?.count || 0} transactions`}
          color="brand"
        />
        <StatCard
          label="Avg. Transaction" icon={Activity}
          value={formatCurrency(summary?.avg || 0, currency)}
          color="blue"
        />
        <StatCard
          label="Largest Expense" icon={TrendingUp}
          value={formatCurrency(summary?.max || 0, currency)}
          color="amber"
        />
        <StatCard
          label="vs Last Month" icon={pctChange >= 0 ? TrendingUp : TrendingDown}
          value={`${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`}
          sub={formatCurrency(monthComparison?.currentMonth?.total || 0, currency)}
          trend={pctChange}
          color={pctChange >= 0 ? 'red' : 'brand'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Spending Trend</h3>
          </div>
          <div className="h-52">
            {dailyTrend?.length ? <Line data={lineData} options={lineOptions} /> : <EmptyChart />}
          </div>
        </div>

        {/* Doughnut */}
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4">By Category</h3>
          <div className="h-52">
            {categoryBreakdown?.length
              ? <Doughnut data={doughnutData} options={doughnutOptions} />
              : <EmptyChart />}
          </div>
        </div>
      </div>

      {/* Top expenses */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Top Expenses</h3>
          <Link to="/expenses" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {topExpenses?.length ? topExpenses.map((exp) => (
            <div key={exp._id} className="flex items-center justify-between py-2.5
                                           border-b border-[var(--color-border)] last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center
                                justify-center text-base shrink-0">
                  {getCategoryEmoji(exp.category)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{exp.title}</p>
                  <CategoryBadge category={exp.category} />
                </div>
              </div>
              <p className="font-bold text-sm shrink-0 ml-3">
                {formatCurrency(exp.amount, currency)}
              </p>
            </div>
          )) : (
            <p className="text-sm text-[var(--color-muted)] text-center py-4">No expenses yet.</p>
          )}
        </div>
      </div>

      <ExpenseModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

const EmptyChart = () => (
  <div className="h-full flex items-center justify-center text-[var(--color-muted)] text-sm">
    No data for this period
  </div>
);

const BudgetBar = ({ spent, budget, currency }) => {
  const pct     = Math.min(100, (spent / budget) * 100);
  const over    = pct >= 100;
  const warning = pct >= 80;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-[var(--color-muted)]">Monthly Budget</p>
        <p className="text-xs font-bold">
          <span className={over ? 'text-red-500' : warning ? 'text-amber-500' : 'text-brand-500'}>
            {formatCurrency(spent, currency)}
          </span>
          <span className="text-[var(--color-muted)]"> / {formatCurrency(budget, currency)}</span>
        </p>
      </div>
      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            over ? 'bg-red-500' : warning ? 'bg-amber-400' : 'bg-brand-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">
          Over budget by {formatCurrency(spent - budget, currency)}
        </p>
      )}
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const getCategoryEmoji = (cat) => ({
  'Food & Dining': '🍔', 'Transportation': '🚗', 'Shopping': '🛍️',
  'Entertainment': '🎬', 'Healthcare': '💊', 'Housing': '🏠',
  'Education': '📚', 'Travel': '✈️', 'Personal Care': '💆', 'Other': '💰',
}[cat] || '💰');
