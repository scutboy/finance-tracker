import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, TrendingUp, Trash2, X, AlertCircle, ArrowUpCircle, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Bonus', 'Other'];
const CATEGORY_COLORS = {
  Salary: 'bg-blue-50 text-blue-600', Freelance: 'bg-indigo-50 text-indigo-600',
  Business: 'bg-purple-50 text-purple-600', Investment: 'bg-yellow-50 text-yellow-700',
  Rental: 'bg-orange-50 text-orange-600', Bonus: 'bg-green-50 text-green-600', Other: 'bg-gray-100 text-gray-600',
};

// ─── Income Form Modal (Add + Edit) ──────────────────────────────────────────
const IncomeFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: editItem?.date || today,
    description: editItem?.description || '',
    amount: editItem?.amount ?? '',
    category: editItem?.category || 'Salary',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/income/${editItem.id}`, data)).data;
      return (await api.post('/income/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to save.'),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Income Entry' : 'Add Income'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs) *</label>
              <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input required value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="e.g. Monthly Salary, Freelance Project"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {INCOME_CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => set('category', cat)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition text-center ${
                    form.category === cat ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Income Page ──────────────────────────────────────────────────────────────
const Income = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: incomeList, isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: async () => (await api.get('/income/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['income'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  const totalIncome = incomeList?.reduce((s, i) => s + i.amount, 0) ?? 0;

  const byMonth = {};
  incomeList?.forEach(entry => {
    const key = format(parseISO(entry.date), 'MMMM yyyy');
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(entry);
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Income</h1>
          <p className="text-gray-500 mt-1">Track all your income sources.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium">
          <Plus size={18}/> Add Income
        </button>
      </div>

      {incomeList?.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">All-Time Income</p>
          <p className="text-4xl font-extrabold mt-1">{formatCurrency(totalIncome)}</p>
          <p className="text-emerald-200 text-sm mt-1">{incomeList.length} entries recorded</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl"/>)}</div>
      ) : incomeList?.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center flex flex-col items-center gap-3">
          <TrendingUp size={40} className="text-gray-300"/>
          <p className="font-medium text-gray-700">No income records yet</p>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Add First Income Entry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byMonth).map(([month, entries]) => {
            const monthTotal = entries.reduce((s, e) => s + e.amount, 0);
            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{month}</h2>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(monthTotal)}</span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <tbody className="divide-y divide-gray-50">
                      {entries.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpCircle size={18}/></div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{entry.description}</p>
                                <p className="text-xs text-gray-400">{format(parseISO(entry.date), 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[entry.category] || 'bg-gray-100 text-gray-600'}`}>
                              {entry.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 text-base">
                            + {formatCurrency(entry.amount)}
                          </td>
                          <td className="px-6 py-4 text-right w-20">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => setFormModal({ open: true, editItem: entry })} className="text-gray-400 hover:text-blue-600"><Pencil size={14}/></button>
                              <button onClick={() => deleteMutation.mutate(entry.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formModal.open && (
        <IncomeFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Income;
