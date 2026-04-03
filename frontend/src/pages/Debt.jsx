import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  X, 
  Pencil, 
  DollarSign,
  History,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Mortgage', 'Vehicle', 'Other'];

const PaymentModal = ({ debt, onClose, onSuccess }) => {
  const [form, setForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], notes: '' });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async (data) => (await api.post(`/debts/${debt.id}/payment`, data)).data,
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Payment Sync Error.'),
  });
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate({ ...form, amount: parseFloat(form.amount) }); };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-in">
        <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100">
          <h2 className="text-xl font-black text-emerald-600 uppercase tracking-tighter italic">Log Payment: {debt.name}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-emerald-600 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 italic">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Amount Rs</label>
            <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-2xl font-black outline-none text-emerald-600 focus:bg-white transition-all"/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Date</label>
            <input required type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:bg-white transition-all"/>
          </div>
          <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-950/20">
            {mutation.isPending ? 'PROCESSING...' : 'COMMIT PAYMENT'}
          </button>
        </form>
      </div>
    </div>
  );
};

const DebtFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    balance: editItem?.balance ?? '',
    interest_rate: editItem?.interest_rate ?? '',
    min_payment: editItem?.min_payment ?? '',
    type: editItem?.type || 'Credit Card',
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/debts/${editItem.id}`, data)).data;
      return (await api.post('/debts/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
  });
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate({ ...form, balance: parseFloat(form.balance), interest_rate: parseFloat(form.interest_rate), min_payment: parseFloat(form.min_payment) }); };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-in">
        <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100">
          <h2 className="text-xl font-black text-rose-600 uppercase tracking-tighter italic">{isEdit ? 'Refine Target' : 'Acquire Target'}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-rose-600 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 italic">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Identifier"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none uppercase tracking-wider focus:bg-white transition-all"/>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" step="0.01" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="Balance"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none text-rose-600 focus:bg-white transition-all"/>
            <input required type="number" step="0.1" value={form.interest_rate} onChange={e => setForm(p => ({ ...p, interest_rate: e.target.value }))} placeholder="APR %"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-black outline-none focus:bg-white transition-all"/>
          </div>
          <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-rose-600 transition-all">
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
  const [paymentModal, setPaymentModal] = useState({ open: false, debt: null });

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const allPayments = useMemo(() => {
    if (!debts) return [];
    return debts.flatMap(d => (d.payments || []).map(p => ({ ...p, debtName: d.name })))
      .sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [debts]);

  const activeTargets = useMemo(() => {
    if (!debts) return [];
    return debts.filter(d => d.status !== 'Paid Off').sort((a,b) => b.interest_rate - a.interest_rate);
  }, [debts]);

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 animate-pulse">
       <div className="w-12 h-12 bg-slate-950 rounded-xl"></div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Vantage Perimeter Scan...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full italic">Sniper: Core</span>
             <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 tracking-[0.6em] italic">Active Perimeter Scan</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Debt Sniper</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1 leading-none">High-Precision target neutralization.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-rose-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl italic flex items-center gap-4">
          Acquire Target <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-6">
         <div className="bg-slate-950 rounded-[2.5rem] p-10 shadow-3xl border border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic relative z-10">Combined Exposure Delta</p>
            <p className="text-5xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(activeTargets.reduce((s,d)=>s+d.balance, 0))}</p>
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 italic relative z-10 leading-none">Threat Level: NOMINAL</span>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all h-[220px]">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic leading-none">Target Phase Alpha</p>
            <p className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2 italic overflow-hidden text-ellipsis whitespace-nowrap">{activeTargets[0]?.name || 'Clear'}</p>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all h-[220px]">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic leading-none">Monthly Outbound Trace</p>
            <p className="text-3xl font-black text-rose-600 tracking-tighter italic">{formatCurrency(activeTargets.reduce((s,d)=>s+d.min_payment,0))}</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mx-6 group">
        <div className="overflow-x-auto">
          <table className="min-w-full italic">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase font-black text-[9px] text-slate-400">
              <tr>
                <th className="px-10 py-6 text-left tracking-[0.4em]">Target</th>
                <th className="px-10 py-6 text-right tracking-[0.4em]">APR Scan</th>
                <th className="px-10 py-6 text-right tracking-[0.4em]">Exit Value</th>
                <th className="px-10 py-6"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTargets.map(debt => (
                <tr key={debt.id} className="hover:bg-slate-50 group transition-all">
                  <td className="px-10 py-10">
                     <p className="font-black text-slate-950 text-2xl tracking-tighter uppercase leading-none group-hover:text-rose-600 transition-colors mb-1">{debt.name}</p>
                     <span className="text-[9px] font-black text-slate-300 tracking-widest uppercase">{debt.type}</span>
                  </td>
                  <td className="px-10 py-10 text-right font-black text-rose-600 text-3xl tracking-tighter">{debt.interest_rate}%</td>
                  <td className="px-10 py-10 text-right font-black text-slate-950 text-4xl tracking-tighter">{formatCurrency(debt.balance)}</td>
                  <td className="px-10 py-10 text-right">
                     <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setPaymentModal({ open: true, debt })} className="px-6 py-4 bg-slate-950 text-white rounded-2xl shadow-xl flex items-center gap-3 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                         <DollarSign size={14}/> Log Pay
                      </button>
                      <button onClick={() => setFormModal({ open: true, editItem: debt })} className="p-3 text-slate-200 hover:text-blue-600 transition-colors"><Pencil size={20}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTargets.length === 0 && (
                <tr><td colSpan="4" className="py-20 text-center font-black text-slate-300 uppercase tracking-widest italic opacity-60">No Targets Identified in Current Perimeter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6">
         <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-700 italic">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
               <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-5">
                  <History size={28} className="text-emerald-500" /> Transaction Trace
               </h2>
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Zap size={18}/></div>
            </div>
            <div className="p-8 space-y-4 max-h-[500px] overflow-y-auto">
               {allPayments.map((p, idx) => (
                 <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] hover:bg-emerald-50 transition-all border border-slate-100/50 group/row">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100"><DollarSign size={24}/></div>
                       <div>
                          <p className="font-black text-slate-950 text-lg tracking-tighter uppercase leading-none mb-1">{p.debtName}</p>
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                             <Calendar size={12}/> {new Date(p.payment_date).toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-emerald-600 tracking-tighter italic">-{formatCurrency(p.amount)}</p>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic opacity-40">VERIFIED</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-slate-950 rounded-[3rem] p-12 text-white border border-white/5 flex flex-col justify-between group overflow-hidden relative shadow-3xl h-full">
            <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-rose-600/5 rounded-full blur-[100px] group-hover:scale-110 transition-all duration-[5000ms] pointer-events-none"></div>
            <div className="space-y-8 relative z-10">
               <div className="space-y-4">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Neutralization</h2>
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-loose opacity-60">Execute high-velocity debt dissolution protocols. Log all outflows to maintain perimeter integrity and delta accuracy.</p>
               </div>
               <button onClick={() => window.location.href='/debt-advisor'}
                 className="w-full p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-between group/btn hover:bg-white/10 transition-all mt-10">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-white/10 text-rose-500 rounded-2xl group-hover/btn:scale-110 transition-all"><ShieldAlert size={32}/></div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] mb-1">Launch Strategizer</p>
                        <p className="text-2xl font-black italic uppercase tracking-tighter">Compute Delta Strategy</p>
                     </div>
                  </div>
                  <ChevronRight size={28} className="opacity-20 group-hover/btn:translate-x-2 transition-all" />
               </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[1em] text-white/20 text-center mt-16 italic">System Integrity Verified 2.7.0</p>
         </div>
      </div>

      {formModal.open && <DebtFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={() => { queryClient.invalidateQueries({ queryKey:['debts'] }); queryClient.invalidateQueries({ queryKey:['debtProjection'] }); }} />}
      {paymentModal.open && <PaymentModal debt={paymentModal.debt} onClose={() => setPaymentModal({ open: false, debt: null })} onSuccess={() => { queryClient.invalidateQueries({ queryKey:['debts'] }); queryClient.invalidateQueries({ queryKey:['debtProjection'] }); queryClient.invalidateQueries({ queryKey:['dashboardSummary'] }); }} />}
    </div>
  );
};

export default Debt;
