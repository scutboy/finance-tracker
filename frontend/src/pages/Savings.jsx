import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  PiggyBank, 
  Target, 
  Trash2, 
  X, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Landmark, 
  HeartPulse, 
  Sparkles, 
  ChevronRight, 
  Calculator, 
  PieChart as PieIcon,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const GOAL_TYPES = ['Emergency Fund', 'Child Education', 'Retirement', 'Property', 'Vehicle', 'Travel', 'Investment', 'Other'];
const COLORS = ['#2563eb', '#10b981', '#7c3aed', '#f59e0b', '#ef4444'];

const GoalFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    target_amount: editItem?.target_amount ?? '',
    current_amount: editItem?.current_amount ?? '',
    category: editItem?.category || 'Emergency Fund',
    monthly_contribution: editItem?.monthly_contribution ?? 0,
    target_date: editItem?.target_date || new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/goals/${editItem.id}`, data)).data;
      return (await api.post('/goals/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Sync Error.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount),
      monthly_contribution: parseFloat(form.monthly_contribution || 0),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">{isEdit ? 'Edit Goal' : 'New Goal'}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl">{error}</div>}
          <div className="space-y-4">
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Goal Name"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic uppercase tracking-wider"/>
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" value={form.current_amount} onChange={e => setForm(p => ({ ...p, current_amount: e.target.value }))} placeholder="Current"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic"/>
              <input required type="number" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} placeholder="Target"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 outline-none italic"/>
            </div>
            <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-950 outline-none uppercase italic">
              {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-blue-600 transition-all">
            {mutation.isPending ? 'Saving...' : 'Confirm Node'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Savings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: async () => (await api.get('/goals/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const totalSaved = goals?.reduce((s, g) => s + g.current_amount, 0) || 0;
  const totalTarget = goals?.reduce((s, g) => s + g.target_amount, 0) || 1;
  const aggregateProgress = Math.min((totalSaved / totalTarget) * 100, 100);

  const pieData = goals?.map(g => ({ name: g.name, value: g.current_amount })) || [];

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full italic">Assets: Active</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">{goals?.length || 0} Registered Nodes</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Savings</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 leading-none italic ml-1">Aggregate wealth consolidation & milestone tracking.</p>
        </div>
      {/* ── LIVE BANK ACCOUNT BALANCES ── */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic flex items-center gap-3">
              <Landmark size={22} className="text-blue-600"/> Live Account Balances
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Actual bank account balances — manually updated from bank statements</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {goals?.filter(g => g.name.toLowerCase().includes('account') || g.name.toLowerCase().includes('savings a/c') || g.name.toLowerCase().includes('current'))
            .map((acct, i) => {
              const pct = acct.target_amount > 0 ? Math.min((acct.current_amount / acct.target_amount) * 100, 100) : 0;
              return (
                <div key={acct.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-1000"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Account</p>
                      <p className="font-black text-slate-950 text-lg tracking-tighter italic">{acct.name}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={20}/></div>
                  </div>
                  <p className="text-3xl font-black text-slate-950 tracking-tighter italic relative z-10">{formatCurrency(acct.current_amount)}</p>
                  <div className="mt-4 relative z-10">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <span>{pct.toFixed(0)}% of target</span>
                      <span>Target: {formatCurrency(acct.target_amount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}/>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 relative z-10">
                    <button onClick={() => setFormModal({ open: true, editItem: acct })} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                      Update Balance
                    </button>
                  </div>
                </div>
              );
          })}
          {/* Static display for debit accounts not yet in DB */}
          <div className="bg-slate-50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
            <Plus size={24} className="text-slate-300"/>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add ComBank or NDB Savings A/C</p>
            <button onClick={() => setFormModal({ open: true, editItem: null })} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all">
              Add Account
            </button>
          </div>
        </div>
      </div>

        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="group flex items-center gap-4 px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl italic">
          Initialize Node
          <Plus size={20} className="transition-transform group-hover:rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-6">
         <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group min-h-[300px]">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-all duration-[4000ms]"></div>
            <div className="relative z-10 flex justify-between items-start">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Total Asset Cache</p>
               <Activity size={20} className="text-blue-500 animate-pulse" />
            </div>
            <p className="text-5xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalSaved)}</p>
            <div className="relative z-10 flex items-center gap-6">
               <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">Resilience: {aggregateProgress.toFixed(1)}%</p>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10 group hover:shadow-2xl transition-all">
             <div className="h-64 w-full md:w-1/2 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">Allocation Matrix</h3>
                <div className="grid grid-cols-1 gap-3">
                   {goals?.slice(0, 4).map((g, i) => (
                     <div key={g.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{g.name}</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-950 italic">{totalSaved > 0 ? ((g.current_amount / totalSaved) * 100).toFixed(1) : '0.0'}%</p>
                     </div>
                   ))}
                </div>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-80 bg-white rounded-[2rem] animate-pulse"/>)
        ) : goals?.length === 0 ? (
          <div className="md:col-span-2 text-center py-40 border-4 border-slate-50 rounded-[4rem] italic font-black text-slate-300 uppercase tracking-[0.5em]">No Nodes Found</div>
        ) : (
          goals.map((goal, i) => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            return (
              <div key={goal.id} className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[380px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xl font-black text-slate-950 tracking-tighter italic leading-none mb-2">{goal.name}</p>
                    <span className="text-[8px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase italic">{goal.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFormModal({ open: true, editItem: goal })} className="p-2 text-slate-300 hover:text-blue-600"><Sparkles size={16}/></button>
                    <button onClick={() => { if(window.confirm('Purge node?')) deleteMutation.mutate(goal.id); }} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                  </div>
                </div>

                <div className="mt-auto space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Locked</p>
                      <p className="text-2xl font-black text-slate-950 italic">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Target</p>
                      <p className="text-xl font-black text-slate-300 italic">{formatCurrency(goal.target_amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="w-full bg-slate-50 rounded-full h-8 p-1 overflow-hidden border border-slate-100 flex items-center">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}></div>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-[9px] font-black text-slate-400 uppercase italic">{pct.toFixed(1)}%</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase italic">Gap: {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center mt-20 bg-white/40 backdrop-blur-xl py-12 rounded-[2rem] border border-slate-100 mx-6">
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] italic opacity-60">© 2026 {user?.name}. Savings v4.2 -- Secure Node Matrix.</p>
      </div>

      {formModal.open && (
        <GoalFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={() => queryClient.invalidateQueries({ queryKey:['savings'] })} />
      )}
    </div>
  );
};

export default Savings;
