import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Trophy, Zap, Target, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const monthToDate = (m) => {
  const now = new Date();
  now.setMonth(now.getMonth() + m);
  return now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const InsightCard = ({ icon, text, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50/50 border-blue-100 text-blue-700 font-black',
    green: 'bg-emerald-50/50 border-emerald-100 text-emerald-700 font-black',
    amber: 'bg-amber-50/50 border-amber-100 text-amber-700 font-black',
    red: 'bg-rose-50/50 border-rose-100 text-rose-700 font-black',
  };
  return (
    <div className={`flex items-start gap-4 border border-slate-100 rounded-xl p-5 transition-all hover:scale-[1.01] hover:shadow-lg bg-white ${colors[color]}`}>
      <div className="shrink-0 p-3 bg-white/50 rounded-xl shadow-sm">{icon}</div>
      <p className="text-[11px] uppercase tracking-tight italic opacity-90 leading-relaxed font-black">{text}</p>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-5 italic ring-1 ring-black/5">
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-4 opacity-70">Month {label}</p>
      <div className="space-y-4">
        {payload.map(p => (
          <div key={p.name} className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }}/>
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{p.name === 'avalanche' ? 'Avalanche' : 'Snowball'}</span>
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tighter italic">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DebtAdvisor = () => {
  const { user } = useAuth();
  const [extraInput, setExtraInput] = useState('0');
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
    <div className="py-32 text-center flex flex-col items-center gap-12 italic">
       <div className="p-16 bg-emerald-50 text-emerald-500 rounded-full animate-bounce-subtle border-8 border-white shadow-2xl scale-125"><Trophy size={80}/></div>
       <div className="max-w-xl space-y-6">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-950">Liquid Pure</h1>
          <p className="text-slate-400 font-black text-sm uppercase tracking-[0.6em] opacity-40 italic">Zero liability traces detected. Core perimeter secure.</p>
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
             <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full">Strategic Node: Alpha</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-2 tracking-[0.7em]">Methodology Comparison Active</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-950 uppercase leading-none">Strategic Delta</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 ml-1">AI-Driven liability dissolution & flux simulation.</p>
        </div>
        <div className="flex bg-slate-950 p-2 rounded-[1.5rem] shadow-2xl items-center gap-4 border border-white/5 pr-4">
           <div className="p-3 bg-white/10 rounded-xl text-blue-400"><Brain size={18} /></div>
           <p className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Neural strategy processing node live</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] relative z-10">Aggregate Liability</p>
            <p className="text-3xl lg:text-4xl font-black text-white tracking-tighter relative z-10">{formatCurrency(proj?.total_debt || activeDebts.reduce((s,d)=>s+d.balance, 0))}</p>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 relative z-10 opacity-40">System Audit Nominal</span>
         </div>
         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Optimized Phase Timeline</p>
            <div>
               <p className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2">{(proj?.avalanche_months/12 || 0).toFixed(1)} <span className="text-xs opacity-40">Years</span></p>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] font-mono">{proj?.avalanche_months || '--'} Payload Cycles</span>
            </div>
         </div>
         <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Methodology Delta Savings</p>
            <div>
               <p className="text-3xl font-black text-emerald-600 tracking-tighter uppercase mb-2">{formatCurrency(proj?.savings_vs_snowball || 0)}</p>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono">Strategy Surplus Capacity</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 relative group overflow-hidden transition-all duration-700 hover:border-emerald-100">
         <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[5000ms]"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="space-y-4">
             <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950 flex items-center gap-4">
                <Zap size={32} className="text-emerald-500" /> Flux Injection Performance
             </h2>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] max-w-xl leading-relaxed">Instantly recalculate your liberation timeline and interest avoidance by entering a surplus monthly contribution node.</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto p-4 bg-slate-50 border border-slate-100 rounded-[2rem] shadow-inner group-hover:bg-white transition-all">
             <input type="number" min="0" step="1000" value={extraInput} onChange={e => setExtraInput(e.target.value)} placeholder="0.00"
               className="bg-transparent rounded-xl px-4 py-4 text-slate-950 font-black text-3xl outline-none transition-all w-full md:w-64 placeholder:opacity-10 italic tracking-tighter"/>
             <div className="bg-slate-950 text-white p-4 rounded-xl flex items-center justify-center shadow-2xl"><Target size={24}/></div>
           </div>
         </div>
         {extraVal > 0 && proj && (
            <div className="mt-12 p-12 bg-emerald-600 text-white rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between gap-16 animate-scale-in shadow-3xl relative overflow-hidden group/card">
               <div className="absolute inset-0 bg-white/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
               <div className="text-center lg:text-left relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-60 mb-3">CURRENT INJECTION IMPACT</p>
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter">Real-time Simulation Updated</h3>
               </div>
               <div className="flex gap-16 lg:border-l lg:border-white/20 lg:pl-16 w-full lg:w-auto justify-center lg:justify-start relative z-10">
                  <div className="group/item">
                     <p className="text-[11px] font-black uppercase opacity-60 mb-3 italic tracking-widest text-emerald-100">Time Reclaimed</p>
                     <p className="text-3xl lg:text-6xl font-black italic tracking-tighter scale-100 group-hover/item:scale-105 transition-transform origin-left">{proj.months_saved_vs_baseline || 0} <span className="text-lg opacity-40 ml-1">MO</span></p>
                  </div>
                  <div className="group/item">
                     <p className="text-[11px] font-black uppercase opacity-60 mb-3 italic tracking-widest text-emerald-100">Avoided Leakage</p>
                     <p className="text-5xl font-black italic tracking-tighter scale-100 group-hover/item:scale-105 transition-transform origin-left">{formatCurrency(proj.interest_saved_vs_baseline || 0)}</p>
                  </div>
               </div>
            </div>
         )}
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative group overflow-hidden hover:shadow-2xl transition-all duration-700">
         <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 px-4">
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">Extinction trajectory</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic opacity-60">Composite strategy dissolution trace</p>
            </div>
            <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.5em] bg-slate-50 px-6 py-3 rounded-full border border-slate-100 italic">
               <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-600 shadow-xl shadow-blue-500/50"></div> Avalanche Alpha</div>
               <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500 border-dashed"></div> Snowball Trace</div>
            </div>
         </div>
         <div className="h-[300px] lg:h-[450px] w-full relative z-10 px-4">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chart}>
                 <defs>
                   <linearGradient id="avalancheGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} tickFormatter={v => `CYC ${v}`}/>
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} tickFormatter={v => `${(v/1000)}k`}/>
                 <Tooltip content={<CustomTooltip/>}/>
                 <Area type="monotone" dataKey="avalanche" stroke="#2563eb" strokeWidth={6} fill="url(#avalancheGrad)" isAnimationActive={false} activeDot={{ r: 10, fill: '#2563eb', stroke: '#fff', strokeWidth: 4 }} />
                 <Area type="monotone" dataKey="snowball" stroke="#a855f7" strokeWidth={3} fill="transparent" strokeDasharray="12 12" opacity={0.3} isAnimationActive={false} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-700">
            <h2 className="text-2xl font-black text-slate-950 uppercase mb-12 flex items-center gap-5 italic tracking-tighter leading-none">
               <Target size={36} className="text-rose-500" /> Payoff sequence
            </h2>
            <div className="space-y-12 flex-1 scrollbar-hide">
               {proj?.payoff_order?.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-8 group/item relative">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black italic transition-all group-hover/item:scale-110 group-hover/item:rotate-6 ${idx === 0 ? 'bg-slate-950 text-white shadow-2xl' : 'bg-slate-100 text-slate-400'}`}>{idx + 1}</div>
                    <div className="flex-1">
                       <div className="flex justify-between items-end mb-4">
                          <p className="font-black text-slate-950 text-xl lg:text-2xl tracking-tighter uppercase italic group-hover/item:text-blue-600 transition-colors leading-none">{item.name}</p>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Day {item.paid_month * 30}</p>
                       </div>
                       <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200/50 relative group-hover/item:h-5 transition-all">
                          <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-inner ${idx === 0 ? 'bg-slate-950 shadow-slate-900/40' : 'bg-blue-600 shadow-blue-500/40'}`} 
                            style={{ width: `${Math.min((item.paid_month / (proj.avalanche_months || 1)) * 100, 100)}%` }}/>
                       </div>
                       <div className="flex justify-between items-center mt-4">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic opacity-80">Maturity: {monthToDate(item.paid_month).toUpperCase()}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest italic ${idx === 0 ? 'text-blue-600' : 'text-slate-400 opacity-40'}`}>{idx === 0 ? 'PRIMARY_TARGET' : 'QUEUE_STATUS: WAIT'}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-10">
            <h2 className="text-2xl font-black text-slate-950 uppercase flex items-center gap-8 px-6 italic tracking-tighter leading-none">
               <Brain size={48} className="text-blue-600"/> Intelligence Hub
            </h2>
            <div className="space-y-6">
               {proj?.insights?.map((tip, i) => <InsightCard key={i} icon={<Zap size={22}/>} text={tip} color={i === 0 ? 'green' : i === 1 ? 'blue' : 'amber'}/>)}
               {proj?.insights?.length === 0 && (
                  <div className="h-96 flex flex-col items-center justify-center gap-8 bg-slate-50 rounded-[3.5rem] border border-slate-100 border-dashed opacity-50">
                     <Brain size={80} className="animate-pulse text-slate-200" />
                     <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.8em] italic">Synthesizing Strategy...</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      <div className="text-center mt-24 bg-white/40 backdrop-blur-md py-16 rounded-[4rem] border border-slate-200/50 mx-4 relative overflow-hidden group">
         <div className="absolute inset-0 bg-blue-500/[0.01] -skew-x-12 translate-x-1/2 animate-pulse-slow"></div>
         <p className="text-[12px] font-black text-slate-400 uppercase tracking-[1em] px-20 relative z-10 opacity-30 group-hover:opacity-100 transition-opacity duration-[2000ms] leading-loose">© 2026 {user?.name}. Strategic v3.1 PRO -- Neural Architecture v4.2 Trace.</p>
      </div>
    </div>
  );
};

export default DebtAdvisor;
