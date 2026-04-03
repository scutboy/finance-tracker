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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    <div className={`flex items-start gap-6 border-2 rounded-[2rem] p-8 transition-all hover:scale-[1.01] hover:shadow-xl group bg-white ${colors[color]}`}>
      <div className="shrink-0 mt-1 p-4 bg-white/50 rounded-2xl shadow-sm transform group-hover:rotate-12 transition-transform">{icon}</div>
      <p className="text-sm font-black uppercase tracking-tight leading-relaxed italic opacity-80">{text}</p>
    </div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-2xl p-6 backdrop-blur-md">
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-4 opacity-60">Timeline Delta: Month {label}</p>
      <div className="space-y-4">
        {payload.map(p => (
          <div key={p.name} className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: p.color }}/>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{p.name === 'avalanche' ? 'Avalanche Strategy' : 'Snowball Method'}</span>
            </div>
            <span className="font-black text-slate-900 text-lg italic tracking-tighter">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Debt Advisor Page ────────────────────────────────────────────────────────
const DebtAdvisor = () => {
  const [extra, setExtra] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);

  const extraVal = parseFloat(extra) || 0;

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const { data: proj, isLoading, refetch } = useQuery({
    queryKey: ['debtProjection', extraVal],
    queryFn: async () => (await api.get(`/debts/projection?extra=${extraVal}`)).data,
    enabled: true,
  });

  const activeDebts = debts?.filter(d => d.status !== 'Paid Off') ?? [];

  if (activeDebts.length === 0) return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col gap-8 px-2 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center gap-4 mb-4 relative z-10">
           <span className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 italic">System Status: Sovereign Pure</span>
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none relative z-10">Debt Advisor Terminal</h1>
      </div>
      <div className="bg-white rounded-[4rem] border-4 border-dashed border-slate-100 p-40 text-center flex flex-col items-center gap-12 shadow-inner mx-2 transform transition-all hover:shadow-2xl">
        <div className="p-16 bg-emerald-50 text-emerald-500 rounded-[4rem] shadow-2xl scale-125 transition-transform animate-bounce-subtle">
           <Trophy size={96} />
        </div>
        <div className="max-w-2xl">
          <h2 className="text-6xl font-black text-slate-950 uppercase tracking-tighter italic mb-6 leading-none">Complete Liquid Freedom</h2>
          <p className="text-slate-400 font-black text-xl leading-relaxed uppercase tracking-[0.2em] opacity-60">No liability traces found within the core perimeter. Financial sovereignty confirmed for Charith & Family.</p>
        </div>
      </div>
    </div>
  );

  const chart = proj?.chart ?? [];
  const displayChart = showFullTable ? chart : chart.filter(p => p.month % 3 === 0 || p.month === 1);
  const preferAvalanche = (proj?.savings_vs_snowball ?? 0) >= 0;

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <span className="text-blue-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 italic">Strategic Computation Node</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ml-2">Simulated Intelligence: Active</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Strategic Delta</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">AI-Driven Liability Dissolution & Timeline Projections.</p>
        </div>
      </div>

      {/* ── Extra Payment What-If ──────────────────────────────────────────── */}
      <div className="bg-slate-950 rounded-[3.5rem] p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between text-white border border-white/5 relative overflow-hidden group hover:shadow-blue-500/10 transition-all duration-1000">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none group-hover:scale-150 transition-all duration-[4000ms]"></div>
         <div className="lg:max-w-2xl relative z-10 w-full">
           <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-6 mb-8 leading-none">
             <Brain size={56} className="text-blue-400 animate-pulse" /> Computation Engine
           </h2>
           <p className="text-slate-400 font-black text-sm leading-relaxed mb-12 uppercase tracking-[0.3em] opacity-60">Inject surplus liquidity nodes to recalculate the optimal liberation timeline.</p>
           
           <div className="flex flex-col sm:flex-row gap-6">
             <div className="relative flex-1 group/input">
               <span className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-400 font-black text-xs uppercase tracking-[0.3em] opacity-50 italic group-focus-within/input:opacity-80 transition-opacity">Flux Inject: Rs</span>
               <input
                 type="number" min="0" step="1000"
                 value={extra}
                 onChange={e => { setExtra(e.target.value); setSubmitted(false); }}
                 className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] pl-48 pr-10 py-7 text-white font-black italic text-2xl outline-none focus:ring-8 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:opacity-0"
               />
             </div>
             <button
               onClick={() => { setSubmitted(true); refetch(); }}
               className="bg-blue-600 text-white font-black px-16 py-7 rounded-[2rem] hover:bg-white hover:text-slate-900 hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 shrink-0"
             >
               Execute Calc
             </button>
           </div>
         </div>
         <div className="hidden lg:block relative z-10 opacity-30 group-hover:opacity-100 transition-all transform rotate-6 scale-150 translate-x-20">
            <Zap size={280} className="text-blue-500 drop-shadow-[0_0_50px_rgba(37,99,235,0.5)]" />
         </div>
      </div>

      {/* ── Strategy Comparison ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-slate-50 rounded-[3rem]"/>)}
        </div>
      ) : proj && (
        <div className="space-y-16">
          <div className="px-2">
            <div className="flex items-center gap-4 mb-10">
              <span className="w-2 h-10 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"></span>
              <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Optimization Benchmarks</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Avalanche */}
              <div className={`rounded-[3.5rem] p-12 border-4 transition-all relative overflow-hidden group transform hover:scale-[1.02] ${preferAvalanche ? 'border-blue-600 bg-blue-50 shadow-2xl shadow-blue-500/10' : 'border-slate-100 bg-white opacity-40 grayscale'}`}>
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`p-6 rounded-[2.5rem] ${preferAvalanche ? 'bg-blue-600 text-white shadow-2xl' : 'bg-slate-100 text-slate-400'}`}><TrendingDown size={40}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 opacity-60 leading-none">Methodology</p>
                      <h3 className="text-3xl font-black uppercase tracking-tight leading-none italic text-slate-900">Avalanche</h3>
                    </div>
                  </div>
                  {preferAvalanche && <span className="text-[10px] bg-blue-600 text-white px-5 py-2.5 rounded-full font-black uppercase tracking-[0.3em] shadow-xl animate-pulse italic">Optimal Solution</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-12 relative z-10 border-t border-slate-100 pt-10">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 opacity-60">Liberation Cycle</label>
                    <p className="text-6xl font-black text-slate-950 tracking-tighter italic leading-none">{proj.avalanche_months}<span className="text-sm font-black uppercase ml-2 opacity-40 tracking-widest">Mo</span></p>
                    <p className="text-[10px] font-black text-blue-600 mt-4 uppercase tracking-[0.3em] italic">{(proj.avalanche_months/12).toFixed(1)} Year Phase</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 opacity-60">Aggregate Leakage</label>
                    <p className="text-4xl font-black text-rose-600 tracking-tighter italic leading-none">{formatCurrency(proj.avalanche_interest)}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">Priority: APR Node High</p>
                  </div>
                </div>
              </div>

              {/* Snowball */}
              <div className={`rounded-[3.5rem] p-12 border-4 transition-all relative overflow-hidden group transform hover:scale-[1.02] ${!preferAvalanche ? 'border-purple-600 bg-purple-50 shadow-2xl shadow-purple-500/10' : 'border-slate-100 bg-white opacity-40 grayscale'}`}>
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div className="flex items-center gap-6">
                    <div className={`p-6 rounded-[2.5rem] ${!preferAvalanche ? 'bg-purple-600 text-white shadow-2xl' : 'bg-slate-100 text-slate-400'}`}><Zap size={40}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 opacity-60 leading-none">Methodology</p>
                      <h3 className="text-3xl font-black uppercase tracking-tight leading-none italic text-slate-900">Snowball</h3>
                    </div>
                  </div>
                   {!preferAvalanche && <span className="text-[10px] bg-purple-600 text-white px-5 py-2.5 rounded-full font-black uppercase tracking-[0.3em] shadow-xl animate-pulse italic">Psychological High</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-12 relative z-10 border-t border-slate-100 pt-10">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 opacity-60">Liberation Cycle</label>
                    <p className="text-6xl font-black text-slate-950 tracking-tighter italic leading-none">{proj.snowball_months}<span className="text-sm font-black uppercase ml-2 opacity-40 tracking-widest">Mo</span></p>
                    <p className="text-[10px] font-black text-purple-600 mt-4 uppercase tracking-[0.3em] italic">{(proj.snowball_months/12).toFixed(1)} Year Phase</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 opacity-60">Aggregate Leakage</label>
                    <p className="text-4xl font-black text-rose-600 tracking-tighter italic leading-none">{formatCurrency(proj.snowball_interest)}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">Priority: Lower Bal First</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Injection Overlay Result */}
            {(submitted && extraVal > 0) && (
              <div className="mt-10 px-2 animate-bounce-subtle">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border-4 border-white/20">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] transform translate-x-20 -translate-y-20 group-hover:scale-150 transition-all duration-[3000ms]"></div>
                  <div className="flex flex-col lg:flex-row items-center justify-between relative z-10 gap-10">
                    <div className="text-center lg:text-left">
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-100/60 mb-3 opacity-80 leading-none">Injection Delta Result</p>
                      <h3 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Rs {extraVal.toLocaleString()}/mo Node</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-16 text-center lg:text-right border-l border-white/20 pl-0 lg:pl-16">
                       <div className="group/item">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-3 leading-none italic group-hover/item:opacity-100 transition-opacity">Time Reclaimed</p>
                         <p className="text-5xl font-black tracking-tighter italic leading-none">{proj.months_saved_vs_snowball || 0} Mo</p>
                       </div>
                       <div className="group/item">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-3 leading-none italic group-hover/item:opacity-100 transition-opacity">Asset Retrieval</p>
                         <p className="text-5xl font-black tracking-tighter italic leading-none">{formatCurrency(Math.max(0, proj.savings_vs_snowball))}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Trajectory Plot ───────────────────────────────────────── */}
          <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl px-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8 px-6">
               <div>
                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">Extinction Trajectory</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 opacity-60">Composite Strategy Dissolution Analysis</p>
               </div>
               <div className="flex flex-wrap items-center gap-8 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-80">Avalanche Delta</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20"></div>
                        <span className="w-5 h-5 rounded-full bg-white border-4 border-purple-500 border-dashed relative z-10"></span>
                     </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-80">Snowball Trace</span>
                  </div>
               </div>
            </div>
            {chart.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-slate-200 gap-8 opacity-50">
                 <Target size={120} className="animate-pulse" />
                 <p className="uppercase font-black tracking-[0.5em] text-sm italic">Establishing Baseline Parameters...</p>
              </div>
            ) : (
              <div className="h-[500px] w-full px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    <defs>
                      <linearGradient id="av" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                      tickFormatter={v => `MO ${v}`}/>
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                      tickFormatter={v => `${(v/1000).toFixed(0)}K`}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="avalanche" stroke="#2563eb" strokeWidth={6}
                      fill="url(#av)" name="Avalanche Path" activeDot={{ r: 10, stroke: '#fff', strokeWidth: 5, shadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                    <Area type="monotone" dataKey="snowball" stroke="#a855f7" strokeWidth={3}
                      fill="url(#sw)" name="Snowball Path" strokeDasharray="12 12" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Payoff Order & Intelligence ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-2">
             {/* Payoff Order */}
             {proj.payoff_order?.length > 0 && (
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl group">
                  <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic mb-12 flex items-center gap-4">
                     <Target size={32} className="text-rose-500" /> Sequential Neutralization
                  </h2>
                  <div className="space-y-10">
                    {proj.payoff_order.map((item, idx) => (
                      <div key={item.name} className="group/item relative">
                        <div className="flex items-center gap-8 relative z-10">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black italic shrink-0 transition-all group-hover/item:scale-110 group-hover/item:rotate-6 ${
                            idx === 0 ? 'bg-slate-950 text-white shadow-2xl' : idx === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>{idx + 1}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-end mb-4 px-1">
                              <div>
                                <p className="font-black text-slate-950 text-xl tracking-tighter italic leading-none group-hover/item:text-blue-600 transition-colors uppercase">{item.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 italic">{monthToDate(item.paid_month).toUpperCase()} MATURITY</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Delta Point</p>
                                <p className="text-sm font-black text-slate-950 italic">Month {item.paid_month}</p>
                              </div>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-4 p-0.5 overflow-hidden shadow-inner border border-slate-100 italic transition-all group-hover/item:scale-[1.02]">
                              <div className={`h-full rounded-full transition-all duration-[3000ms] ease-out shadow-[0_0_15px_rgba(0,0,0,0.1)] ${idx === 0 ? 'bg-slate-900 shadow-slate-900/20' : idx === 1 ? 'bg-blue-500 shadow-blue-500/20' : 'bg-slate-300'}`}
                                style={{ width: `${Math.min((item.paid_month / (proj.avalanche_months || 1)) * 100, 100)}%` }}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}

             {/* Intelligence Insights */}
             <div className="space-y-12">
                {proj.insights?.length > 0 && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic flex items-center gap-6 px-4">
                      <Brain size={40} className="text-blue-600"/> Intelligence Node
                    </h2>
                    <div className="space-y-6">
                      {proj.insights.map((tip, i) => {
                        const colors = ['blue', 'green', 'amber', 'red', 'blue'];
                        const icons = [
                          <TrendingDown size={28}/>,
                          <Trophy size={28}/>,
                          <Zap size={28}/>,
                          <AlertTriangle size={28}/>,
                          <DollarSign size={28}/>,
                        ];
                        return <InsightCard key={i} icon={icons[i % icons.length]} text={tip} color={colors[i % colors.length]}/>;
                      })}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* ── Perimeter Snapshot ─────────────────────────────────── */}
          <div className="bg-slate-950 p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group mx-2 border-border-white/5 transition-all hover:shadow-cyan-500/5">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-rose-600 opacity-20 group-hover:opacity-100 transition-opacity duration-[2000ms]"></div>
            <div className="flex flex-col lg:flex-row items-center justify-between mb-20 border-b border-white/5 pb-12 gap-10">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-5 leading-none">
                 <ShieldCheck size={40} className="text-blue-500" /> Tactical Decomposition
               </h2>
               <div className="flex flex-col items-center lg:items-end">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3 leading-none opacity-60">Aggregated Perimeter Leakage</p>
                  <p className="text-6xl font-black text-rose-500 tracking-tighter italic leading-none uppercase">{formatCurrency(proj.total_debt)}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {activeDebts.map(debt => {
                const monthlyInterest = (debt.balance * debt.interest_rate / 100 / 12);
                return (
                  <div key={debt.id} className="relative group/item bg-white/5 rounded-[2.5rem] p-10 border border-white/5 hover:border-white/10 transition-all hover:bg-white/10 scale-100 hover:scale-[1.02]">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="p-5 bg-white/5 text-slate-500 rounded-2xl group-hover/item:text-white group-hover/item:bg-white/10 transition-all shadow-inner"><DollarSign size={28}/></div>
                        <div>
                          <p className="font-black text-white text-xl tracking-tighter uppercase italic leading-none mb-3">{debt.name}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-60 italic">{debt.interest_rate}% APR Sector Lock</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-white text-3xl tracking-tighter italic leading-none mb-3">{formatCurrency(debt.balance)}</p>
                        <p className="text-[9px] text-rose-500 font-black uppercase tracking-[0.3em] italic">Leak: {formatCurrency(monthlyInterest)}/mo</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-20 text-center border-t border-white/5 pt-10">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] italic opacity-40">Vantage Intelligence Delta Matrix v2.7.4-Pro</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtAdvisor;
