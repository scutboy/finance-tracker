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
import { useAuth } from '../context/AuthContext';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Mortgage', 'Vehicle', 'Other'];

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
    onError: (e) => setError(e.response?.data?.detail || 'Sync Error.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      balance: parseFloat(form.balance),
      interest_rate: parseFloat(form.interest_rate),
      min_payment: parseFloat(form.min_payment),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xl font-black text-rose-600 uppercase tracking-tighter italic">{isEdit ? 'Refine Target' : 'New Target'}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-rose-600 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Target Identifier"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none italic uppercase tracking-wider"/>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" step="0.01" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="Balance"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none text-rose-600"/>
            <input required type="number" step="0.1" value={form.interest_rate} onChange={e => setForm(p => ({ ...p, interest_rate: e.target.value }))} placeholder="APR %"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"/>
          </div>
          <input required type="number" step="0.01" value={form.min_payment} onChange={e => setForm(p => ({ ...p, min_payment: e.target.value }))} placeholder="Min Payment"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"/>
          <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black uppercase outline-none">
            {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-rose-600 transition-all">
            {mutation.isPending ? 'DEPLOYING...' : 'LOCK TARGET NODE'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Debt = () => {
  const { user } = useAuth();
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
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full italic">Sniper: Online</span>
             <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">{activeTargets.length} Targets Detected</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Debt Sniper</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">High-Precision target neutralization.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-rose-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl italic flex items-center gap-4">
          Acquire Target <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-6">
         <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[300px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic relative z-10">Combined Exposure Delta</p>
            <p className="text-4xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalOutstanding)}</p>
            <div className="relative z-10">
               <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20 italic">THREAT_REDUCTION_ACTIVE</span>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4 leading-none">Primary Focus</p>
            <div>
               <p className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase truncate mb-2">{activeTargets[0]?.name || 'Zero Targets'}</p>
               <span className="text-[9px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em] italic">APR: {activeTargets[0]?.interest_rate || 0}%</span>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4 leading-none">Monthly Outbound</p>
            <div>
               <p className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none mb-2">{formatCurrency(activeTargets.reduce((s,d)=>s+d.min_payment, 0))}</p>
               <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.4em] italic">Min Maintenance Flux</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mx-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase italic font-black text-[9px] text-slate-400">
              <tr>
                <th className="px-8 py-6 text-left tracking-[0.4em]">Target</th>
                <th className="px-8 py-6 text-left tracking-[0.4em]">Sector</th>
                <th className="px-8 py-6 text-right tracking-[0.4em]">APR Scan</th>
                <th className="px-8 py-6 text-right tracking-[0.4em]">Exit Value</th>
                <th className="px-8 py-6 w-32"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-8 py-6"><div className="h-8 bg-slate-50 rounded-xl w-full"></div></td></tr>)
              ) : (
                activeTargets.sort((a,b) => b.interest_rate - a.interest_rate).map(debt => (
                  <tr key={debt.id} className="hover:bg-slate-50 group transition-all">
                    <td className="px-8 py-6">
                       <p className="font-black text-slate-950 text-xl tracking-tighter uppercase italic leading-none group-hover:text-rose-600 transition-colors">{debt.name}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[8px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em] italic">{debt.type}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="font-black text-rose-600 text-2xl tracking-tighter italic">{debt.interest_rate}%</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="font-black text-slate-950 text-3xl tracking-tighter italic">{formatCurrency(debt.balance)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setFormModal({ open: true, editItem: debt })} className="text-slate-300 hover:text-blue-600"><Pencil size={16}/></button>
                        <button onClick={() => {if(window.confirm('Delete?')) deleteMutation.mutate(debt.id); }} className="text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mt-20 bg-white/40 backdrop-blur-md py-12 rounded-[2rem] border border-slate-100 mx-6">
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic px-16 relative z-10 opacity-60">© 2026 {user?.name}. Sniper v2.1 -- Target Neutralization Active.</p>
      </div>

      {formModal.open && <DebtFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={handleSuccess} />}
    </div>
  );
};

export default Debt;
