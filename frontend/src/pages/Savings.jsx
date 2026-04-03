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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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
    onError: (e) => setError(e.response?.data?.detail || 'Matrix Sync Interrupted. Verify Node integrity.'),
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
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 ring-1 ring-black/5 animate-scale-in">
        <div className="flex items-center justify-between p-14 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">{isEdit ? 'Refine Asset Node' : 'Initialize Cache Target'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Precision Milestone Protocol</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 p-4 rounded-3xl hover:bg-white transition-all active:scale-90"><X size={28}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-14 space-y-10">
          {error && <div className="flex items-center gap-4 bg-rose-50 text-rose-600 p-8 rounded-3xl text-[12px] font-black uppercase tracking-widest border border-rose-100 shadow-xl"><AlertCircle size={24}/>{error}</div>}
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Asset Trace Identifier</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. S-Node Alpha (Future Fund)"
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-base font-black text-slate-950 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest italic outline-none"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Current Locked Val (Rs)</label>
                <input required type="number" step="0.01" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-black text-slate-950 italic tracking-tighter outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"/>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Target Capacity (Rs)</label>
                <input required type="number" step="0.01" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-black text-slate-950 italic tracking-tighter outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-blue-600"/>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] ml-2 italic">Sector Classification</label>
              <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest appearance-none cursor-pointer">
                {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all">Abort Sync</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-14 py-7 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic group flex items-center gap-4">
              {mutation.isPending ? 'LOCKING...' : 'INITIALIZE ASSET NODE'}
              <Zap size={18} className="group-hover:animate-pulse opacity-50" />
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
    <div className="space-y-20 pb-40 max-w-7xl mx-auto">
      {/* Header Context Bridge */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-5 mb-4">
             <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full shadow-xl shadow-blue-500/20 italic">Asset Resilience: Monitoring Active</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">{goals?.length || 0} Registered Cache Nodes Persistent</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Future Fund</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] opacity-60 leading-[2.5] max-w-2xl italic ml-1">Aggregate Wealth Consolidation & High-Fidelity Milestone Projection Monitoring. System Resilience Matrix Online.</p>
        </div>
        <button onClick={() => setFormModal({ open: true, editItem: null })}
          className="group flex items-center gap-6 px-14 py-8 bg-slate-950 text-white rounded-[2.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:scale-105 active:scale-95 shadow-blue-900/40 italic">
          <span className="relative z-10">Initialize New Node</span>
          <Plus size={26} className="relative z-10 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Aggregate Matrix Terminals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 px-6">
         {/* Total Saved Terminal */}
         <div className="bg-slate-950 rounded-[4rem] p-16 shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group min-h-[400px]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-all duration-[4000ms]"></div>
            <div className="relative z-10 flex justify-between items-start">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Consolidated Asset Cache</p>
               <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <Activity size={24} className="text-blue-500 animate-pulse" />
               </div>
            </div>
            <p className="text-7xl font-black text-white tracking-tighter italic relative z-10 scale-100 group-hover:scale-[1.02] transition-transform duration-700">{formatCurrency(totalSaved)}</p>
            <div className="relative z-10 flex items-center gap-8">
               <div className="px-6 py-3 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">Resilience Threshold: {aggregateProgress.toFixed(1)}%</p>
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/10 italic">METRIC_STABLE_CONSISTENT</span>
            </div>
         </div>

         {/* Distribution Node Map */}
         <div className="bg-white rounded-[4rem] p-16 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-16 group hover:shadow-2xl transition-all duration-700">
             <div className="h-72 w-full md:w-1/2 relative bg-slate-50/50 rounded-[3rem] p-8 border border-slate-50">
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 italic">DISTRO</p>
                  <p className="text-2xl font-black text-slate-950 italic tracking-tighter">MAP</p>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={12} dataKey="value" stroke="none" animationDuration={2000}>
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="w-full md:w-1/2 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={20} /></div>
                   <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter italic">Allocation Matrix</h3>
                </div>
                <div className="grid grid-cols-1 gap-5">
                   {goals?.slice(0, 4).map((g, i) => (
                     <div key={g.id} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-6">
                           <div className="w-4 h-4 rounded-full transition-all group-hover/item:scale-125 shadow-lg" style={{ background: COLORS[i % COLORS.length] }}></div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-slate-950 transition-colors italic">{g.name}</p>
                        </div>
                        <p className="text-[12px] font-black text-slate-950 italic">{((g.current / totalSaved) * 100 || 0).toFixed(1)}%</p>
                     </div>
                   ))}
                   {goals?.length > 4 && (
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic pt-4">+{goals.length - 4} Additional Nodes Inactive</p>
                   )}
                </div>
             </div>
         </div>
      </div>

      {/* Goal Cards Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-80 bg-white border border-slate-50 rounded-[4rem] animate-pulse"/>)
        ) : goals?.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-[5rem] border-8 border-dotted border-slate-50 p-48 text-center flex flex-col items-center gap-12 shadow-inner group hover:bg-slate-50/10 transition-all">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-400/10 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
                <div className="p-16 bg-white shadow-2xl rounded-[4rem] border border-slate-50 scale-110 group-hover:scale-125 transition-all duration-700">
                   <PiggyBank size={120} className="text-slate-100 group-hover:text-blue-600/10 transition-colors" />
                </div>
             </div>
             <div className="max-w-xl space-y-6">
                <h2 className="text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">Zero Assets Logged</h2>
                <p className="text-slate-400 font-black text-sm uppercase tracking-[0.5em] opacity-40 leading-[2.5] italic">No future fund nodes detected in current matrix. Initialize a new asset trace to begin compounding resilience.</p>
             </div>
             <button onClick={() => setFormModal({ open: true, editItem: null })}
               className="bg-slate-950 text-white px-20 py-8 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/40 italic">
               Deploy Primary Cache Node
             </button>
          </div>
        ) : (
          goals.map((goal, i) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="bg-white rounded-[4rem] p-16 shadow-sm border border-slate-200/50 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 border border-slate-50"><Target size={36}/></div>
                    <div>
                      <p className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none mb-3 drop-shadow-sm group-hover:text-blue-600 transition-colors">{goal.name}</p>
                      <span className="text-[10px] font-black bg-slate-950 text-white px-5 py-2 rounded-full uppercase tracking-[0.3em] italic shadow-lg shadow-slate-900/10">{goal.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-12 group-hover:translate-x-0">
                    <button onClick={() => setFormModal({ open: true, editItem: goal })} className="p-4 bg-white text-slate-300 hover:text-blue-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-50"><Sparkles size={22}/></button>
                    <button onClick={() => { if(window.confirm('IRREVERSIBLE: PURGE ASSET NODE?')) deleteMutation.mutate(goal.id); }} 
                      className="p-4 bg-white text-slate-300 hover:text-rose-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-50"><Trash2 size={22}/></button>
                  </div>
                </div>

                <div className="space-y-12 relative z-10">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 italic leading-none">Locked Multi-Asset Value</p>
                        <p className="text-5xl font-black text-slate-950 tracking-tighter italic leading-none group-hover:scale-105 transition-transform origin-left duration-500">{formatCurrency(goal.current)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-nowrap text-slate-300 uppercase tracking-[0.5em] mb-4 italic leading-none">Target Capacity Threshold</p>
                        <p className="text-3xl font-black text-slate-300 tracking-tighter italic leading-none group-hover:text-slate-400 transition-colors">{formatCurrency(goal.target)}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="w-full bg-slate-50 rounded-full h-12 p-3 overflow-hidden shadow-inner border border-slate-100 flex items-center relative group-hover:scale-[1.01] transition-transform duration-500">
                        <div className="h-full rounded-full transition-all duration-[3000ms] ease-out relative z-10"
                          style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], boxShadow: `0 0 40px ${COLORS[i % COLORS.length]}50` }}>
                           <div className="absolute inset-0 bg-white/20 blur-[4px]"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                           <p className={`text-[10px] font-black uppercase tracking-widest ${pct > 40 ? 'text-white' : 'text-slate-300'} italic`}>{pct.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Resilience Optimal</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-40">Gap: {formatCurrency(Math.max(0, goal.target - goal.current))}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-4">
                      <Activity size={18} className="text-blue-600 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Node Sync: VERIFIED</p>
                   </div>
                   <button className="group/btn flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-4 transition-all duration-500 italic">
                      Expansion Protocol <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                   </button>
                </div>

                {/* Perspective Grid Pattern (Subtle UI Layer) */}
                <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 border border-slate-50 rounded-full opacity-5 pointer-events-none transition-all duration-[2000ms] group-hover:scale-150 rotate-45"></div>
              </div>
            );
          })
        )}
      </div>

      {/* System Integrity Footer Terminal */}
      <div className="text-center mt-20 bg-white shadow-2xl shadow-slate-900/5 py-16 rounded-[4rem] border border-slate-200/50 mx-6 group hover:border-blue-100 transition-all duration-700 relative overflow-hidden">
         <div className="absolute -top-32 -left-32 w-64 h-64 bg-slate-50 rounded-full blur-[80px] group-hover:bg-blue-50 transition-all duration-1000"></div>
         <div className="flex items-center justify-center gap-16 mb-10 relative z-10">
            <Calculator size={40} className="text-slate-200 group-hover:text-blue-600 transition-all duration-500 hover:rotate-12" />
            <div className="p-8 bg-slate-950 rounded-[2.5rem] shadow-2xl rotate-45 group-hover:rotate-0 transition-all duration-700">
               <PieIcon size={48} className="text-white -rotate-45 group-hover:rotate-0 transition-all duration-700" />
            </div>
            <HeartPulse size={40} className="text-slate-200 group-hover:text-rose-600 transition-all duration-500 hover:-rotate-12" />
         </div>
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] italic px-12 leading-[2.5] relative z-10 max-w-4xl mx-auto opacity-60 group-hover:opacity-100 transition-opacity">Vantage Dynamic Asset Realignment Architecture v4.2.1 // Continuous Milestone Projection monitoring persistent for Charith & Family Nodes.</p>
         <div className="mt-8 relative z-10">
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-blue-600/30">System_Health_Absolute_Stable</span>
         </div>
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
