import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Trash2, X, AlertCircle, Wallet, Pencil } from 'lucide-react';

const BUDGET_TYPES = ['Essential', 'Discretionary', 'Savings', 'Debt'];
const BUDGET_TYPE_LABELS = { Essential: 'Essential', Discretionary: 'Discretionary', Savings: 'Savings', Debt: 'Debt Repayment' };

// ─── Category Form Modal (Add + Edit) ────────────────────────────────────────
const CategoryFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    monthly_budget: editItem?.monthly_budget ?? '',
    type: editItem?.type || 'Essential',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/budget/categories/${editItem.id}`, data)).data;
      return (await api.post('/budget/categories', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to save.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ name: form.name, monthly_budget: parseFloat(form.monthly_budget), type: form.type });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Category' : 'Add Budget Category'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Groceries, Netflix, Fuel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (Rs) *</label>
            <input required type="number" min="1" step="0.01" value={form.monthly_budget}
              onChange={e => setForm(p => ({ ...p, monthly_budget: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 bg-white">
              {BUDGET_TYPES.map(t => <option key={t} value={t}>{BUDGET_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Budget Page ──────────────────────────────────────────────────────────────
const Budget = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['budgetCategories'],
    queryFn: async () => (await api.get('/budget/')).data,
  });

  const { data: expenses } = useQuery({
    queryKey: ['expensesThisMonth'],
    queryFn: async () => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return (await api.get(`/expenses?month=${month}`)).data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/budget/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgetCategories'] }),
  });

  const handleSuccess = () => queryClient.invalidateQueries({ queryKey: ['budgetCategories'] });

  const spendingByCategory = {};
  expenses?.forEach(e => { spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + e.amount; });

  const enriched = categories?.map(cat => ({ ...cat, spent: spendingByCategory[cat.name] || 0 })) ?? [];
  const totalBudget = enriched.reduce((s, c) => s + c.monthly_budget, 0);
  const totalSpent = enriched.reduce((s, c) => s + c.spent, 0);
  const overallHealth = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budget Tracker</h1>
          <p className="text-gray-500 mt-1">Monthly spending limits vs actual spend.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium">
          <Plus size={18}/> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl"/>
      ) : enriched.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center flex flex-col items-center gap-3">
          <Wallet size={40} className="text-gray-300"/>
          <p className="font-medium text-gray-700">No budget categories yet</p>
          <button onClick={() => setFormModal({ open: true, editItem: null })} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition mt-1">
            Add your first category
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Budget</p>
              <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Spent This Month</p>
              <p className={`text-2xl font-extrabold ${totalSpent > totalBudget ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Remaining</p>
              <p className={`text-2xl font-extrabold ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(totalBudget - totalSpent))}
                {totalBudget - totalSpent < 0 && <span className="text-sm font-normal ml-1">over</span>}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Spent</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase w-1/4">Usage</th>
                  <th className="px-6 py-3.5 w-20"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enriched.map(cat => {
                  const pct = cat.monthly_budget > 0 ? (cat.spent / cat.monthly_budget) * 100 : 0;
                  const isOver = pct > 100;
                  let barColor = 'bg-green-500', textColor = 'text-green-600';
                  if (pct > 75) { barColor = 'bg-amber-500'; textColor = 'text-amber-600'; }
                  if (isOver) { barColor = 'bg-red-500'; textColor = 'text-red-600'; }

                  return (
                    <tr key={cat.id} className="hover:bg-gray-50 transition group">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">{cat.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{BUDGET_TYPE_LABELS[cat.type] || cat.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500 font-medium">{formatCurrency(cat.monthly_budget)}</td>
                      <td className={`px-6 py-4 text-right text-sm font-bold ${textColor}`}>{formatCurrency(cat.spent)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }}/>
                          </div>
                          <span className={`text-xs font-bold w-10 text-right ${textColor}`}>{pct.toFixed(0)}%</span>
                        </div>
                        {isOver && <p className="text-[10px] text-red-600 font-bold mt-0.5">OVER BUDGET</p>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => setFormModal({ open: true, editItem: cat })} className="text-gray-400 hover:text-blue-600"><Pencil size={14}/></button>
                          <button onClick={() => deleteMutation.mutate(cat.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-sm font-bold text-gray-900">Monthly Total</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(totalBudget)}</td>
                  <td className={`px-6 py-4 text-right text-sm font-bold ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totalSpent)}</td>
                  <td colSpan="2" className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${totalSpent > totalBudget ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {overallHealth.toFixed(0)}% used
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {formModal.open && (
        <CategoryFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Budget;
