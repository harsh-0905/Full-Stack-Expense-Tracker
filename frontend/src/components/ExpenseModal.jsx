import { useState, useEffect } from 'react';
import { Modal } from './ui';
import { useCreateExpense, useUpdateExpense, useCategories } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'];

const EMPTY = {
  title: '', amount: '', category: 'Other', note: '',
  date: new Date().toISOString().split('T')[0], paymentMethod: 'UPI',
};

export default function ExpenseModal({ open, onClose, expense }) {
  const isEdit = !!expense;
  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const { data: categories = [] } = useCategories();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (expense) {
      setForm({
        title:         expense.title || '',
        amount:        expense.amount || '',
        category:      expense.category || 'Other',
        note:          expense.note || '',
        date:          expense.date ? expense.date.split('T')[0] : EMPTY.date,
        paymentMethod: expense.paymentMethod || 'UPI',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [expense, open]);

  const validate = () => {
    const e = {};
    if (!form.title.trim())         e.title  = 'Title is required';
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0)
                                    e.amount = 'Valid amount required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = { ...form, amount: parseFloat(form.amount) };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: expense._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (_) {}
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input className={`input ${errors.title ? 'border-red-400' : ''}`}
            placeholder="e.g. Lunch at Subway" value={form.title} onChange={set('title')} />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Amount + Payment method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount *</label>
            <input className={`input ${errors.amount ? 'border-red-400' : ''}`}
              type="number" step="0.01" min="0.01" placeholder="0.00"
              value={form.amount} onChange={set('amount')} />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Category + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={form.date} onChange={set('date')} />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="label">Note <span className="normal-case font-normal text-[var(--color-muted)]">(optional)</span></label>
          <textarea className="input resize-none" rows={2}
            placeholder="Any additional details..." value={form.note} onChange={set('note')} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? 'Update' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
