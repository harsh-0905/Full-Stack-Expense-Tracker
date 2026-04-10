import { useState, useCallback } from 'react';
import {
  Plus, Search, Filter, Trash2, Pencil, ChevronLeft,
  ChevronRight, Receipt, X,
} from 'lucide-react';
import { useExpenses, useDeleteExpense, useBulkDelete, useCategories } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader, CategoryBadge, LoadingPage, EmptyState, Modal, formatCurrency,
} from '../components/ui';
import ExpenseModal from '../components/ExpenseModal';
import { format } from 'date-fns';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'];

export default function ExpensesPage() {
  const { user }                          = useAuth();
  const currency                          = user?.currency || 'INR';
  const { data: categories = [] }         = useCategories();

  const [params, setParams]               = useState({ page: 1, limit: 15 });
  const [showFilters, setShowFilters]     = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [editExpense, setEditExpense]     = useState(null);
  const [selected, setSelected]          = useState(new Set());
  const [deleteTarget, setDeleteTarget]  = useState(null);

  const { data, isLoading }   = useExpenses(params);
  const deleteMutation         = useDeleteExpense();
  const bulkDeleteMutation     = useBulkDelete();

  const expenses   = data?.expenses   || [];
  const pagination = data?.pagination || {};

  const setParam = (key, val) =>
    setParams((p) => ({ ...p, [key]: val, page: key === 'page' ? val : 1 }));

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === expenses.length) setSelected(new Set());
    else setSelected(new Set(expenses.map((e) => e._id)));
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync([...selected]);
    setSelected(new Set());
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  const clearFilters = () => {
    setParams({ page: 1, limit: 15 });
  };

  const activeFilterCount = ['search','category','paymentMethod','startDate','endDate','minAmount','maxAmount']
    .filter((k) => params[k]).length;

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Expenses"
        subtitle={`${pagination.total || 0} total transactions`}
        actions={
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button onClick={handleBulkDelete} className="btn-danger">
                <Trash2 size={15} /> Delete {selected.size}
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary relative ${activeFilterCount > 0 ? 'border-brand-400' : ''}`}>
              <Filter size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white
                                 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button onClick={() => { setEditExpense(null); setShowModal(true); }} className="btn-primary">
              <Plus size={15} /> Add
            </button>
          </div>
        }
      />

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          className="input pl-9"
          placeholder="Search by title or note…"
          value={params.search || ''}
          onChange={(e) => setParam('search', e.target.value || undefined)}
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={params.category || ''}
                onChange={(e) => setParam('category', e.target.value || undefined)}>
                <option value="">All</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Payment</label>
              <select className="input" value={params.paymentMethod || ''}
                onChange={(e) => setParam('paymentMethod', e.target.value || undefined)}>
                <option value="">All</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">From</label>
              <input className="input" type="date" value={params.startDate || ''}
                onChange={(e) => setParam('startDate', e.target.value || undefined)} />
            </div>
            <div>
              <label className="label">To</label>
              <input className="input" type="date" value={params.endDate || ''}
                onChange={(e) => setParam('endDate', e.target.value || undefined)} />
            </div>
            <div>
              <label className="label">Min ₹</label>
              <input className="input" type="number" min="0" placeholder="0"
                value={params.minAmount || ''}
                onChange={(e) => setParam('minAmount', e.target.value || undefined)} />
            </div>
            <div>
              <label className="label">Max ₹</label>
              <input className="input" type="number" min="0" placeholder="∞"
                value={params.maxAmount || ''}
                onChange={(e) => setParam('maxAmount', e.target.value || undefined)} />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters}
              className="mt-3 text-xs text-brand-500 hover:underline flex items-center gap-1">
              <X size={11} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses found"
            description={activeFilterCount > 0 ? 'Try adjusting your filters.' : 'Add your first expense to get started.'}
            action={
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus size={15} /> Add Expense
              </button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                    <th className="w-8 px-4 py-3">
                      <input type="checkbox" className="rounded"
                        checked={selected.size === expenses.length && expenses.length > 0}
                        onChange={toggleAll} />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-[var(--color-muted)] uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-[var(--color-muted)] uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-[var(--color-muted)] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-[var(--color-muted)] uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-right font-semibold text-xs text-[var(--color-muted)] uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {expenses.map((exp) => (
                    <tr key={exp._id}
                      className={`hover:bg-[var(--color-bg)] transition-colors ${selected.has(exp._id) ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded"
                          checked={selected.has(exp._id)} onChange={() => toggleSelect(exp._id)} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold truncate max-w-[160px]">{exp.title}</p>
                        {exp.note && <p className="text-xs text-[var(--color-muted)] truncate max-w-[160px]">{exp.note}</p>}
                      </td>
                      <td className="px-4 py-3"><CategoryBadge category={exp.category} /></td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">
                        {format(new Date(exp.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{exp.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-bold font-mono">
                        {formatCurrency(exp.amount, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => { setEditExpense(exp); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-[var(--color-muted)] hover:text-brand-500 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-muted)] hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[var(--color-border)]">
              {expenses.map((exp) => (
                <div key={exp._id} className="p-4 flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded"
                    checked={selected.has(exp._id)} onChange={() => toggleSelect(exp._id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{exp.title}</p>
                      <p className="font-bold text-sm shrink-0 font-mono">{formatCurrency(exp.amount, currency)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <CategoryBadge category={exp.category} />
                      <span className="text-xs text-[var(--color-muted)]">
                        {format(new Date(exp.date), 'dd MMM')} · {exp.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => { setEditExpense(exp); setShowModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-brand-50 text-[var(--color-muted)]">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(exp)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-muted)]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[var(--color-muted)]">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={!pagination.hasPrevPage} onClick={() => setParam('page', params.page - 1)}
              className="btn-secondary p-2 disabled:opacity-40">
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-2 text-xs font-semibold">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button disabled={!pagination.hasNextPage} onClick={() => setParam('page', params.page + 1)}
              className="btn-secondary p-2 disabled:opacity-40">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditExpense(null); }}
        expense={editExpense}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense" size="sm">
        <p className="text-sm text-[var(--color-muted)] mb-5">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
