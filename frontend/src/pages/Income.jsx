import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Trash2, X, AlertCircle, ArrowUpRight, TrendingUp, Landmark, Calendar, Search, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CATEGORIES = ['Salary', 'Bonus', 'Freelance', 'Investment', 'Other'];

// ─── Add/Edit Income Modal ────────────────────────────────────────────────────
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
    onError: (e) => setError(e.response?.data?.detail || 'Handshake Interrupted. Verify Node Connection.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
        <div className="flex items-center justify-between p-14 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">{isEdit ? 'Modify Influx' : 'Register Flux'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Node Sync Protocol Active</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-950 p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all active:scale-90"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-14 space-y-10">
          {error && <div className="flex items-center gap-4 bg-rose-50 text-rose-600 p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-xl shadow-rose-950/5"><AlertCircle size={20}/>{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Sync Date</label>
              <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all uppercase tracking-widest"/>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Flux Valuation (Rs)</label>
              <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all italic text-xl tracking-tighter"/>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Inbound Narrative</label>
            <input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Monthly Professional Flow"
              className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all uppercase tracking-widest italic"/>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Sector Node Cluster</label>
            <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all uppercase tracking-widest cursor-pointer appearance-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all">Abort Sync</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4">
              {mutation.isPending ? 'Syncing...' : (isEdit ? 'Apply Changes' : 'Initialize Deposit')}
              <ArrowUpRight size={18} className="opacity-50" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Income Page ─────────────────────────────────────────────────────────
const Income = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: incomes, isLoading } = useQuery({
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

  const totalInbound = incomes?.reduce((s, i) => s + i.amount, 0) || 0;

  return (
    <div className="space-y-16 pb-32 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-600/20">Flux Verified</span>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 italic mt-0.5">Records Synchronized: {incomes?.length || 0}</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Inbound Console</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] opacity-60 leading-loose max-w-xl">Precision monitoring of all strategic liquidity intake. High fidelity vault synchronization active.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="group flex items-center gap-6 px-14 py-8 bg-slate-950 text-white rounded-[2.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:scale-105 active:scale-95 relative overflow-hidden">
          <span className="relative z-10 italic">Register New Flux</span>
          <Plus size={24} className="relative z-10 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Aggregate Overview Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
         <div className="bg-slate-950 rounded-[3rem] p-12 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[300px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <div className="relative z-10 flex justify-between items-start">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Total Aggregate Inflow</p>
               <TrendingUp size={24} className="text-emerald-500 opacity-40" />
            </div>
            <p className="text-6xl font-black text-emerald-500 tracking-tighter italic relative z-10">{formatCurrency(totalInbound)}</p>
            <div className="relative z-10">
               <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20">Metric_Verified_Stable</span>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-200/50 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Latest Log Narrative</p>
               <Search size={22} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
               <p className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-tight mb-4 group-hover:text-blue-600 transition-colors">{incomes?.[0]?.description || 'Buffer Empty'}</p>
               <div className="flex items-center gap-4 text-slate-400">
                  <Calendar size={14} className="opacity-50" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] italic">{incomes?.[0] ? format(parseISO(incomes[0].date), 'dd MMM yyyy') : 'No Sync Data'}</span>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-200/50 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Primary Flow Sector</p>
               <Landmark size={22} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
               <p className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-tight mb-4">{incomes?.[0]?.category || 'Undefined'}</p>
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-600/50"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Financial Matrix Valid</span>
               </div>
            </div>
         </div>
      </div>

      {/* High-Contrast Record Console */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-200/50 overflow-hidden mx-4 hover:shadow-2xl transition-all duration-700 group/table">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">
                <th className="px-14 py-10 text-left">Timestamp</th>
                <th className="px-14 py-10 text-left">Influx Narrative</th>
                <th className="px-14 py-10 text-left">Sector Cluster</th>
                <th className="px-14 py-10 text-right">Flux Valuation</th>
                <th className="px-14 py-10 w-48"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-14 py-12"><div className="h-10 bg-slate-50 rounded-2xl w-full"></div></td></tr>)
              ) : incomes?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-14 py-40 text-center">
                    <div className="flex flex-col items-center gap-8 opacity-20 group-hover/table:opacity-40 transition-opacity">
                       <Landmark size={100} className="text-slate-400" />
                       <p className="font-black uppercase tracking-[0.6em] text-[12px] italic">Zero Liquidity Logs Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incomes.map(income => (
                  <tr key={income.id} className="hover:bg-slate-50 group transition-all duration-300">
                    <td className="px-14 py-12 whitespace-nowrap text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono italic">
                      {format(parseISO(income.date), 'dd / MM / yy')}
                    </td>
                    <td className="px-14 py-12">
                      <div className="flex items-center gap-8">
                        <div className="p-5 bg-white border border-slate-100 text-emerald-600 rounded-3xl shadow-sm transition-transform group-hover:rotate-12 group-hover:scale-110"><ArrowUpRight size={24}/></div>
                        <div>
                           <p className="font-black text-slate-950 text-2xl tracking-tighter uppercase italic leading-none">{income.description}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60">Verified {income.category} Deposit</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-14 py-12">
                      <span className="text-[9px] font-black bg-slate-900 text-white px-5 py-2.5 rounded-full uppercase tracking-[0.3em] italic shadow-lg shadow-slate-900/10">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-14 py-12 text-right">
                       <p className="font-black text-emerald-600 text-4xl italic tracking-tighter group-hover:scale-105 transition-transform origin-right">
                         {formatCurrency(income.amount)}
                       </p>
                    </td>
                    <td className="px-14 py-12 text-right">
                      <div className="flex items-center justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setFormModal({ open: true, editItem: income })} className="p-4 bg-white text-slate-400 hover:text-blue-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-100"><Edit3 size={20}/></button>
                        <button onClick={() => {if(window.confirm('IRREVERSIBLE: TERMINATE DATA NODE?')) deleteMutation.mutate(income.id); }} className="p-4 bg-white text-slate-400 hover:text-rose-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-100"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
