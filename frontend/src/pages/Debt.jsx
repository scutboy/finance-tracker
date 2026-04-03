import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Target, Trash2, X, AlertCircle, Landmark, TrendingDown, Target as SniperIcon, Pencil, Crosshair } from 'lucide-react';

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
    onError: (e) => setError(e.response?.data?.detail || 'Failed to sync.'),
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-2xl font-black text-rose-600 uppercase tracking-tighter italic">{isEdit ? 'Target Refinement' : 'New Sniper Target'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && <div className="flex items-center gap-3 bg-rose-50 text-rose-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"><AlertCircle size={18}/>{error}</div>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Debt Identity (Descriptor)</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. BOC Primary Matrix"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all uppercase tracking-widest"/>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Total Balance (Rs)</label>
                <input required type="number" step="0.01" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all italic"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">APR Rate (%)</label>
                <input required type="number" step="0.1" value={form.interest_rate} onChange={e => setForm(p => ({ ...p, interest_rate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all italic"/>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Minimum Flux Target (Monthly Rs)</label>
              <input required type="number" step="0.01" value={form.min_payment} onChange={e => setForm(p => ({ ...p, min_payment: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all italic"/>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Liability Sector</label>
              <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all">
                {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-8 py-5 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">Abort Lock</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-10 py-5 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50">
              {mutation.isPending ? 'DEPLOYING...' : 'FORCE LOCK TARGET'}
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
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <span className="text-rose-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 italic">Target Acquisition: Online</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Perimeter Accounts: {activeTargets.length} Traceable</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-rose-900 uppercase italic leading-none">Debt Sniper Console</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">High-Precision Identification & Systematic Balance Elimination.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-4 px-12 py-6 bg-rose-600 text-white rounded-3xl hover:bg-rose-700 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 shadow-rose-600/20">
          <Plus size={24}/> Add New Target
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
         <div className="bg-slate-950 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-center border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[3000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 opacity-80 relative z-10 italic">Combined Exposure Delta</p>
            <p className="text-5xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalOutstanding)}</p>
            <div className="absolute bottom-10 right-10 opacity-20 relative z-10 transition-transform group-hover:rotate-45">
               <SniperIcon size={80} className="text-rose-500" />
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Primary Target Trace</p>
               <Crosshair className="text-rose-600 group-hover:animate-spin" size={24} />
            </div>
            <p className="text-2xl font-black text-slate-950 tracking-tight italic uppercase">{activeTargets[0]?.name || 'Zero Targets'}</p>
            <div className="mt-4 flex items-center gap-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">APR: {activeTargets[0]?.interest_rate || 0}% Matrix</span>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Monthly Min Protocol</p>
               <Landmark className="text-slate-400" size={24} />
            </div>
            <p className="text-2xl font-black text-slate-950 tracking-tight italic uppercase">{formatCurrency(activeTargets.reduce((s,d)=>s+d.min_payment, 0))}</p>
            <div className="mt-4 flex items-center gap-3">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">Aggregate Minimum Outbound Flux</p>
            </div>
         </div>
      </div>

      {/* Targets Table */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden mx-2 transition-all hover:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100 italic">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                <th className="px-12 py-8 text-left">Target ID</th>
                <th className="px-12 py-8 text-left">Classification</th>
                <th className="px-12 py-8 text-right">APR Trace</th>
                <th className="px-12 py-8 text-right">Min Probe</th>
                <th className="px-12 py-8 text-right">Exit Value</th>
                <th className="px-12 py-8 w-32"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-12 py-10"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td></tr>)
              ) : activeTargets.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center gap-8 opacity-20">
                       <Crosshair size={96} className="text-slate-500" />
                       <p className="font-black uppercase tracking-[0.5em] text-[12px]">Perimeter Status: Pure. Zero Liabilities Identified.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeTargets.sort((a,b) => b.interest_rate - a.interest_rate).map(debt => (
                  <tr key={debt.id} className="hover:bg-slate-50 group transition-all cursor-crosshair">
                    <td className="px-12 py-12">
                      <div className="flex items-center gap-8">
                         <div className="relative">
                            <div className="absolute -inset-2 bg-rose-500/10 rounded-full blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                            <div className="p-4 bg-white text-rose-600 rounded-full shadow-lg border border-rose-50 transform group-hover:scale-125 transition-all">
                               <SniperIcon size={24}/>
                            </div>
                         </div>
                         <div>
                            <p className="font-black text-slate-950 text-2xl tracking-tighter uppercase italic leading-none">{debt.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60 italic">Node Lockdown Established</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-12 py-12">
                       <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-4 py-2 rounded-xl border border-rose-100 uppercase tracking-[0.2em]">{debt.type}</span>
                    </td>
                    <td className="px-12 py-12 text-right">
                       <p className="font-black text-rose-600 text-2xl tracking-tight leading-none italic">{debt.interest_rate}% <span className="text-[10px] uppercase opacity-50 ml-1 tracking-widest">APR</span></p>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{formatCurrency((debt.balance * debt.interest_rate / 100 / 12))} leak/mo</p>
                    </td>
                    <td className="px-12 py-12 text-right font-black text-slate-400 text-xl tracking-tighter">{formatCurrency(debt.min_payment)}</td>
                    <td className="px-12 py-12 text-right font-black text-slate-900 text-4xl tracking-tighter italic transform group-hover:scale-105 transition-all origin-right">
                      {formatCurrency(debt.balance)}
                    </td>
                    <td className="px-12 py-12 text-right">
                       <div className="flex items-center justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setFormModal({ open: true, editItem: debt })} className="p-4 bg-white text-slate-400 hover:text-blue-600 rounded-2xl shadow-xl hover:scale-110 transition-all"><Pencil size={20}/></button>
                        <button onClick={() => {if(window.confirm('IRREVERSIBLE: TERMINATE TRACE?')) deleteMutation.mutate(debt.id); }} className="p-4 bg-white text-slate-400 hover:text-rose-600 rounded-2xl shadow-xl hover:scale-110 transition-all"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mt-8">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Strategic Asset Neutralization Active Section 2.1</p>
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
