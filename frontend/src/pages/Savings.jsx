import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, PiggyBank, Target, Trash2, X, TrendingUp,
  Landmark, Sparkles, Activity, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const GOAL_TYPES = ['Emergency Fund', 'Child Education', 'Retirement', 'Property', 'Vehicle', 'Travel', 'Investment', 'Other'];
const COLORS = ['#2563eb', '#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

const GoalFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    target_amount: editItem?.target_amount ?? '',
    current_amount: editItem?.current_amount ?? '',
    category: editItem?.category || 'Emergency Fund',
    monthly_contribution: editItem?.monthly_contribution ?? 0,
    target_date: editItem?.target_date || new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/goals/${editItem.id}`, data)).data;
      return (await api.post('/goals/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Sync Error.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount),
      monthly_contribution: parseFloat(form.monthly_contribution || 0),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">{isEdit ? 'Edit Goal' : 'New Goal'}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl">{error}</div>}
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Goal / Account Name"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic uppercase tracking-wider"/>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Balance</label>
              <input required type="number" step="0.01" value={form.current_amount} onChange={e => setForm(p => ({ ...p, current_amount: e.target.value }))} placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic"/>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Amount</label>
              <input required type="number" step="0.01" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic"/>
            </div>
          </div>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-950 outline-none uppercase italic">
            {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-blue-600 transition-all">
            {mutation.isPending ? 'Saving...' : (isEdit ? 'Update' : 'Add Goal')}
          </button>
        </form>
      </div>
    </div>
  );
};

const Savings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: async () => (await api.get('/goals/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Separate accounts from savings goals
  const accountGoals = goals?.filter(g =>
    g.name?.toLowerCase().includes('account') ||
    g.name?.toLowerCase().includes('current') ||
    g.name?.toLowerCase().includes('savings a/c')
  ) || [];
  const savingsGoals = goals?.filter(g =>
    !g.name?.toLowerCase().includes('account') &&
    !g.name?.toLowerCase().includes('current') &&
    !g.name?.toLowerCase().includes('savings a/c')
  ) || [];

  const totalSaved = savingsGoals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + (g.target_amount || 1), 0) || 1;
  const aggregateProgress = Math.min((totalSaved / totalTarget) * 100, 100);
  const pieData = savingsGoals.map(g => ({ name: g.name, value: g.current_amount })).filter(d => d.value > 0);

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-slate-950 rounded-2xl animate-pulse mx-auto"/>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto italic">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full">Assets: Active</span>
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{goals?.length || 0} Registered Nodes</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase leading-none">Savings</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 leading-none ml-1">Wealth consolidation & milestone tracking</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-4 px-8 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl">
          <Plus size={18}/> Add Goal / Account
        </button>
      </div>

      {/* ── Live Bank Account Balances ── */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-3">
            <Landmark size={22} className="text-blue-600"/> Live Bank Accounts
          </h2>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
            <Plus size={12}/> Add Account
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {accountGoals.map((acct, i) => {
            const pct = acct.target_amount > 0 ? Math.min((acct.current_amount / acct.target_amount) * 100, 100) : 0;
            return (
              <div key={acct.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"/>
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Account</p>
                    <p className="font-black text-slate-950 text-lg tracking-tighter">{acct.name}</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={18}/></div>
                </div>
                <p className="text-3xl font-black text-slate-950 tracking-tighter relative z-10">{formatCurrency(acct.current_amount)}</p>
                <div className="mt-4 relative z-10">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>{pct.toFixed(0)}% of target</span>
                    <span>Target: {formatCurrency(acct.target_amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 relative z-10">
                  <button onClick={() => setFormModal({ open: true, editItem: acct })}
                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                    Update Balance
                  </button>
                  <button onClick={() => { if(window.confirm('Remove account tracker?')) deleteMutation.mutate(acct.id); }}
                    className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
          {/* Add account placeholder */}
          <div className="bg-slate-50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
            <Landmark size={24} className="text-slate-300"/>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add ComBank / NDB Account</p>
            <button onClick={() => setFormModal({ open: true, editItem: null })}
              className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all">
              Add Account
            </button>
          </div>
        </div>
      </section>

      {/* ── Savings Goals ── */}
      {savingsGoals.length > 0 && (
        <section className="space-y-8 px-6">
          {/* Totals + pie */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group min-h-[260px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"/>
              <div className="relative z-10 flex justify-between items-start">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Total Savings</p>
                <Activity size={18} className="text-blue-500 animate-pulse"/>
              </div>
              <div className="relative z-10">
                <p className="text-5xl font-black text-white tracking-tighter">{formatCurrency(totalSaved)}</p>
                <div className="mt-4 px-4 py-2 bg-white/5 rounded-full border border-white/5 w-fit">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Progress: {aggregateProgress.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {pieData.length > 0 && (
              <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-xl transition-all">
                <div className="h-48 w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={6} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-tighter">Allocation</h3>
                  {savingsGoals.slice(0, 5).map((g, i) => (
                    <div key={g.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{g.name}</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-950">
                        {totalSaved > 0 ? ((g.current_amount / totalSaved) * 100).toFixed(1) : '0.0'}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Goal cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {savingsGoals.map((goal, i) => {
              const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
              const monthsLeft = goal.monthly_contribution > 0
                ? Math.ceil((goal.target_amount - goal.current_amount) / goal.monthly_contribution)
                : null;
              return (
                <div key={goal.id} className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[320px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xl font-black text-slate-950 tracking-tighter leading-none mb-2">{goal.name}</p>
                      <span className="text-[8px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase">{goal.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setFormModal({ open: true, editItem: goal })} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Sparkles size={16}/></button>
                      <button onClick={() => { if(window.confirm('Remove goal?')) deleteMutation.mutate(goal.id); }} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>

                  <div className="mt-auto space-y-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Saved</p>
                        <p className="text-2xl font-black text-slate-950">{formatCurrency(goal.current_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Target</p>
                        <p className="text-xl font-black text-slate-300">{formatCurrency(goal.target_amount)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="w-full bg-slate-50 rounded-full h-6 p-1 overflow-hidden border border-slate-100">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}/>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase">{pct.toFixed(1)}%</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase">
                          {monthsLeft ? `~${monthsLeft} mo` : `Gap: ${formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add goal card */}
            <button onClick={() => setFormModal({ open: true, editItem: null })}
              className="bg-slate-50 rounded-[2rem] p-10 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 min-h-[320px] hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <PiggyBank size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Savings Goal</p>
            </button>
          </div>
        </section>
      )}

      {goals?.length === 0 && !isLoading && (
        <div className="text-center py-32 border-4 border-slate-50 rounded-[4rem] mx-6">
          <PiggyBank size={64} className="text-slate-200 mx-auto mb-6"/>
          <p className="font-black text-slate-300 uppercase tracking-[0.5em] text-sm">No goals yet</p>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="mt-8 px-8 py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">
            Add First Goal
          </button>
        </div>
      )}

      <div className="text-center pt-4 pb-8 mx-6">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] opacity-40">© 2026 {user?.name} · Savings Module v4.3</p>
      </div>

      {formModal.open && (
        <GoalFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['savings'] })}
        />
      )}
    </div>
  );
};

export default Savings;
