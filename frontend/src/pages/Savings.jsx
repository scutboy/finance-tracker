import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, PiggyBank, Target, Trash2, X, AlertCircle, TrendingUp, ShieldCheck, Landmark, HeartPulse, Sparkles, ChevronRight, Calculator, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const GOAL_TYPES = ['Emergency Fund', "Son's Future", 'Retirement', 'Investment', 'Other'];
const COLORS = ['#2563eb', '#10b981', '#7c3aed', '#f59e0b', '#ef4444'];

// ─── Add/Edit Goal Modal ──────────────────────────────────────────────────────
const GoalFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    target: editItem?.target ?? '',
    current: editItem?.current ?? '',
    type: editItem?.type || 'Emergency Fund',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/savings/${editItem.id}`, data)).data;
      return (await api.post('/savings/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to sync node.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    const payload = {
      ...form,
      target: parseFloat(form.target),
      current: parseFloat(form.current),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tighter italic">{isEdit ? 'Refine Asset Node' : 'Initialize Cache Target'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && <div className="flex items-center gap-3 bg-rose-50 text-rose-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"><AlertCircle size={18}/>{error}</div>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Asset Trace Identifier</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. S-Node Alpha (Future Fund)"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase tracking-widest placeholder:opacity-20"/>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Current Val (Rs)</label>
                <input required type="number" step="0.01" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all italic"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Target Cap (Rs)</label>
                <input required type="number" step="0.01" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all italic"/>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Cache Sector Classification</label>
              <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-8 py-5 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">Abort Sync</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl hover:bg-black transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50">
              {mutation.isPending ? 'LOCKING...' : 'FORCE SET TARGET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Savings Page ────────────────────────────────────────────────────────
const Savings = () => {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: async () => (await api.get('/savings/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/savings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['savings'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  const totalSaved = goals?.reduce((s, g) => s + g.current, 0) || 0;
  const totalTarget = goals?.reduce((s, g) => s + g.target, 0) || 1;
  const aggregateProgress = Math.min((totalSaved / totalTarget) * 100, 100);

  const pieData = goals?.map(g => ({ name: g.name, value: g.current })) || [];

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <span className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 italic">Asset Resilience: Shield Active</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ml-2">{goals?.length || 0} Discrete Cache Nodes</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none uppercase">Future Fund Matrix</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">Aggregate Wealth Consolidation & Milestone Projection Tracking.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-3xl hover:bg-black transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 shadow-blue-500/10">
          <Plus size={24}/> Initialize Node
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-2">
         {/* Total Saved Card */}
         <div className="bg-slate-950 rounded-[3.5rem] p-12 shadow-2xl flex flex-col justify-center border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[3000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6 opacity-80 relative z-10 italic">Consolidated Asset Cache</p>
            <p className="text-6xl font-black text-white tracking-tighter italic relative z-10">{formatCurrency(totalSaved)}</p>
            <div className="mt-8 flex items-center gap-4 relative z-10">
               <div className="px-5 py-2 bg-white/10 rounded-full border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Aggregate Progress: {aggregateProgress.toFixed(1)}%</p>
               </div>
            </div>
            <div className="absolute bottom-10 right-10 opacity-20 relative z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
               <ShieldCheck size={96} className="text-blue-500" />
            </div>
         </div>

         {/* Pie Chart Card */}
         <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-12 hover:shadow-2xl transition-all">
             <div className="h-64 w-full lg:w-1/2 relative">
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">DISTRIBUTION</p>
                  <p className="text-xl font-black text-slate-950 italic">NODE MAP</p>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '900'}}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="w-full lg:w-1/2 space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-8">Asset Allocation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {goals?.map((g, i) => (
                     <div key={g.id} className="flex items-center gap-4 group">
                        <div className="w-3 h-10 rounded-full transition-all group-hover:h-12" style={{ background: COLORS[i % COLORS.length] }}></div>
                        <div>
                           <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{g.name}</p>
                           <p className="text-[11px] font-black text-slate-400 italic mt-1">{((g.current / totalSaved) * 100 || 0).toFixed(1)}% Weight</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
         </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-72 bg-slate-50 rounded-[3rem] animate-pulse"/>)
        ) : goals?.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 p-32 text-center flex flex-col items-center gap-10 shadow-inner">
             <div className="p-12 bg-slate-50 text-slate-200 rounded-[3rem] scale-125">
                <PiggyBank size={80} />
             </div>
             <div className="max-w-md">
                <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">Zero Assets Logged</h2>
                <p className="text-slate-500 font-black text-sm uppercase tracking-widest opacity-60 leading-relaxed italic">No future fund nodes found. Initialize a new asset trace to begin compounding resilience.</p>
             </div>
             <button onClick={() => setFormModal({ open: true, editItem: null })}
               className="bg-blue-600 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 italic">
               Deploy Initial Node
             </button>
          </div>
        ) : (
          goals.map((goal, i) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full transition-all group-hover:w-4" style={{ background: COLORS[i % COLORS.length] }}></div>
                
                <div className="flex justify-between items-start mb-10 pl-4">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-slate-50 rounded-[1.5rem] text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all group-hover:rotate-12 group-hover:scale-110 shadow-sm"><Target size={32}/></div>
                    <div>
                      <p className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none mb-3 group-hover:translate-x-2 transition-transform">{goal.name}</p>
                      <span className="text-[10px] font-black bg-slate-50 border border-slate-100 text-slate-500 px-4 py-1.5 rounded-lg uppercase tracking-[0.2em]">{goal.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                    <button onClick={() => setFormModal({ open: true, editItem: goal })} className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-xl hover:scale-110 transition-all border border-slate-50"><Sparkles size={18}/></button>
                    <button onClick={() => { if(window.confirm('IRREVERSIBLE: PURGE ASSET?')) deleteMutation.mutate(goal.id); }} 
                      className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-xl hover:scale-110 transition-all border border-slate-50"><Trash2 size={18}/></button>
                  </div>
                </div>

                <div className="space-y-10 pl-4">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-60">Locked Valuation</p>
                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic leading-none">{formatCurrency(goal.current)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-60">Target Capacity</p>
                        <p className="text-2xl font-black text-slate-400 tracking-tighter italic leading-none">{formatCurrency(goal.target)}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="w-full bg-slate-100 rounded-full h-8 p-1.5 overflow-hidden shadow-inner border border-slate-100 relative group-hover:scale-[1.01] transition-transform">
                        <div className="h-full rounded-full transition-all duration-[3000ms] ease-out relative"
                          style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], boxShadow: `0 0 30px ${COLORS[i % COLORS.length]}40` }}>
                           <div className="absolute inset-0 bg-white/10 blur-sm pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Resilience Potential: <span className="text-blue-600">{pct.toFixed(2)}%</span></p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Gap: {formatCurrency(Math.max(0, goal.target - goal.current))}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between pl-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Growth Trace Optimized</p>
                   </div>
                   <button className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-2 transition-transform">
                      Execution Protocol <ChevronRight size={12}/>
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center mt-12 bg-white/50 backdrop-blur-md py-10 rounded-[3rem] border border-slate-100 mx-2 shadow-sm group hover:shadow-xl transition-all">
         <div className="flex items-center justify-center gap-10 mb-6">
            <Calculator size={32} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            <PieIcon size={32} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
            <HeartPulse size={32} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] italic px-10 leading-relaxed">Vantage Dynamic Asset Realignment Architecture v4.2.1 — Monitoring Resilience Vectors for Charith & Family.</p>
      </div>

      {formModal.open && (
        <GoalFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Savings;
