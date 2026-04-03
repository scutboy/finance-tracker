import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Trophy, Zap, DollarSign,
  Target, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const monthToDate = (m) => {
  const now = new Date();
  now.setMonth(now.getMonth() + m);
  return now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const InsightCard = ({ icon, text, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50/50 border-blue-100 text-blue-700',
    green: 'bg-emerald-50/50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50/50 border-amber-100 text-amber-700',
    red: 'bg-rose-50/50 border-rose-100 text-rose-700',
  };
  return (
    <div className={`flex items-start gap-4 border border-slate-100 rounded-xl p-6 transition-all hover:shadow-lg bg-white ${colors[color]}`}>
      <div className="shrink-0 p-3 bg-white/50 rounded-xl shadow-sm">{icon}</div>
      <p className="text-xs font-black uppercase tracking-tight italic opacity-80 leading-relaxed">{text}</p>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4 italic">
      <p className="font-black text-slate-400 text-[8px] uppercase tracking-widest mb-3 opacity-60">Month {label}</p>
      <div className="space-y-2">
        {payload.map(p => (
          <div key={p.name} className="flex items-center justify-between gap-6">
            <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{p.name === 'avalanche' ? 'Avalanche' : 'Snowball'}</span>
            <span className="font-black text-slate-900 text-sm italic">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DebtAdvisor = () => {
  const { user } = useAuth();
  const [extraInput, setExtraInput] = useState('0');
  
  // Use a debounced or delayed value for the query to ensure smooth typing
  const extraVal = parseFloat(extraInput) || 0;

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const { data: proj, isLoading } = useQuery({
    queryKey: ['debtProjection', extraVal, debts?.length],
    queryFn: async () => (await api.get(`/debts/projection?extra=${extraVal}`)).data,
    enabled: !!debts?.length,
    keepPreviousData: true,
  });

  const activeDebts = debts?.filter(d => d.status !== 'Paid Off') ?? [];

  if (activeDebts.length === 0) return (
    <div className="py-32 text-center flex flex-col items-center gap-10 italic">
       <div className="p-12 bg-emerald-50 text-emerald-500 rounded-full animate-bounce-subtle"><Trophy size={80}/></div>
       <div className="max-w-xl space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Financial Sovereignty</h2>
          <p className="text-slate-400 font-black text-sm uppercase tracking-[0.4em] opacity-40 italic">No liability traces detected. Zero Perimeter Threats.</p>
       </div>
    </div>
  );

  const chart = proj?.chart ?? [];
  const preferAvalanche = (proj?.savings_vs_snowball ?? 0) >= 0;

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-6 italic">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full">Strategic computation hub: online</span>
             <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 ml-2">Composite Methodology Active</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase leading-none">Strategic Delta</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 ml-1">AI-Driven liability dissolution engine.</p>
        </div>
        <div className="flex bg-slate-950 p-2 rounded-[1.5rem] shadow-2xl items-center gap-4 border border-white/5 pr-4">
           <div className="p-3 bg-white/10 rounded-xl text-blue-400"><Brain size={18} /></div>
           <p className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Snowball vs Avalanche Logic Persistent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] relative z-10">Consolidated Exposure</p>
            <p className="text-4xl font-black text-white tracking-tighter relative z-10">{formatCurrency(proj?.total_debt || 0)}</p>
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20 relative z-10">Node Status: AUDITING</span>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 leading-none">Avalanche Alpha Efficiency</p>
            <div>
               <p className="text-2xl font-black text-slate-950 tracking-tight uppercase mb-2">{(proj?.avalanche_months/12 || 0).toFixed(1)} <span className="text-xs opacity-40">Years</span></p>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] font-mono">{proj?.avalanche_months || '--'} Payload Cycles</span>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 leading-none">Interest Reclamation</p>
            <div>
               <p className="text-2xl font-black text-emerald-600 tracking-tighter uppercase mb-2">{formatCurrency(proj?.savings_vs_snowball || 0)}</p>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono">Strategy Delta Surplus</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2">
             <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-950">Flux Injection Scenario</h2>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Enter an extra monthly payment amount to see the impact instantly.</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto p-2 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
             <input type="number" min="0" step="1000" value={extraInput} onChange={e => setExtraInput(e.target.value)} placeholder="0.00"
               className="bg-white border border-slate-100 rounded-xl px-6 py-4 text-slate-950 font-black text-lg outline-none focus:border-blue-600 transition-all w-full md:w-48 placeholder:opacity-20"/>
           </div>
         </div>
         {extraVal > 0 && proj && (
            <div className="mt-8 p-8 bg-emerald-600 text-white rounded-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-10 animate-fade-in shadow-xl">
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-60 mb-2">Injection Performance Delta</p>
                  <h3 className="text-3xl font-black uppercase">Instant Prediction Updated</h3>
               </div>
               <div className="flex gap-16 md:border-l border-white/20 md:pl-16 w-full md:w-auto justify-between md:justify-start">
                  <div><p className="text-[8px] font-black uppercase opacity-60 mb-2">Time Reclaimed</p><p className="text-4xl font-black italic tracking-tighter">{proj.months_saved_vs_snowball || 0} Mo</p></div>
                  <div><p className="text-[8px] font-black uppercase opacity-60 mb-2">Interest Avoided</p><p className="text-4xl font-black italic tracking-tighter">{formatCurrency(Math.max(0, proj.savings_vs_snowball))}</p></div>
               </div>
            </div>
         )}
      </div>

      <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 relative group overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Extinction Trajectory</h2>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Composite Path Dissolution Trace</p>
            </div>
            <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Avalanche Alpha</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500 opacity-40"></div> Snowball Trace</div>
            </div>
         </div>
         <div className="h-96 w-full relative z-10 px-4">
           {!proj ? (
             <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
           ) : (
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chart}>
                 <defs>
                   <linearGradient id="avalancheGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} tickFormatter={v => `M${v}`}/>
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} tickFormatter={v => `${(v/1000)}k`}/>
                 <Tooltip content={<CustomTooltip/>}/>
                 <Area type="monotone" dataKey="avalanche" stroke="#2563eb" strokeWidth={5} fill="url(#avalancheGrad)" isAnimationActive={false} />
                 <Area type="monotone" dataKey="snowball" stroke="#a855f7" strokeWidth={2} fill="transparent" strokeDasharray="8 8" opacity={0.3} isAnimationActive={false} />
               </AreaChart>
             </ResponsiveContainer>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-xl font-black text-slate-950 uppercase mb-8 flex items-center gap-4">
               <Target size={24} className="text-rose-500" /> Payoff Sequence
            </h2>
            <div className="space-y-8 flex-1">
               {proj?.payoff_order?.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-6 group/item">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all group-hover/item:scale-110 ${idx === 0 ? 'bg-slate-950 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>{idx + 1}</div>
                    <div className="flex-1">
                       <div className="flex justify-between mb-2">
                          <p className="font-black text-slate-950 text-sm uppercase tracking-tighter group-hover/item:text-blue-600 transition-colors">{item.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Month {item.paid_month}</p>
                       </div>
                       <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100 relative group-hover/item:scale-[1.02] transition-transform">
                          <div className={`h-full rounded-full transition-all duration-700 ease-out ${idx === 0 ? 'bg-slate-950' : 'bg-blue-600'}`} 
                            style={{ width: `${Math.min((item.paid_month / (proj.avalanche_months || 1)) * 100, 100)}%` }}/>
                       </div>
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 opacity-60">Maturation: {monthToDate(item.paid_month).toUpperCase()}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <h2 className="text-xl font-black text-slate-950 uppercase flex items-center gap-6 px-4">
               <Brain size={40} className="text-blue-600"/> Intelligence Node
            </h2>
            <div className="space-y-5">
               {proj?.insights?.map((tip, i) => <InsightCard key={i} icon={<Zap size={16}/>} text={tip} color={i % 2 === 0 ? 'blue' : 'green'}/>)}
               {proj?.insights?.length === 0 && <p className="text-center py-20 text-[10px] font-black text-slate-300 uppercase tracking-widest">Calculating Optimizations...</p>}
            </div>
         </div>
      </div>

      <div className="text-center mt-20 bg-white/40 backdrop-blur-md py-12 rounded-[2rem] border border-slate-100 mx-2 group overflow-hidden relative">
         <div className="absolute inset-0 bg-blue-500/[0.02] -skew-x-12 translate-x-1/2 animate-pulse"></div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em] px-16 relative z-10 opacity-60">© 2026 {user?.name}. Strategic v2.7 PRO -- Persistent Cluster Auditing.</p>
      </div>
    </div>
  );
};

export default DebtAdvisor;
