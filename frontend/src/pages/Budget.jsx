import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Wallet, 
  Target, 
  Trash2, 
  X, 
  AlertCircle, 
  TrendingDown, 
  Landmark, 
  Sparkles, 
  Filter, 
  PieChart, 
  Activity, 
  Gauge,
  Zap,
  ShieldAlert,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Groceries', 'Dining & Entertainment', 'Transport', 'Utilities',
  'Healthcare', 'Shopping', 'Education', 'Insurance', 'Other'
];

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
    onError: (e) => setError(e.response?.data?.detail || 'Sync Error.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">{isEdit ? 'Refine Allocation' : 'New Sector Lock'}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-950 outline-none uppercase italic">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Amount Cap"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic"/>
          <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-blue-600 transition-all">
            {mutation.isPending ? 'LOCKING...' : 'COMMIT CAP'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Budget = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => (await api.get('/budget/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/budget/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:['budgets'] });
      queryClient.invalidateQueries({ queryKey:['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey:['budgets'] });
    queryClient.invalidateQueries({ queryKey:['dashboardSummary'] });
  };

  const totalBudgeted = budgets?.reduce((s, b) => s + b.amount, 0) || 0;
  const totalSpent = budgets?.reduce((s, b) => s + (b.total_spent || 0), 0) || 0;
  const overallUsage = Math.min((totalSpent / (totalBudgeted || 1)) * 100, 100);

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full italic">Allocation Active</span>
             <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">Constraints Persistent</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Budget Guard</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">Flux constraint management.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl italic flex items-center gap-4">
          Add Constraint <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 px-6">
         <div className="xl:col-span-2 bg-slate-950 rounded-[2.5rem] p-10 shadow-3xl border border-white/5 relative overflow-hidden group min-h-[300px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 italic leading-none">Intelligence Hub: Tactical Guidance</p>
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">How Budget Guard Operates</h3>
               <div className="space-y-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed italic opacity-80 decoration-blue-500/30 underline-offset-4 decoration-dotted">1. Define Sector Caps: establish monthly limits for core expense categories.</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed italic opacity-80">2. Live Burn Rate: the system automatically tracks real-time expenditure against these caps.</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed italic opacity-80">3. Exposure Warning: bars turn <span className="text-rose-500 font-black underline">ROSE</span> when a cap is breached, flagging a systemic deficit node.</p>
               </div>
            </div>
            <div className="relative z-10 flex items-center justify-between pt-8 border-t border-white/5 mt-8">
               <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20 italic">VANTAGE_GUARD_v2.5</span>
               <div className="p-3 bg-white/5 rounded-xl text-blue-500 animate-pulse"><ShieldAlert size={20}/></div>
            </div>
         </div>

         <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all h-full">
               <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4 leading-none">Consolidated Cap</p>
                  <p className="text-4xl font-black text-slate-950 tracking-tighter italic">{formatCurrency(totalBudgeted)}</p>
               </div>
               <div className="pt-6 border-t border-slate-50 mt-4 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic opacity-60">Status: PERSISTENT</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all h-full">
               <div className="space-y-6">
                  <div className="flex justify-between items-start">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Absorption Delta</p>
                     <p className="text-2xl font-black text-emerald-600 tracking-tighter italic">{overallUsage.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${overallUsage}%` }}></div>
                  </div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic opacity-40">System suggesting node adjustment if delta exceeds 85%.</p>
               </div>
            </div>
         </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-80 bg-white rounded-[2rem] animate-pulse"/>)
        ) : budgets?.length === 0 ? (
          <div className="lg:col-span-3 text-center py-40 bg-white rounded-[2rem] border-4 border-dotted border-slate-50 italic font-black text-slate-300 uppercase tracking-[0.5em]">No Constraints Active</div>
        ) : (
          budgets.map(budget => {
            const spent = budget.total_spent || 0;
            const pct = Math.min((spent / (budget.amount || 1)) * 100, 100);
            const remaining = budget.amount - spent;
            const isOver = pct >= 100;

            return (
              <div key={budget.id} className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div>
                     <h3 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase truncate mb-1">{budget.category}</h3>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Node: Verified</p>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setFormModal({ open: true, editItem: budget })} className="text-slate-300 hover:text-blue-600"><Sparkles size={16}/></button>
                      <button onClick={() => { if(window.confirm('Delete?')) deleteMutation.mutate(budget.id); }} className="text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                   </div>
                </div>

                <div className="space-y-8 relative z-10 mt-auto">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2 italic">Cap</p>
                        <p className="text-2xl font-black text-slate-950 tracking-tighter italic">{formatCurrency(budget.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-4xl font-black tracking-tighter italic ${isOver ? 'text-rose-600' : 'text-emerald-500'}`}>{pct.toFixed(0)}%</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="w-full bg-slate-100 rounded-full h-8 p-1 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-[9px] font-black text-slate-400 uppercase italic">Burn: {formatCurrency(spent)}</p>
                        <p className={`text-[9px] font-black uppercase italic ${remaining >= 0 ? 'text-emerald-500' : 'text-rose-600'}`}>
                           {remaining >= 0 ? `Gap: ${formatCurrency(remaining)}` : `Exposure: ${formatCurrency(Math.abs(remaining))}`}
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center mt-20 bg-white/40 backdrop-blur-md py-12 rounded-[2rem] border border-slate-100 mx-6">
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.8em] italic px-16 opacity-60">© 2026 {user?.name}. Guard v2.5 -- Sector Flux Auditing.</p>
      </div>

      {formModal.open && <BudgetFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={handleSuccess} />}
    </div>
  );
};

export default Budget;
