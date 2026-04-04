import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  X, 
  Pencil, 
  Calendar, 
  CreditCard, 
  Zap, 
  Bell, 
  ShieldCheck, 
  AlertCircle,
  Menu,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionModal = ({ editItem = null, onClose, onSuccess, cards = [] }) => {
  const [form, setForm] = useState({
    name: editItem?.name || '',
    amount: editItem?.amount ?? '',
    billing_day: editItem?.billing_day ?? 1,
    category: editItem?.category || 'Entertainment',
    linked_card_id: editItem?.linked_card_id ?? null,
    status: editItem?.status || 'active'
  });
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editItem) return (await api.put(`/subscriptions/${editItem.id}`, data)).data;
      return (await api.post('/subscriptions/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
      billing_day: parseInt(form.billing_day),
      linked_card_id: form.linked_card_id ? parseInt(form.linked_card_id) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-in">
        <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100">
          <h2 className="text-xl font-black text-blue-600 uppercase tracking-tighter italic">{editItem ? 'Refine Protocol' : 'Deploy Subscription'}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-blue-600 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 italic">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Service Name</label>
            <input required value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} placeholder="Netflix, AWS, Rent, etc."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none tracking-wider focus:bg-white transition-all uppercase"/>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Amount Rs</label>
               <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p=>({...p, amount: e.target.value}))} placeholder="0.00"
                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none text-blue-600 focus:bg-white transition-all"/>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Billing Day (1-31)</label>
               <input required type="number" min="1" max="31" value={form.billing_day} onChange={e => setForm(p=>({...p, billing_day: e.target.value}))}
                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none focus:bg-white transition-all"/>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Linked Payment Node (Optional)</label>
            <select value={form.linked_card_id || ''} onChange={e => setForm(p=>({...p, linked_card_id: e.target.value || null}))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none focus:bg-white transition-all uppercase tracking-widest appearance-none">
              <option value="">No Link</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </select>
          </div>

          <button type="submit" disabled={mutation.isPending} className="w-full py-5 bg-slate-950 text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-950/20">
            {mutation.isPending ? 'SYNCHRONIZING...' : 'COMMIT PROTOCOL'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Subscriptions = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState({ open: false, editItem: null });

  const { data: subs, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => (await api.get('/subscriptions/')).data,
  });

  const { data: cards } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/subscriptions/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey:['subscriptions'] })
  });

  const totalMonthly = subs?.reduce((s, b) => s + b.amount, 0) || 0;

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 animate-pulse">
       <div className="w-12 h-12 bg-slate-950 rounded-xl"></div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Scanning Subscription Flux...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 italic">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full italic">Trace: Recurring</span>
             <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.6em] italic">Active Flux Monitoring</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Subscription Tracker</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">Automated leakage trace node.</p>
        </div>
        <button onClick={() => setModal({ open: true, editItem: null })}
          className="px-8 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl italic flex items-center gap-4">
          Deploy Trace <Plus size={18} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
         <div className="bg-slate-950 rounded-[2.5rem] p-10 shadow-3xl border border-white/5 relative overflow-hidden group min-h-[180px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic relative z-10">Monthly Recurring Leakage</p>
            <p className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalMonthly)}</p>
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 italic relative z-10">System Load: NOMINAL</span>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all min-h-[180px]">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic leading-none">Active Trace Nodes</p>
            <p className="text-5xl font-black text-slate-950 tracking-tighter italic">{subs?.length || 0} <span className="text-[10px] opacity-20 uppercase tracking-[0.2em]">Services</span></p>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all min-h-[180px]">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic leading-none">Smart Recommender</p>
             <div className="flex flex-col text-left">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status: Operational</span>
                <p className="text-[11px] font-black uppercase tracking-tight opacity-40 leading-relaxed italic">System suggests reviewing AWS if usage remains below 14% this cycle.</p>
             </div>
         </div>
      </div>

      {/* List */}
      <div className="px-6 space-y-6">
         {subs?.map(sub => (
           <div key={sub.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-[2000ms]"></div>
              <div className="flex items-center gap-8 w-full md:w-auto">
                 <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-all shrink-0">
                    <Zap size={32} className={`${sub.status === 'active' ? 'text-blue-500 animate-pulse' : 'text-slate-600'}`} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">{sub.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                       <span className="flex items-center gap-2"><Calendar size={12}/> Every {sub.billing_day}th</span>
                       {sub.linked_card_id && (
                         <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                           <CreditCard size={12}/> 
                           {cards?.find(c => c.id === sub.linked_card_id)?.name || 'Linked Card'}
                         </span>
                       )}
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-12 border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                 <div className="text-right">
                    <p className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none mb-2">{formatCurrency(sub.amount)}</p>
                    <span className={`text-[8px] font-black uppercase tracking-[0.4em] px-2 py-1 rounded-md ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {sub.status.toUpperCase()}
                    </span>
                 </div>
                 <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setModal({ open: true, editItem: sub })} className="p-4 text-slate-300 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all">
                       <Pencil size={18}/>
                    </button>
                    <button onClick={() => deleteMutation.mutate(sub.id)} className="p-4 text-slate-300 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-all">
                       <Trash2 size={18}/>
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {subs?.length === 0 && (
           <div className="py-24 bg-slate-50/50 rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-8 opacity-60">
              <div className="p-8 bg-white rounded-full shadow-sm"><trendingdown size={60} className="text-slate-200" /></div>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.8em] italic">No Recurring Leakage Nodes Detected.</p>
           </div>
         )}
      </div>

      {modal.open && (
        <SubscriptionModal 
          editItem={modal.editItem} 
          cards={cards?.filter(c => c.type === 'Credit Card' || c.type === 'Other') || []} 
          onClose={() => setModal({ open: false, editItem: null })} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey:['subscriptions'] })} 
        />
      )}
    </div>
  );
};

export default Subscriptions;
