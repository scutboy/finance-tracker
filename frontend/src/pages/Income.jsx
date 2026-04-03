import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Trash2, X, AlertCircle, ArrowUpRight, TrendingUp, Landmark, Calendar, Search } from 'lucide-react';
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
    onError: (e) => setError(e.response?.data?.detail || 'Failed to save.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{isEdit ? 'Refine Influx' : 'Register New Flux'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && <div className="flex items-center gap-3 bg-rose-50 text-rose-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"><AlertCircle size={18}/>{error}</div>}
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Entry Timestamp</label>
                <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Amount (Rs)</label>
                <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all italic"/>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Description Narrative</label>
              <input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Monthly Professional Influx"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"/>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Sector Classification</label>
              <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-8 py-5 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">Abort Sync</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50">
              {mutation.isPending ? 'Writing Flux...' : 'Lock Deposit Node'}
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
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 italic">Financial Influx Verified</span>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Cycle Record Count: {incomes?.length || 0}</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Inbound Flux Console</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">Real-time monitoring of all strategic liquidity deposits.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-4 px-10 py-6 bg-slate-900 text-white rounded-3xl hover:bg-black transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95">
          <Plus size={24}/> New Deposit
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
         <div className="bg-slate-950 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-center border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[3000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 opacity-80 relative z-10">Total Aggregate Influx</p>
            <p className="text-5xl font-black text-emerald-500 tracking-tighter italic relative z-10">{formatCurrency(totalInbound)}</p>
            <div className="absolute bottom-10 right-10 opacity-10 relative z-10">
               <TrendingUp size={64} className="text-emerald-500" />
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 opacity-60">Latest Deposit Narrative</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{incomes?.[0]?.description || 'Zero Logs'}</p>
            <div className="mt-4 flex items-center gap-3">
               <Calendar size={14} className="text-slate-400" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{incomes?.[0] ? format(parseISO(incomes[0].date), 'dd MMM yyyy') : 'No Data'}</span>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 opacity-60">Primary Sector Focus</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Professional Flow</p>
            <div className="mt-4 flex items-center gap-3">
               <Landmark size={14} className="text-slate-400" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Liquid Assets</span>
            </div>
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden mx-2 transition-all hover:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">
                <th className="px-12 py-8 text-left">Sync Timestamp</th>
                <th className="px-12 py-8 text-left">Influx Narrative</th>
                <th className="px-12 py-8 text-left">Sector Cluster</th>
                <th className="px-12 py-8 text-right">Flux Valuation</th>
                <th className="px-12 py-8 w-32"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-12 py-8"><div className="h-10 bg-slate-50 rounded-2xl w-full"></div></td></tr>)
              ) : incomes?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                       <Landmark size={80} className="text-slate-200" />
                       <p className="font-black uppercase tracking-[0.4em] text-[10px]">No Strategic Influx Records Detected</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incomes.map(income => (
                  <tr key={income.id} className="hover:bg-slate-50 group transition-all">
                    <td className="px-12 py-10 whitespace-nowrap text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(parseISO(income.date), 'dd MMM yyyy')}</td>
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl transition-transform group-hover:rotate-12"><ArrowUpRight size={20}/></div>
                        <div>
                           <p className="font-black text-slate-900 text-lg tracking-tight uppercase italic leading-none">{income.description}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{income.category} Deposit Node</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <span className="text-[9px] font-black bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-sm">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-right font-black text-emerald-600 text-3xl italic tracking-tighter">
                      {formatCurrency(income.amount)}
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex items-center justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setFormModal({ open: true, editItem: income })} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-lg hover:scale-110 transition-all"><Plus size={18} className="rotate-45"/></button>
                        <button onClick={() => {if(window.confirm('IRREVERSIBLE: DELETE RECORD?')) deleteMutation.mutate(income.id); }} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-lg hover:scale-110 transition-all"><Trash2 size={18}/></button>
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
