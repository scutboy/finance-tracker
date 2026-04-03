import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Target, CalendarDays, Coins, Trash2, X, AlertCircle, PiggyBank, Pencil } from 'lucide-react';
import { format, parseISO, differenceInMonths } from 'date-fns';

const GOAL_CATEGORIES = ['Emergency Fund', 'Child Education', 'Retirement', 'Property', 'Travel', 'Vehicle', 'Investment', 'Other'];

// ─── Goal Form Modal (Add + Edit) ────────────────────────────────────────────
const GoalFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    category: editItem?.category || 'Emergency Fund',
    target_amount: editItem?.target_amount ?? '',
    current_amount: editItem?.current_amount ?? '0',
    monthly_contribution: editItem?.monthly_contribution ?? '',
    target_date: editItem?.target_date || '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/goals/${editItem.id}`, data)).data;
      return (await api.post('/goals/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to save.'),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({
      name: form.name, category: form.category,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || 0),
      monthly_contribution: parseFloat(form.monthly_contribution),
      target_date: form.target_date,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Savings Goal' : 'Add Savings Goal'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Emergency Fund, Thailand Trip"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select required value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white">
              {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (Rs) *</label>
              <input required type="number" min="1" step="0.01" value={form.target_amount} onChange={e => set('target_amount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Already Saved (Rs)</label>
              <input type="number" min="0" step="0.01" value={form.current_amount} onChange={e => set('current_amount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution (Rs) *</label>
              <input required type="number" min="0" step="0.01" value={form.monthly_contribution} onChange={e => set('monthly_contribution', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date *</label>
              <input required type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Contribute Modal ─────────────────────────────────────────────────────────
const ContributeModal = ({ goal, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => (await api.post(`/goals/${goal.id}/contribution`, data)).data,
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed.'),
  });

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Funds</h2>
            <p className="text-sm text-gray-500 mt-0.5">{goal.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setError(''); mutation.mutate({ amount: parseFloat(amount), contribution_date: new Date().toISOString().split('T')[0], notes: notes || null }); }} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs) *</label>
            <input required type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 25000" autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Monthly transfer, bonus, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"/>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving…' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Savings Page ─────────────────────────────────────────────────────────────
const Savings = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });
  const [contributeGoal, setContributeGoal] = useState(null);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => (await api.get('/goals/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  const totalSaved = goals?.reduce((s, g) => s + g.current_amount, 0) ?? 0;
  const totalTarget = goals?.reduce((s, g) => s + g.target_amount, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Savings Goals</h1>
          <p className="text-gray-500 mt-1">Track progress towards your financial targets.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm font-medium">
          <Plus size={18}/> Add Goal
        </button>
      </div>

      {goals?.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Saved</p>
            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalSaved)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Target</p>
            <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalTarget)}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl"/>)}
        </div>
      ) : goals?.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center flex flex-col items-center gap-3">
          <PiggyBank size={40} className="text-gray-300"/>
          <p className="font-medium text-gray-700">No savings goals yet</p>
          <button onClick={() => setFormModal({ open: true, editItem: null })} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition mt-1">
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const monthsLeft = Math.max(0, differenceInMonths(parseISO(goal.target_date), new Date()));

            return (
              <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col group">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><Target size={20}/></div>
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.name}</h3>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{goal.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => setFormModal({ open: true, editItem: goal })} className="text-gray-400 hover:text-blue-600 p-0.5"><Pencil size={14}/></button>
                    <button onClick={() => deleteMutation.mutate(goal.id)} className="text-gray-400 hover:text-red-500 p-0.5"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-bold">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${percentage}%` }}/>
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs">
                      <span className="font-bold text-green-600">{formatCurrency(goal.current_amount)}</span>
                      <span className="text-gray-400">{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-400 shrink-0"/>
                      <div>
                        <p className="text-xs text-gray-400">Target</p>
                        <p className="text-xs font-semibold text-gray-800">
                          {format(parseISO(goal.target_date), 'MMM yyyy')}
                          <span className="text-gray-400 font-normal ml-1">({monthsLeft}mo)</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins size={14} className="text-gray-400 shrink-0"/>
                      <div>
                        <p className="text-xs text-gray-400">Monthly</p>
                        <p className="text-xs font-semibold text-gray-800">{formatCurrency(goal.monthly_contribution)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => setContributeGoal(goal)}
                  className="mt-4 w-full py-2 text-sm font-medium text-green-600 border border-green-500 rounded-lg hover:bg-green-50 transition">
                  + Add Funds
                </button>
              </div>
            );
          })}
        </div>
      )}

      {formModal.open && (
        <GoalFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
      {contributeGoal && <ContributeModal goal={contributeGoal} onClose={() => setContributeGoal(null)} onSuccess={handleSuccess}/>}
    </div>
  );
};

export default Savings;
