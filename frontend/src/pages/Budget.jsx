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
    onError: (e) => setError(e.response?.data?.detail || 'Sector Lock Terminated. Check Node Integrity.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 ring-1 ring-black/5 animate-scale-in">
        <div className="flex items-center justify-between p-14 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">{isEdit ? 'Refine Allocation' : 'New Sector Lock'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Constraint Protocol Initialization</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 p-4 rounded-3xl hover:bg-white transition-all active:scale-95 shadow-sm"><X size={32}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-14 space-y-10">
          {error && <div className="flex items-center gap-4 bg-rose-50 text-rose-600 p-8 rounded-3xl text-[12px] font-black uppercase tracking-widest border border-rose-100 shadow-xl opacity-80"><AlertCircle size={24}/>{error}</div>}
          
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.5em] italic leading-none">Sector Path Identification</label>
              <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-8 text-sm font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest cursor-pointer appearance-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.5em] italic leading-none">Monthly Flux Limit (Rs Cap)</label>
               <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-8 text-xl font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-blue-500/5 focus:border-blue-500 transition-all italic tracking-tighter placeholder:opacity-20"/>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all">Abort Protocol</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-16 py-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic flex items-center gap-6">
              {mutation.isPending ? 'LOCKING...' : 'COMMIT SECTOR CAP'}
              <Target size={22} className="opacity-40 select-none" />
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
    <div className="space-y-20 pb-40 max-w-7xl mx-auto">
      {/* Header Context Bridge */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-5 mb-4">
             <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full shadow-2xl shadow-blue-500/20 italic">Sector Allocation Active</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">Flux Constraint Profiles PERSISTENT</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Budget Guard</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] opacity-60 leading-[2.5] max-w-2xl italic ml-1">Constraint Node Management & Real-time Outbound Flux Leak Monitoring. System-wide overspend neutralization active.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="group flex items-center gap-6 px-14 py-8 bg-slate-950 text-white rounded-[2.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:scale-105 active:scale-95 shadow-blue-900/40 italic">
          <span className="relative z-10 transition-transform group-hover:translate-x-2">Add Constraint</span>
          <Plus size={26} className="relative z-10 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Aggregate Overview Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 px-6">
         {/* Consolidated Allocation Cap */}
         <div className="bg-slate-950 rounded-[4rem] p-16 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[350px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-700">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-all duration-[4000ms]"></div>
            <div className="relative z-10 flex justify-between items-start">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Consolidated Allocation Cap</p>
               <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                  <Gauge size={24} className="text-blue-500 group-hover:animate-spin-slow transition-all duration-1000" />
               </div>
            </div>
            <p className="text-6xl font-black text-white tracking-tighter italic relative z-10 scale-100 group-hover:scale-[1.02] transition-transform duration-700 drop-shadow-2xl">{formatCurrency(totalBudgeted)}</p>
            <div className="relative z-10 flex items-center justify-between">
               <div className="px-6 py-3 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic leading-none">System Load: NOMINAL</p>
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.8em] text-white/10 italic">METRIC_AUDIT_STABLE</span>
            </div>
         </div>

         {/* Cycle Consumption Monitor */}
         <div className="bg-white rounded-[4rem] p-14 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 hover:scale-[1.02] relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic mb-4 leading-none">Cycle Inbound Flux</p>
               <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-500">
                  <Activity size={28} className="group-hover:animate-pulse" />
               </div>
            </div>
            <div className="relative z-10">
               <p className="text-4xl font-black text-slate-950 tracking-tight italic uppercase leading-none mb-6 group-hover:text-blue-600 transition-colors">{formatCurrency(totalSpent)}</p>
               <div className="flex items-center gap-6">
                  <div className="px-4 py-2 bg-slate-950 text-white rounded-full">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">{overallUsage.toFixed(1)}% Usage</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Integrity Secure</span>
                  </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
         </div>

         {/* Allocation Delta Hub */}
         <div className="bg-white rounded-[4rem] p-14 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4 leading-none">Allocation Delta Trace</p>
               <Sparkles className="text-emerald-500 opacity-20 group-hover:opacity-100 transition-all duration-700 hover:scale-125" size={32} />
            </div>
            <div>
               <p className="text-4xl font-black text-emerald-600 tracking-tighter italic uppercase leading-none mb-6 group-hover:scale-105 transition-transform origin-left drop-shadow-sm">{formatCurrency(totalBudgeted - totalSpent)}</p>
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                     <TrendingDown size={14} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Verified Surplus Capacity Node</p>
               </div>
            </div>
         </div>
      </div>

      {/* Grid of Budget Constraint Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-[450px] bg-white border border-slate-50 rounded-[4rem] animate-pulse"/>)
        ) : budgets?.length === 0 ? (
          <div className="lg:col-span-3 bg-white rounded-[5rem] border-8 border-dotted border-slate-50 p-48 text-center flex flex-col items-center gap-12 shadow-inner group hover:bg-slate-50/10 transition-all duration-700">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-400/10 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
                <div className="p-16 bg-white shadow-2xl rounded-[4rem] border border-slate-50 scale-110 group-hover:scale-125 transition-all duration-700">
                   <Wallet size={120} className="text-slate-100 group-hover:text-blue-600/10 transition-colors" />
                </div>
             </div>
             <div className="max-w-xl space-y-6">
                <h2 className="text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">Zero Constraints Active</h2>
                <p className="text-slate-400 font-black text-sm uppercase tracking-[0.5em] opacity-40 leading-[2.5] italic">No sector caps established. Initialize a new constraint profile to begin monitoring flux leakages through the system perimeter.</p>
             </div>
             <button onClick={() => setFormModal({ open: true, editItem: null })}
               className="bg-slate-950 text-white px-20 py-8 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/40 italic">
               Deploy Initial Profile
             </button>
          </div>
        ) : (
          budgets.map(budget => {
            const spent = budget.total_spent || 0;
            const pct = Math.min((spent / (budget.amount || 1)) * 100, 100);
            const remaining = budget.amount - spent;
            const isCritical = pct > 90;
            const isOver = pct >= 100;

            return (
              <div key={budget.id} className={`bg-white rounded-[4rem] p-16 shadow-sm border-2 transition-all duration-700 group hover:shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[480px] ${
                isOver ? 'border-rose-100 bg-rose-50/5' : isCritical ? 'border-amber-100' : 'border-slate-50'
              }`}>
                {/* Sector Identity Header */}
                <div className="flex justify-between items-start mb-12 relative z-10 transition-all">
                   <div className="flex items-center gap-8">
                      <div className={`p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                        isOver ? 'text-rose-600 border-rose-100' : isCritical ? 'text-amber-500 border-amber-100' : 'text-slate-300'
                      }`}><Target size={36}/></div>
                      <div>
                        <h3 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none mb-3 group-hover:text-blue-600 transition-colors drop-shadow-sm">{budget.category}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-40 leading-none">Path Identification: VERIFIED</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-12 group-hover:translate-x-0">
                      <button onClick={() => setFormModal({ open: true, editItem: budget })} className="p-4 bg-white text-slate-300 hover:text-blue-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-50"><Sparkles size={22}/></button>
                      <button onClick={() => { if(window.confirm('IRREVERSIBLE: PURGE ASSET CONSTRAINT?')) deleteMutation.mutate(budget.id); }} 
                        className="p-4 bg-white text-slate-300 hover:text-rose-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-50"><Trash2 size={22}/></button>
                   </div>
                </div>

                {/* Metrics Terminal Section */}
                <div className="space-y-12 relative z-10">
                   <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 italic leading-none">Allocated Sector Cap</p>
                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic leading-none group-hover:scale-105 transition-transform origin-left duration-500">{formatCurrency(budget.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 italic leading-none uppercase">Burn Count</p>
                        <p className={`text-5xl font-black tracking-tighter italic leading-none group-hover:scale-110 transition-transform origin-right duration-500 ${isOver ? 'text-rose-600 animate-pulse' : isCritical ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {pct.toFixed(0)}%
                        </p>
                      </div>
                   </div>

                   {/* Constraint Progress Bar HUD */}
                   <div className="space-y-6">
                      <div className="w-full bg-slate-50 rounded-full h-10 p-2 overflow-hidden shadow-inner border border-slate-100 transition-all group-hover:scale-[1.01] relative flex items-center">
                        <div className={`h-full rounded-full transition-all duration-[2000ms] ease-out relative z-10 ${
                          isOver ? 'bg-rose-500 shadow-xl shadow-rose-500/40' : isCritical ? 'bg-amber-500 shadow-xl shadow-amber-500/40' : 'bg-emerald-500 shadow-xl shadow-emerald-500/40'
                        }`} style={{ width: `${pct}%` }}>
                           <div className="absolute inset-0 bg-white/20 blur-[4px]"></div>
                        </div>
                        {isOver && <div className="absolute inset-0 bg-rose-600/10 animate-pulse z-0"></div>}
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Cumulative Burn: <span className="text-slate-950">{formatCurrency(spent)}</span></p>
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] italic ${remaining >= 0 ? 'text-emerald-500' : 'text-rose-600 font-extrabold shadow-rose-500/20'}`}>
                          {remaining >= 0 ? `Delta: ${formatCurrency(remaining)}` : `Exposure: ${formatCurrency(Math.abs(remaining))}`}
                        </p>
                      </div>
                   </div>
                </div>

                {/* Tactical Footer Logic */}
                <div className="mt-14 pt-10 border-t border-slate-50 flex items-center justify-between relative z-10 px-2">
                   {isOver ? (
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-rose-100 text-rose-600 rounded-xl animate-bounce shadow-lg shadow-rose-500/20"><ShieldAlert size={18}/></div>
                         <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.5em] italic leading-none">Constraint Breach Trace: SEC_LEVEL_RED</p>
                      </div>
                   ) : isCritical ? (
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-amber-100 text-amber-600 rounded-xl animate-pulse shadow-lg shadow-amber-500/20"><Activity size={18}/></div>
                         <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em] italic leading-none">Phase Critical: Nearing Sector Cap</p>
                      </div>
                   ) : (
                      <div className="flex items-center gap-4">
                         <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic leading-none">Sovereign Cluster Load NOMINAL</p>
                      </div>
                   )}
                   <button className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-4 transition-all duration-500 italic group/btn">
                      Audit Node <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                   </button>
                </div>

                {/* Decorative Perspective Patterns */}
                <div className={`absolute bottom-[-80px] right-[-80px] w-64 h-64 border border-slate-100 rounded-full opacity-5 pointer-events-none transition-all duration-[3000ms] group-hover:scale-150 group-hover:opacity-10 rotate-45 ${isOver ? 'border-rose-200' : ''}`}></div>
              </div>
            );
          })
        )}
      </div>

      {/* System Integrity Footer Terminal */}
      <div className="text-center mt-24 bg-white shadow-2xl shadow-slate-900/[0.03] py-20 rounded-[5rem] border border-slate-200/50 mx-6 group hover:border-blue-100 transition-all duration-1000 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-500/[0.01] skew-y-12 animate-pulse pointer-events-none"></div>
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
         <div className="flex items-center justify-center gap-16 mb-12 relative z-10">
            <Landmark size={40} className="text-slate-200 group-hover:text-emerald-500 transition-all duration-700 hover:rotate-[15deg]" />
            <div className="p-10 bg-slate-950 rounded-[3rem] shadow-4xl transition-all duration-1000 hover:rotate-[360deg] cursor-pointer group-hover:scale-110">
               <Filter size={56} className="text-white" />
            </div>
            <Activity size={40} className="text-slate-200 group-hover:text-rose-500 transition-all duration-700 hover:-rotate-[15deg]" />
         </div>
         <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.8em] italic px-16 leading-[2.8] relative z-10 max-w-5xl mx-auto opacity-40 group-hover:opacity-100 transition-opacity duration-700">Vantage Cluster Constraint Protocol Alpha v2.5.1-Stable -- Operational Sector Flux Auditing Continuous -- Integrity Matrix Persistence Confirmed.</p>
         <div className="mt-12 flex justify-center gap-10 opacity-10 group-hover:opacity-60 transition-all duration-1000">
            <span className="text-[9px] font-black uppercase tracking-[1em] text-emerald-600">CLUSTER_HEALTH: OPTIMAL</span>
            <span className="text-[9px] font-black uppercase tracking-[1em] text-rose-600">BREACH_DETECTION: PRIMARY_SENSOR_ARMED</span>
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
