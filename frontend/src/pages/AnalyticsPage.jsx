import { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useDashboard } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingPage, CategoryBadge, formatCurrency } from '../components/ui';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
);

const PERIOD_OPTIONS = [
  { value: 'week',    label: 'Last 7 Days' },
  { value: 'month',   label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year',    label: 'Last Year' },
];

const COLORS = [
  '#22c55e','#3b82f6','#f97316','#a855f7',
  '#ec4899','#14b8a6','#f59e0b','#6366f1','#ef4444','#64748b',
];

export default function AnalyticsPage() {
  const { user }            = useAuth();
  const [period, setPeriod] = useState('month');
  const currency            = user?.currency || 'INR';
  const { data, isLoading } = useDashboard(period);

  if (isLoading) return <LoadingPage />;

  const {
    summary, categoryBreakdown = [], dailyTrend = [],
    monthComparison, paymentStats = [], topExpenses = [],
  } = data || {};

  // ── Daily trend line ───────────────────────────────────────────────────────
  const lineData = {
    labels: dailyTrend.map((d) => format(new Date(d.date), 'MMM d')),
    datasets: [{
      label: 'Daily Spend',
      data: dailyTrend.map((d) => d.total),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,.1)',
      fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2,
      pointBackgroundColor: '#22c55e',
    }],
  };

  // ── Category bar ──────────────────────────────────────────────────────────
  const barData = {
    labels: categoryBreakdown.map((c) => c.category),
    datasets: [{
      label: 'Amount',
      data: categoryBreakdown.map((c) => c.total),
      backgroundColor: COLORS,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // ── Payment doughnut ──────────────────────────────────────────────────────
  const paymentData = {
    labels: paymentStats.map((p) => p.method),
    datasets: [{
      data: paymentStats.map((p) => p.total),
      backgroundColor: ['#22c55e','#3b82f6','#f97316','#a855f7','#64748b'],
      borderWidth: 2, borderColor: 'var(--color-surface)', hoverOffset: 6,
    }],
  };

  const chartBaseOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const axisOptions = {
    ...chartBaseOptions,
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, maxTicksLimit: 10 } },
      y: { grid: { color: 'rgba(148,163,184,.1)' }, ticks: { font: { size: 11 } } },
    },
  };

  const pct = monthComparison?.percentageChange ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep-dive into your spending patterns"
        actions={
          <select className="input w-auto text-sm"
            value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        }
      />

      {/* Month-over-month comparison banner */}
      {monthComparison && (
        <div className={`card p-4 flex items-center justify-between flex-wrap gap-4
                         ${pct >= 0 ? 'border-red-200 dark:border-red-800' : 'border-brand-200 dark:border-brand-800'}`}>
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-0.5">
              Month-over-Month
            </p>
            <p className="text-sm font-medium">
              This month: <strong>{formatCurrency(monthComparison.currentMonth.total, currency)}</strong>
              {' '}vs last month: <strong>{formatCurrency(monthComparison.lastMonth.total, currency)}</strong>
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
                            ${pct >= 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                       : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'}`}>
            {pct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Trend chart */}
      <div className="card p-5">
        <h3 className="font-bold text-sm mb-4">Daily Spending Trend</h3>
        <div className="h-64">
          {dailyTrend.length
            ? <Line data={lineData} options={axisOptions} />
            : <Empty />}
        </div>
      </div>

      {/* Category bar + payment doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4">Spending by Category</h3>
          <div className="h-56">
            {categoryBreakdown.length
              ? <Bar data={barData} options={{ ...axisOptions, plugins: { legend: { display: false } } }} />
              : <Empty />}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4">Payment Methods</h3>
          <div className="h-56">
            {paymentStats.length
              ? <Doughnut data={paymentData} options={{
                  ...chartBaseOptions, cutout: '65%',
                  plugins: { legend: { position: 'right', labels: { font: { size: 11 }, padding: 12, usePointStyle: true } } },
                }} />
              : <Empty />}
          </div>
        </div>
      </div>

      {/* Category table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold text-sm">Category Breakdown</h3>
        </div>
        {categoryBreakdown.length === 0 ? (
          <Empty className="py-10" />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {categoryBreakdown.map((cat, i) => {
              const maxTotal = categoryBreakdown[0]?.total || 1;
              const pct = (cat.total / maxTotal) * 100;
              return (
                <div key={cat.category} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-[var(--color-muted)] text-xs w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <CategoryBadge category={cat.category} />
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <span className="text-[var(--color-muted)]">{cat.count} txns</span>
                        <span className="font-bold font-mono">{formatCurrency(cat.total, currency)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const Empty = ({ className = '' }) => (
  <div className={`h-full flex items-center justify-center text-sm text-[var(--color-muted)] ${className}`}>
    No data for this period
  </div>
);
