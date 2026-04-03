import React, { useState } from 'react';
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
  ChevronRight
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
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 italic">
        <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100">
          <h2 className="text-xl font-black text-emerald-600 uppercase tracking-tighter">Log Payment: {debt.name}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-emerald-600 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Amount Rs</label>
            <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-2xl font-black outline-none text-emerald-600"/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Date</label>
            <input required type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-bold outline-none"/>
          </div>
          <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-600 transition-all">
            {mutation.isPending ? 'PROCESSING...' : 'COMMIT PAYMENT'}
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

  const allPayments = debts?.flatMap(d => d.payments.map(p => ({ ...p, debtName: d.name })))
    .sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date)) || [];

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-6 italic">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full">Sniper: Core</span>
             <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 tracking-[0.6em]">Active Perimeter Scan</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase leading-none">Debt Sniper</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 ml-1">Asset Neutralization & Perimeter Security.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-rose-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl flex items-center gap-4">
          Acquire Target <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[180px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] relative z-10">Combined Exposure Delta</p>
            <p className="text-4xl font-black text-white tracking-tighter relative z-10">{formatCurrency(debts?.reduce((s,d)=>s+(d.status!=='Paid Off'?d.balance:0),0) || 0)}</p>
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 relative z-10">Integrity Check Nominal</span>
         </div>
         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-emerald-100 transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Focus Target Alpha</p>
            <p className="text-2xl font-black text-slate-950 tracking-tighter uppercase mb-2">{debts?.find(d=>d.status!=='Paid Off')?.name || 'None'}</p>
         </div>
         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-rose-100 transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Total Liquid Outbound</p>
            <p className="text-2xl font-black text-rose-600 tracking-tighter">{formatCurrency(allPayments.filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth()).reduce((s,p)=>s+p.amount, 0))}</p>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
           <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">Liability Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase font-black text-[8px] text-slate-400">
              <tr>
                <th className="px-8 py-4 text-left tracking-[0.4em]">Target</th>
                <th className="px-8 py-4 text-right tracking-[0.4em]">APR Scan</th>
                <th className="px-8 py-4 text-right tracking-[0.4em]">Exit Value</th>
                <th className="px-8 py-4"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2].map(i => <tr key={i} className="animate-pulse"><td colSpan="4" className="px-8 py-8"><div className="h-6 bg-slate-50 rounded-xl w-full"></div></td></tr>)
              ) : (
                debts?.filter(d=>d.status!=='Paid Off').sort((a,b)=>b.interest_rate-a.interest_rate).map(debt => (
                  <tr key={debt.id} className="hover:bg-slate-50 group transition-all">
                    <td className="px-8 py-8">
                       <p className="font-black text-slate-950 text-xl tracking-tighter uppercase leading-none group-hover:text-rose-600 transition-colors">{debt.name}</p>
                       <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">{debt.type}</span>
                    </td>
                    <td className="px-8 py-8 text-right font-black text-rose-600 text-2xl tracking-tighter">{debt.interest_rate}%</td>
                    <td className="px-8 py-8 text-right font-black text-slate-950 text-3xl tracking-tighter">{formatCurrency(debt.balance)}</td>
                    <td className="px-8 py-8 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setPaymentModal({ open: true, debt: debt })} className="p-2.5 bg-slate-950 text-white rounded-xl shadow-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all px-4">
                           <DollarSign size={12}/> Log Payment
                        </button>
                        <button onClick={() => setFormModal({ open: true, editItem: debt })} className="p-2 text-slate-300 hover:text-blue-600"><Pencil size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Payment History Log */}
         <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-700">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-4">
                  <History size={24} className="text-emerald-500" /> Payment History Flux
               </h2>
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg animate-pulse"><Zap size={14}/></div>
            </div>
            <div className="p-10 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
               {allPayments.length === 0 ? (
                  <p className="text-center py-20 text-[10px] font-black text-slate-300 uppercase tracking-widest">No transaction logs detected.</p>
               ) : (
                  allPayments.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] hover:bg-emerald-50/50 transition-all border border-slate-100/50 group/row">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100"><DollarSign size={20}/></div>
                          <div>
                             <p className="font-black text-slate-950 text-sm uppercase tracking-tighter">{p.debtName}</p>
                             <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                <Calendar size={10}/> {new Date(p.payment_date).toLocaleDateString()}
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-emerald-600 tracking-tighter italic">-{formatCurrency(p.amount)}</p>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic leading-none">VERIFIED_TRACE</span>
                       </div>
                    </div>
                  ))
               )}
            </div>
         </div>

         {/* Information Hub */}
         <div className="bg-slate-950 rounded-[2rem] p-10 flex flex-col justify-between text-white border border-white/5 relative overflow-hidden group hover:shadow-2xl transition-all h-full">
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-rose-600/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <div className="space-y-8 relative z-10">
               <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Neutralization Protocol</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] leading-relaxed">Always log payments immediately after transfer to ensure perimeter integrity and updated delta projections.</p>
               </div>
               <div className="p-8 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center gap-6 group/btn cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.location.href='/debt-advisor'}>
                  <div className="p-4 bg-white/10 text-rose-500 rounded-xl group-hover/btn:translate-x-2 transition-transform"><Target size={28}/></div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] mb-1">Compute Strategy</p>
                     <p className="text-lg font-black italic uppercase tracking-tighter">Launch Strategy Delta</p>
                  </div>
                  <ChevronRight size={24} className="text-white/20 group-hover/btn:translate-x-2 transition-transform" />
               </div>
            </div>
            <div className="mt-12 opacity-40 group-hover:opacity-100 transition-opacity">
               <p className="text-[9px] font-black uppercase tracking-[1em] text-white/50 text-center">SYSTEM_SECURE_V2.1</p>
            </div>
         </div>
      </div>

      {formModal.open && <DebtFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={() => queryClient.invalidateQueries(['debts'])} />}
      {paymentModal.open && <PaymentModal debt={paymentModal.debt} onClose={() => setPaymentModal({ open: false, debt: null })} onSuccess={() => { queryClient.invalidateQueries(['debts']); queryClient.invalidateQueries(['dashboardSummary']); }} />}
    </div>
  );
};

export default Debt;
