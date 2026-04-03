import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import {
  Lightbulb, TrendingDown, Trophy, Zap, Clock, DollarSign,
  ShieldCheck, ChevronDown, ChevronUp, AlertTriangle, Target, Brain, ArrowUpRight
} from 'lucide-react';

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
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4">
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
  const [extra, setExtra] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const extraVal = parseFloat(extra) || 0;

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const { data: proj, isLoading, refetch } = useQuery({
    queryKey: ['debtProjection', extraVal],
    queryFn: async () => (await api.get(`/debts/projection?extra=${extraVal}`)).data,
  });

  const activeDebts = debts?.filter(d => d.status !== 'Paid Off') ?? [];

  if (activeDebts.length === 0) return (
    <div className="py-20 text-center space-y-8">
      <div className="p-8 bg-emerald-50 text-emerald-500 rounded-full inline-block"><Trophy size={64}/></div>
      <h2 className="text-4xl font-black italic uppercase tracking-tighter">Liquid Freedom</h2>
      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No active liability traces found.</p>
    </div>
  );

  const chart = proj?.chart ?? [];
  const preferAvalanche = (proj?.savings_vs_snowball ?? 0) >= 0;

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-2">
           <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full italic">Computation Node: Online</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Strategic Delta</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">AI-Driven liability dissolution engine.</p>
      </div>

      <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group border border-white/5">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2">
             <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Flux Inject</h2>
             <p className="text-xs text-slate-500 font-black uppercase tracking-widest italic">Recalculate optimal liberation timeline.</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
             <input type="number" value={extra} onChange={e => { setExtra(e.target.value); setSubmitted(false); }} placeholder="Extra Amount"
               className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white font-black italic text-lg outline-none focus:border-blue-600 transition-all w-full md:w-48"/>
             <button onClick={() => { setSubmitted(true); refetch(); }}
               className="bg-blue-600 text-white font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] italic hover:bg-emerald-600 transition-all shadow-xl">
               Execute
             </button>
           </div>
         </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[1,2].map(i => <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse"/>)}</div>
      ) : proj && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`rounded-[2.5rem] p-10 border transition-all relative overflow-hidden ${preferAvalanche ? 'border-blue-600 bg-blue-50/50' : 'bg-white opacity-40 grayscale border-slate-100'}`}>
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-2xl font-black uppercase italic text-slate-950">Avalanche</h3>
                {preferAvalanche && <span className="text-[8px] bg-blue-600 text-white px-3 py-1 rounded-full font-black uppercase italic">Optimal</span>}
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase italic mb-3">Phase Cycle</p>
                  <p className="text-4xl font-black text-slate-950 italic">{proj.avalanche_months} Mo</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase italic mb-3">Leakage</p>
                  <p className="text-2xl font-black text-rose-600 italic">{formatCurrency(proj.avalanche_interest)}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[2.5rem] p-10 border transition-all relative overflow-hidden ${!preferAvalanche ? 'border-purple-600 bg-purple-50/50' : 'bg-white opacity-40 grayscale border-slate-100'}`}>
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-2xl font-black uppercase italic text-slate-950">Snowball</h3>
                {!preferAvalanche && <span className="text-[8px] bg-purple-600 text-white px-3 py-1 rounded-full font-black uppercase italic">Psychology</span>}
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase italic mb-3">Phase Cycle</p>
                  <p className="text-4xl font-black text-slate-950 italic">{proj.snowball_months} Mo</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase italic mb-3">Leakage</p>
                  <p className="text-2xl font-black text-rose-600 italic">{formatCurrency(proj.snowball_interest)}</p>
                </div>
              </div>
            </div>
          </div>

          {(submitted && extraVal > 0) && (
            <div className="bg-emerald-600 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left">
                     <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Injection Node Result</p>
                     <h3 className="text-3xl font-black italic uppercase">+{formatCurrency(extraVal)} / MO</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-10 text-center">
                     <div><p className="text-[8px] font-black uppercase opacity-60 mb-1">Reclaimed</p><p className="text-3xl font-black italic">{proj.months_saved_vs_snowball || 0} Mo</p></div>
                     <div><p className="text-[8px] font-black uppercase opacity-60 mb-1">Asset Trace</p><p className="text-3xl font-black italic">{formatCurrency(Math.max(0, proj.savings_vs_snowball))}</p></div>
                  </div>
               </div>
            </div>
          )}

          <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
             <h2 className="text-xl font-black text-slate-950 uppercase italic mb-10">Extinction Trajectory</h2>
             <div className="h-96 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chart}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} tickFormatter={v => `M${v}`}/>
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} tickFormatter={v => `${(v/1000)}k`}/>
                   <Tooltip content={<CustomTooltip/>}/>
                   <Area type="monotone" dataKey="avalanche" stroke="#2563eb" strokeWidth={4} fill="#2563eb" fillOpacity={0.05} />
                   <Area type="monotone" dataKey="snowball" stroke="#a855f7" strokeWidth={2} fill="transparent" strokeDasharray="8 8" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-950 uppercase italic mb-8">Neutralization Order</h2>
                <div className="space-y-6">
                   {proj.payoff_order?.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black italic ${idx === 0 ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-400'}`}>{idx + 1}</div>
                        <div className="flex-1">
                           <div className="flex justify-between mb-2">
                              <p className="font-black text-slate-950 text-sm uppercase italic">{item.name}</p>
                              <p className="text-[8px] font-black text-slate-400">Month {item.paid_month}</p>
                           </div>
                           <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                              <div className="bg-slate-950 h-full rounded-full" style={{ width: `${Math.min((item.paid_month / (proj.avalanche_months || 1)) * 100, 100)}%` }}/>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-950 uppercase italic flex items-center gap-4">Intelligence Hub</h2>
                {proj.insights?.slice(0, 3).map((tip, i) => <InsightCard key={i} icon={<Zap size={16}/>} text={tip} color={i % 2 === 0 ? 'blue' : 'green'}/>)}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtAdvisor;
