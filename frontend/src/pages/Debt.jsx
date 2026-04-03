import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  Landmark, 
  Target as SniperIcon, 
  Pencil, 
  Crosshair,
  ShieldAlert,
  Activity,
  Zap,
  Target,
  ChevronRight,
  Maximize2
} from 'lucide-react';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Mortgage', 'Vehicle', 'Other'];

// ─── Add/Edit Debt Modal ──────────────────────────────────────────────────────
const DebtFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    balance: editItem?.balance ?? '',
    interest_rate: editItem?.interest_rate ?? '',
    min_payment: editItem?.min_payment ?? '',
    type: editItem?.type || 'Credit Card',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/debts/${editItem.id}`, data)).data;
      return (await api.post('/debts/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Handshake Terminal Failure. Target Locked?'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    const payload = {
      ...form,
      balance: parseFloat(form.balance),
      interest_rate: parseFloat(form.interest_rate),
      min_payment: parseFloat(form.min_payment),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 ring-1 ring-black/10 animate-scale-in">
        <div className="flex items-center justify-between p-14 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-rose-600 uppercase tracking-tighter italic leading-none">{isEdit ? 'Refine Target' : 'New Sniper Node'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Liability Identification Active</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-rose-600 p-4 rounded-3xl hover:bg-white transition-all active:scale-95"><X size={32}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-14 space-y-10">
          {error && <div className="flex items-center gap-4 bg-rose-50 text-rose-600 p-8 rounded-3xl text-[12px] font-black uppercase tracking-widest border border-rose-100 shadow-xl shadow-rose-950/10 animate-pulse"><AlertCircle size={24}/>{error}</div>}
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Liability Identifier (Node)</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. PRIMARY_CARD_OUTBOUND"
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-base font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-rose-500/5 focus:border-rose-500 transition-all uppercase tracking-widest italic placeholder:opacity-20"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Balance Delta (Rs)</label>
                <input required type="number" step="0.01" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-black text-slate-950 italic tracking-tighter outline-none focus:ring-[1rem] focus:ring-rose-500/5 focus:border-rose-500 transition-all text-rose-600"/>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Interest Trace (APR %)</label>
                <input required type="number" step="0.1" value={form.interest_rate} onChange={e => setForm(p => ({ ...p, interest_rate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-black text-slate-950 italic tracking-tighter outline-none focus:ring-[1rem] focus:ring-rose-500/5 focus:border-rose-500 transition-all"/>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Min Monthly Influx Required (Rs)</label>
              <input required type="number" step="0.01" value={form.min_payment} onChange={e => setForm(p => ({ ...p, min_payment: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-base font-black text-slate-950 italic tracking-tighter outline-none focus:ring-[1rem] focus:ring-rose-500/5 focus:border-rose-500 transition-all"/>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Liability Sector</label>
              <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-rose-500/5 focus:border-rose-500 transition-all cursor-pointer appearance-none uppercase tracking-widest italic">
                {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all">Abort Protocol</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-14 py-7 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:bg-slate-950 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-5 italic group">
              {mutation.isPending ? 'DEPLOYING...' : 'LOCK TARGET NODE'}
              <Crosshair size={22} className="group-hover:rotate-90 group-hover:scale-125 transition-all duration-500 opacity-60" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Debt Page ───────────────────────────────────────────────────────────
const Debt = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/debts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  const totalOutstanding = debts?.reduce((s, debt) => s + (debt.status !== 'Paid Off' ? debt.balance : 0), 0) || 0;
  const activeTargets = debts?.filter(d => d.status !== 'Paid Off') || [];

  return (
    <div className="space-y-20 pb-40 max-w-7xl mx-auto">
      {/* Dynamic Header Bridge */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-5 mb-4">
             <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full shadow-2xl shadow-rose-500/30 italic">Target Acquisition: Online</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">Active Perimeter Targets: {activeTargets.length} PERSISTENT</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 uppercase italic leading-none">Debt Sniper</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] opacity-60 leading-[2.5] max-w-2xl italic ml-1">High-Precision Identification & Systematic Multi-Asset Liability Neutralization. Debt Snowball Algorithm v2.1 active.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="group flex items-center gap-6 px-14 py-8 bg-slate-950 text-white rounded-[2.5rem] hover:bg-rose-600 transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:scale-105 active:scale-95 shadow-blue-900/40 italic">
          <span className="relative z-10 transition-transform group-hover:translate-x-2">Acquire New Target</span>
          <Plus size={26} className="relative z-10 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Aggregate Overview Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 px-6">
         {/* Combined Exposure Terminal */}
         <div className="bg-slate-950 rounded-[4rem] p-16 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[350px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-700">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-all duration-[4000ms]"></div>
            <div className="relative z-10 flex justify-between items-start">
               <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] italic">Combined Exposure Delta</p>
               <div className="p-4 bg-white/5 rounded-3xl border border-white/5 group-hover:border-rose-500/20 transition-colors">
                  <Activity size={24} className="text-rose-500 animate-pulse" />
               </div>
            </div>
            <p className="text-6xl font-black text-white tracking-tighter italic relative z-10 scale-100 group-hover:scale-[1.02] transition-transform duration-700 drop-shadow-2xl">{formatCurrency(totalOutstanding)}</p>
            <div className="relative z-10 flex items-center justify-between">
               <div className="px-6 py-3 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                  <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.4em] italic leading-none">Status: HIGH_THREAT_REDUCTION</p>
               </div>
               <SniperIcon size={32} className="text-rose-600 opacity-20 group-hover:opacity-60 transition-opacity" />
            </div>
         </div>

         {/* Primary Target Hub */}
         <div className="bg-white rounded-[4rem] p-14 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 hover:scale-[1.02] relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4 leading-none">Primary Sniper Focus</p>
               <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl group-hover:rotate-45 group-hover:animate-pulse transition-all">
                  <Crosshair size={28} />
               </div>
            </div>
            <div className="relative z-10">
               <p className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none mb-6 group-hover:text-rose-600 transition-colors">{activeTargets[0]?.name || 'Zero Targets'}</p>
               <div className="flex items-center gap-4">
                  <div className="px-5 py-2.5 bg-slate-950 text-white rounded-full">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">APR: {activeTargets[0]?.interest_rate || 0}% Trace</p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sector: {activeTargets[0]?.type || 'N/A'}</span>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
         </div>

         {/* Outbound Flux Monitor */}
         <div className="bg-white rounded-[4rem] p-14 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4 leading-none">Monthly Outbound Flux</p>
               <Landmark className="text-slate-200 group-hover:text-amber-500 transition-colors" size={32} />
            </div>
            <div>
               <p className="text-4xl font-black text-slate-950 tracking-tighter italic leading-none mb-6">{formatCurrency(activeTargets.reduce((s,d)=>s+d.min_payment, 0))}</p>
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse shadow-xl shadow-rose-600/50"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Aggregate Minimum Maintenance Flux</p>
               </div>
            </div>
         </div>
      </div>

      {/* Target Record Console Matrix */}
      <div className="bg-white rounded-[4rem] shadow-sm border border-slate-200/50 overflow-hidden mx-6 hover:shadow-2xl transition-all duration-1000 group/table py-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100 italic">
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                <th className="px-16 py-12 text-left">TARGET ID</th>
                <th className="px-16 py-12 text-left">SECTOR</th>
                <th className="px-16 py-12 text-right">APR SCAN</th>
                <th className="px-16 py-12 text-right">PROBE FLUX</th>
                <th className="px-16 py-12 text-right">EXIT VALUE</th>
                <th className="px-16 py-12 w-48"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-16 py-14"><div className="h-14 bg-slate-50 rounded-3xl w-full"></div></td></tr>)
              ) : activeTargets.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-16 py-48 text-center">
                    <div className="flex flex-col items-center gap-10 opacity-10 group-hover/table:opacity-30 transition-all duration-1000">
                       <ShieldAlert size={120} className="text-slate-400" />
                       <p className="font-black uppercase tracking-[0.8em] text-[14px] italic">Perimeter Status: PURE_STABLE. Zero Targets Identified.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeTargets.sort((a,b) => b.interest_rate - a.interest_rate).map(debt => (
                  <tr key={debt.id} className="hover:bg-slate-50/80 group transition-all duration-500 cursor-crosshair">
                    <td className="px-16 py-14">
                      <div className="flex items-center gap-10">
                         <div className="relative">
                            <div className="absolute -inset-4 bg-rose-500/10 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity animate-pulse scale-150"></div>
                            <div className="p-6 bg-white border border-slate-100 text-rose-600 rounded-full shadow-2xl relative z-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-45 group-hover:bg-rose-50">
                               <SniperIcon size={32}/>
                            </div>
                         </div>
                         <div>
                            <p className="font-black text-slate-950 text-3xl tracking-tighter uppercase italic leading-none mb-3 group-hover:translate-x-4 transition-transform duration-500">{debt.name}</p>
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-blink"></div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-60 italic leading-none">Node Lockdown Active</p>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-16 py-14">
                       <span className="text-[11px] font-black bg-slate-950 text-white px-6 py-3 rounded-full uppercase tracking-[0.3em] italic shadow-lg shadow-slate-950/20">{debt.type}</span>
                    </td>
                    <td className="px-16 py-14 text-right">
                       <p className="font-black text-rose-600 text-4xl tracking-tighter leading-none italic group-hover:scale-110 transition-transform origin-right">{debt.interest_rate}<span className="text-[14px] opacity-30 ml-2">%</span></p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 opacity-40 italic">{formatCurrency((debt.balance * debt.interest_rate / 100 / 12))} / MO_LEAK</p>
                    </td>
                    <td className="px-16 py-14 text-right text-slate-400 font-black text-2xl tracking-tighter italic opacity-60">{formatCurrency(debt.min_payment)}</td>
                    <td className="px-16 py-14 text-right">
                       <p className="font-black text-slate-950 text-5xl tracking-tighter italic leading-none group-hover:scale-110 transition-all duration-500 origin-right drop-shadow-sm">
                         {formatCurrency(debt.balance)}
                       </p>
                    </td>
                    <td className="px-16 py-14 text-right">
                       <div className="flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-all translate-x-8 group-hover:translate-x-0">
                        <button onClick={() => setFormModal({ open: true, editItem: debt })} className="p-5 bg-white text-slate-300 hover:text-blue-600 hover:border-blue-100 border border-slate-100 rounded-3xl shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300"><Pencil size={24}/></button>
                        <button onClick={() => {if(window.confirm('IRREVERSIBLE: TERMINATE DATA TRACE?')) deleteMutation.mutate(debt.id); }} className="p-5 bg-white text-slate-300 hover:text-rose-600 hover:border-rose-100 border border-slate-100 rounded-3xl shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300"><Trash2 size={24}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistence Identity Footer */}
      <div className="text-center mt-20 bg-white/40 backdrop-blur-md py-16 rounded-[4rem] border border-slate-100/50 mx-6 group hover:shadow-2xl transition-all duration-1000 relative overflow-hidden">
         <div className="absolute inset-0 bg-rose-500/[0.02] -skew-y-12 animate-pulse pointer-events-none"></div>
         <div className="flex items-center justify-center gap-16 mb-10 relative z-10">
            <Zap size={40} className="text-slate-200 group-hover:text-amber-500 transition-all duration-700" />
            <div className="p-10 bg-slate-950 rounded-[2.5rem] shadow-2xl transition-all duration-700 hover:rotate-[360deg] cursor-pointer">
               <Crosshair size={56} className="text-white" />
            </div>
            <Target size={40} className="text-slate-200 group-hover:text-rose-600 transition-all duration-700" />
         </div>
         <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.7em] italic px-16 leading-[2.5] relative z-10 max-w-5xl mx-auto opacity-40 group-hover:opacity-100 transition-opacity duration-700">Strategic Target Neutralization In Progress. Vantage Tactical Overspend Identification protocol v2.1 -- Persistent Auditing Active.</p>
         <div className="mt-8 flex justify-center gap-6 opacity-20 group-hover:opacity-100 transition-all duration-1000">
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-rose-600">THREAT_IDENTIFIED</span>
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-rose-600">AUTO_REDUCTION_READY</span>
         </div>
      </div>

      {formModal.open && (
        <DebtFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Debt;
