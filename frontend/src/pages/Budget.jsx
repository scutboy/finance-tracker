import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Wallet, Target, Trash2, X, AlertCircle, TrendingDown, Landmark, Sparkles, Filter, PieChart, Activity, Gauge } from 'lucide-react';

const CATEGORIES = [
  'Groceries', 'Dining & Entertainment', 'Transport', 'Utilities',
  'Healthcare', 'Shopping', 'Education', 'Insurance', 'Other'
];

// ─── Add/Edit Budget Modal ───────────────────────────────────────────────────
const BudgetFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    category: editItem?.category || 'Groceries',
    amount: editItem?.amount ?? '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/budget/${editItem.id}`, data)).data;
      return (await api.post('/budget/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to sync sector.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-2xl font-black text-amber-600 uppercase tracking-tighter italic">{isEdit ? 'Refine Allocation' : 'New Sector Lock'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && <div className="flex items-center gap-3 bg-rose-50 text-rose-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"><AlertCircle size={18}/>{error}</div>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Sector Path Identification</label>
              <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Monthly Flux Limit (Rs Cap)</label>
               <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all italic"/>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-8 py-5 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">Abort Protocol</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50">
              {mutation.isPending ? 'LOCKING...' : 'COMMIT SECTOR CAP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Budget Page ─────────────────────────────────────────────────────────
const Budget = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => (await api.get('/budget/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/budget/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  const totalBudgeted = budgets?.reduce((s, b) => s + b.amount, 0) || 0;
  const totalSpent = budgets?.reduce((s, b) => s + (b.total_spent || 0), 0) || 0;
  const overallUsage = Math.min((totalSpent / (totalBudgeted || 1)) * 100, 100);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <span className="text-amber-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 italic">Sector Allocation Active</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ml-2">Flux Constraint Profiles Established</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none uppercase">Budget Allocation</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">Constraint Node Management & Real-time Flux Leak Monitoring.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-3xl hover:bg-black transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 shadow-amber-500/20">
          <Plus size={24}/> Add Constraint
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
         <div className="bg-slate-950 rounded-[3.5rem] p-12 shadow-2xl flex flex-col justify-center border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[3000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6 opacity-80 relative z-10 italic">Consolidated Allocation Cap</p>
            <p className="text-6xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalBudgeted)}</p>
            <div className="absolute bottom-10 right-10 opacity-20 relative z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
               <Gauge size={96} className="text-amber-500" />
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-rose-500 opacity-20 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 opacity-60">Cycle Inbound Consumption</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight italic uppercase leading-none">{formatCurrency(totalSpent)}</p>
            <div className="mt-8 flex items-center justify-between">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                  <Activity size={12} className="text-amber-500" /> System Integrity Check
               </div>
               <span className="text-[14px] font-black italic text-amber-600 uppercase leading-none tracking-tighter">{overallUsage.toFixed(1)}% Usage</span>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-amber-500 opacity-20 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 opacity-60">Allocation Delta Trace</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight italic uppercase leading-none">{formatCurrency(totalBudgeted - totalSpent)}</p>
            <div className="mt-8 flex items-center gap-3">
               <Sparkles size={16} className="text-emerald-500" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Verified Surplus Capacity Node</span>
            </div>
         </div>
      </div>

      {/* Grid of Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-50 rounded-[3rem] animate-pulse"/>)
        ) : budgets?.length === 0 ? (
          <div className="lg:col-span-3 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 p-32 text-center flex flex-col items-center gap-10 shadow-inner">
             <div className="p-12 bg-slate-50 text-slate-200 rounded-[3rem] scale-125">
                <Wallet size={80} />
             </div>
             <div className="max-w-md">
                <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">Zero Constraints Active</h2>
                <p className="text-slate-500 font-black text-sm uppercase tracking-widest opacity-60 leading-relaxed italic">No sector caps established. Initialize a new constraint profile to begin monitoring flux leakages.</p>
             </div>
             <button onClick={() => setFormModal({ open: true, editItem: null })}
               className="bg-amber-600 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 italic">
               Deploy Initial Cap
             </button>
          </div>
        ) : (
          budgets.map(budget => {
            const spent = budget.total_spent || 0;
            const pct = Math.min((spent / budget.amount) * 100, 100);
            const remaining = budget.amount - spent;
            const isCritical = pct > 90;
            const isOver = pct >= 100;

            return (
              <div key={budget.id} className={`bg-white rounded-[3.5rem] p-12 shadow-sm border-2 transition-all group hover:shadow-2xl relative overflow-hidden flex flex-col ${
                isOver ? 'border-rose-100' : isCritical ? 'border-amber-100 shadow-amber-100/30' : 'border-slate-50 shadow-slate-100/20'
              }`}>
                {/* Sector Header */}
                <div className="flex justify-between items-start mb-10">
                   <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl shadow-sm transition-all group-hover:rotate-12 group-hover:scale-110 ${
                        isOver ? 'bg-rose-100 text-rose-600' : isCritical ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'
                      }`}><Target size={28}/></div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-2">{budget.category}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">Identity Node Active</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                      <button onClick={() => setFormModal({ open: true, editItem: budget })} className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-xl hover:scale-110 transition-all border border-slate-50"><Sparkles size={16}/></button>
                      <button onClick={() => { if(window.confirm('IRREVERSIBLE: PURGE CONSTRAINT?')) deleteMutation.mutate(budget.id); }} 
                        className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-xl hover:scale-110 transition-all border border-slate-50"><Trash2 size={16}/></button>
                   </div>
                </div>

                {/* Metrics */}
                <div className="flex items-end justify-between mb-10 px-1">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-60">Allocated Cap</p>
                      <p className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none">{formatCurrency(budget.amount)}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-60">Burn Count</p>
                      <p className={`text-4xl font-black tracking-tighter italic leading-none ${isOver ? 'text-rose-600' : isCritical ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {pct.toFixed(0)}%
                      </p>
                   </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-4 mb-10">
                   <div className="w-full bg-slate-100 rounded-full h-6 p-1 overflow-hidden shadow-inner border border-slate-200 transition-all group-hover:scale-[1.01] relative">
                      <div className={`h-full rounded-full transition-all duration-[2000ms] ease-out shadow-inner ${
                        isOver ? 'bg-rose-500 shadow-rose-500/20' : isCritical ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'
                      }`} style={{ width: `${pct}%` }}>
                         {isOver && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                      </div>
                   </div>
                   <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Consumption Log: <span className="text-slate-900">{formatCurrency(spent)}</span></p>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${remaining >= 0 ? 'text-emerald-600 opacity-60' : 'text-rose-600 animate-pulse'}`}>
                        {remaining >= 0 ? `Delta: ${formatCurrency(remaining)}` : `Exposure: ${formatCurrency(Math.abs(remaining))}`}
                      </p>
                   </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between px-1">
                   {isOver ? (
                      <div className="flex items-center gap-3">
                         <div className="p-1 px-3 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg border border-rose-100 uppercase italic">Leak Breach</div>
                         <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-60 italic">Constraint Overrun Trace</p>
                      </div>
                   ) : isCritical ? (
                      <div className="flex items-center gap-3">
                         <div className="p-1 px-3 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100 uppercase italic">Critical Phase</div>
                         <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest opacity-60 italic">Nearing Allocation Cap</p>
                      </div>
                   ) : (
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic opacity-60">Sovereign Cluster Healthy</p>
                      </div>
                   )}
                   <PieChart size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center mt-12 bg-white/50 backdrop-blur-md py-12 rounded-[3.5rem] border border-slate-100 mx-2 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-rose-600 opacity-10 group-hover:opacity-30 transition-opacity"></div>
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] italic px-10 leading-relaxed mb-4">Vantage Cluster Constraint Protocol — Operational Core Alpha 2.0</p>
         <div className="flex justify-center items-center gap-4 text-slate-300 opacity-40">
            <Landmark size={20}/> <span className="text-xs">•</span> <Filter size={20}/> <span className="text-xs">•</span> <Activity size={20}/>
         </div>
      </div>

      {formModal.open && (
        <BudgetFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Budget;
