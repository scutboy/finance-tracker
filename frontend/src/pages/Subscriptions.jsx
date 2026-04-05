import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Search,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const USD_TO_LKR = 300; 

const SubscriptionModal = ({ editItem = null, onClose, onSuccess, cards = [] }) => {
  const [form, setForm] = useState({
    name: editItem?.name || '',
    amount: editItem?.amount ?? '',
    billing_day: editItem?.billing_day ?? 1,
    category: editItem?.category || 'Entertainment',
    linked_card_id: editItem?.linked_card_id ?? '',
    status: editItem?.status || 'active',
    currency: editItem?.currency || 'LKR'
  });
  const [error, setError] = useState('');
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editItem) return (await api.put(`/subscriptions/${editItem.id}`, data)).data;
      return (await api.post('/subscriptions/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Handshake Error.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    mutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
      billing_day: parseInt(form.billing_day || 1),
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
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3"><AlertCircle size={16}/> {error}</div>}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Service Identification</label>
            <input required value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} placeholder="Netflix, AWS, Rent, etc."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-black outline-none tracking-widest focus:bg-white transition-all uppercase"/>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Amount Node</label>
               <div className="relative">
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p=>({...p, amount: e.target.value}))} placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-black outline-none text-blue-600 focus:bg-white transition-all"/>
                  <button type="button" onClick={() => setForm(p => ({ ...p, currency: p.currency === 'LKR' ? 'USD' : 'LKR' }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-950 text-white px-3 py-1.5 rounded-lg text-[9px] font-black hover:bg-blue-600 transition-all shadow-xl">
                    {form.currency}
                  </button>
               </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Sector Node</label>
              <select value={form.category} onChange={e => setForm(p=>({...p, category: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-black outline-none tracking-widest focus:bg-white transition-all uppercase appearance-none cursor-pointer">
                {['Entertainment', 'Utilities', 'Software/SaaS', 'Finance', 'Lifestyle', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Billing Day</label>
               <input required type="number" min="1" max="31" value={form.billing_day} onChange={e => setForm(p=>({...p, billing_day: e.target.value}))}
                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-black outline-none focus:bg-white transition-all"/>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Linked Card Node (Optional)</label>
            <select value={form.linked_card_id} onChange={e => setForm(p=>({...p, linked_card_id: e.target.value}))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-black outline-none focus:bg-white transition-all uppercase tracking-widest appearance-none cursor-pointer">
              <option value="">DECOUPLED_STATUS</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </select>
          </div>

          <button type="submit" disabled={mutation.isPending} className="w-full py-6 bg-slate-950 text-white rounded-xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4">
            {mutation.isPending ? 'PROCESSING_PROTOCOL...' : (editItem ? 'SYNCHRONIZE_CHANGES' : 'INITIALIZE_TRACE')}
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

  const totalMonthlyLKR = useMemo(() => {
    return subs?.reduce((s, b) => {
      const amt = b.currency === 'USD' ? b.amount * USD_TO_LKR : b.amount;
      return s + (b.status === 'active' ? amt : 0);
    }, 0) || 0;
  }, [subs]);

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 animate-pulse">
       <div className="w-12 h-12 bg-slate-950 rounded-xl"></div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] italic">Scanning Flux Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 italic">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full italic">Status: Stable</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.8em] italic">Recurring Flux Alpha</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Subscription Tracker</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">Automated recurring leakage detection.</p>
        </div>
        <button onClick={() => setModal({ open: true, editItem: null })}
          className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-3xl italic flex items-center gap-4">
          Establish Trace <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
         <div className="bg-slate-950 rounded-[2.5rem] p-10 shadow-3xl border border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[5000ms]"></div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic relative z-10">Monthly Aggregate (Converted LKR)</p>
            <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalMonthlyLKR)}</p>
            <div className="flex justify-between items-center relative z-10">
               <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20 italic">Base: {USD_TO_LKR} LKR/USD</span>
               <RefreshCw size={14} className="text-white/20 animate-spin-slow" />
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all min-h-[220px]">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic leading-none">Detected Nodes</p>
            <div>
               <p className="text-6xl font-black text-slate-950 tracking-tighter italic mb-4">{subs?.length || 0}</p>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">OPERATIONAL_FEED</p>
               </div>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all min-h-[220px]">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic leading-none">Active USD Leech Factor</p>
             <div>
                <p className="text-4xl font-black text-slate-950 tracking-tighter italic mb-2">
                   ${subs?.filter(b => b.currency === 'USD' && b.status === 'active').reduce((s, b) => s + b.amount, 0).toFixed(2)} 
                   <span className="text-xs text-slate-300 ml-2">USD/MO</span>
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40 leading-relaxed italic">Converted to base LKR automatically in global sum.</p>
             </div>
         </div>
      </div>

      <div className="px-6 space-y-6">
         {subs?.map(sub => (
           <div key={sub.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-3xl transition-all duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-[2000ms]"></div>
              <div className="flex items-center gap-8 w-full md:w-auto">
                 <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all shrink-0">
                    <TrendingDown size={32} className={`${sub.status === 'active' ? 'text-blue-500 animate-pulse' : 'text-slate-600'}`} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950 leading-none group-hover:text-blue-600 transition-colors uppercase">{sub.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                       <span className="flex items-center gap-2"><Calendar size={14}/> Cycle {sub.billing_day}</span>
                       <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full"><RefreshCw size={12}/> Periodic</span>
                       {sub.linked_card_id && (
                         <span className="flex items-center gap-3 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                           <CreditCard size={12}/> 
                           {cards?.find(c => c.id === sub.linked_card_id)?.name || 'Linked Card'}
                         </span>
                       )}
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-12 border-t md:border-t-0 pt-8 md:pt-0 border-slate-50">
                 <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                       {sub.currency === 'USD' && <span className="text-[10px] font-black text-blue-600 uppercase italic">USD Detected</span>}
                       <p className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none">
                         {formatCurrency(sub.amount, sub.currency)}
                       </p>
                    </div>
                    {sub.currency === 'USD' && (
                       <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic mb-2">≈ {formatCurrency(sub.amount * USD_TO_LKR)}</p>
                    )}
                    <span className={`text-[8px] font-black uppercase tracking-[0.5em] px-3 py-1 rounded-md ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                      {sub.status.toUpperCase()}
                    </span>
                 </div>
                 <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => setModal({ open: true, editItem: sub })} className="p-4 text-slate-300 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all">
                       <Pencil size={20}/>
                    </button>
                    <button onClick={() => { if(window.confirm('Delete trace?')) deleteMutation.mutate(sub.id); }} className="p-4 text-slate-300 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-all">
                       <Trash2 size={20}/>
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {subs?.length === 0 && (
           <div className="py-24 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-8 opacity-60">
              <div className="p-8 bg-white rounded-[2rem] shadow-sm"><TrendingDown size={60} className="text-slate-200" /></div>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.8em] italic">System Void: No Recurring Traces.</p>
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
