import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesAPI, analyticsAPI } from '../api';
import toast from 'react-hot-toast';

// ── Expenses ─────────────────────────────────────────────────────────────────

export const useExpenses = (params = {}) =>
  useQuery({
    queryKey: ['expenses', params],
    queryFn:  () => expensesAPI.getAll(params),
    staleTime: 30_000,
    select: (data) => data,
  });

export const useExpense = (id) =>
  useQuery({
    queryKey: ['expense', id],
    queryFn:  () => expensesAPI.getOne(id),
    enabled:  !!id,
    select: (data) => data.data.expense,
  });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expensesAPI.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Expense added!');
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => expensesAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Expense updated!');
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expensesAPI.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Expense deleted.');
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useBulkDelete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expensesAPI.bulkDelete,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });
};

// ── Analytics ────────────────────────────────────────────────────────────────

export const useDashboard = (period = 'month') =>
  useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn:  () => analyticsAPI.getDashboard(period),
    staleTime: 60_000,
    select: (data) => data.data,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ['expense-categories'],
    queryFn:  () => expensesAPI.getCategories(),
    staleTime: Infinity,
    select: (data) => data.data.categories,
  });
