import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Trash2, X, AlertCircle, ArrowUpRight, TrendingUp, Landmark, Calendar, Search, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CATEGORIES = ['Salary', 'Bonus', 'Freelance', 'Investment', 'Other'];

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
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">{isEdit ? 'Modify Inflow' : 'Register Flux'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-950 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"/>
            <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"/>
          </div>
          <input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none italic"/>
          <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black uppercase outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-emerald-600 transition-all">
            {mutation.isPending ? 'Syncing...' : 'Confirm Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
};

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
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full italic">Flux Verified</span>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 italic">{incomes?.length || 0} Records</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Inbound Console</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">Strategic liquidity monitoring.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-emerald-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl italic flex items-center gap-4">
          Register Flux <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
         <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic relative z-10">Total Aggregate Inflow</p>
            <p className="text-4xl font-black text-emerald-500 tracking-tighter italic relative z-10">{formatCurrency(totalInbound)}</p>
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20">Metric_Stable</span>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Latest Log</p>
            <div>
               <p className="text-xl font-black text-slate-950 tracking-tighter italic uppercase leading-tight mb-2 truncate">{incomes?.[0]?.description || 'No Data'}</p>
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic font-mono">{incomes?.[0] ? format(parseISO(incomes[0].date), 'dd MMM yyyy') : '--'}</span>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Primary Sector</p>
            <div>
               <p className="text-xl font-black text-slate-950 tracking-tighter italic uppercase leading-tight mb-2">{incomes?.[0]?.category || 'Undefined'}</p>
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 italic">Matrix Valid</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mx-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic">
                <th className="px-8 py-6 text-left">Timestamp</th>
                <th className="px-8 py-6 text-left">Narrative</th>
                <th className="px-8 py-6 text-left">Sector</th>
                <th className="px-8 py-6 text-right">Valuation</th>
                <th className="px-8 py-6 w-32"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-8 py-6"><div className="h-8 bg-slate-50 rounded-xl"></div></td></tr>)
              ) : incomes?.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 italic">Zero Flux Detected</td></tr>
              ) : (
                incomes.map(income => (
                  <tr key={income.id} className="hover:bg-slate-50 group transition-all">
                    <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono italic">
                      {format(parseISO(income.date), 'dd/MM/yy')}
                    </td>
                    <td className="px-8 py-6">
                       <p className="font-black text-slate-950 text-base tracking-tighter uppercase italic leading-none group-hover:text-blue-600 transition-colors">{income.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[8px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em] italic">{income.category}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="font-black text-emerald-600 text-lg italic tracking-tighter">{formatCurrency(income.amount)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setFormModal({ open: true, editItem: income })} className="text-slate-300 hover:text-blue-600"><Edit3 size={16}/></button>
                        <button onClick={() => {if(window.confirm('Delete?')) deleteMutation.mutate(income.id); }} className="text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formModal.open && <IncomeFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={handleSuccess} />}
    </div>
  );
};

export default Income;
