import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  Maximize2,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Flame,
  LifeBuoy,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Interest Leakage Pulse Component ──────────────────────────────────────────
const LeakagePulse = ({ hourlyRate }) => {
  const [accumulated, setAccumulated] = useState(0);
  
  useEffect(() => {
    if (!hourlyRate) return;
    const interval = setInterval(() => {
      setAccumulated(prev => prev + (hourlyRate / 3600)); // Add second-by-second leakage
    }, 1000);
    return () => clearInterval(interval);
  }, [hourlyRate]);

  return (
    <div className="bg-rose-950 rounded-[2rem] p-8 text-white relative overflow-hidden group border border-rose-500/10 h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-[60px] group-hover:scale-150 transition-all duration-[4000ms]"></div>
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="p-3 bg-white/5 rounded-2xl text-rose-500"><Flame size={20} className="animate-pulse" /></div>
        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 italic">Leakage Flux</span>
      </div>
      <div className="relative z-10 space-y-2">
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic mb-2">Hourly Interest Bleed</p>
        <p className="text-4xl font-black italic tracking-tighter mb-4">{formatCurrency(hourlyRate || 0)}</p>
        <div className="flex items-center gap-3">
           <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 animate-pulse w-[40%]"></div>
           </div>
           <span className="text-[8px] font-black text-rose-400 opacity-60">LIVE TRACE</span>
        </div>
      </div>
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mt-8 italic">Continuous Systemic Outflow Identified</p>
    </div>
  );
};

const MetricCard = ({ title, amount, subtitle, icon: Icon, colorClass, gradientClass }) => {
  return (
    <div className="relative group overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 p-8 flex flex-col justify-between min-h-[180px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl ${gradientClass} transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm border border-slate-50`}>
            <Icon className={colorClass} size={22} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 italic leading-none">Vantage Node</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3 italic opacity-60 ml-1 leading-none">{title}</p>
        <h3 className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none group-hover:scale-105 transition-transform duration-500 origin-left">
          {formatCurrency(amount)}
        </h3>
      </div>
      <div className="relative z-10 pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-40">{subtitle}</p>
        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Member';

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
  });

  const healthStatus = useMemo(() => {
    if (!summary) return { label: 'SYNCHRONIZING...', color: 'text-slate-400', icon: Activity, bg: 'bg-slate-100' };
    const income = summary.total_income || summary.monthly_income || 1;
    const expenses = summary.total_expenses || summary.monthly_expenses || 0;
    const debt = summary.total_debt || 0;
    
    const debtRatio = debt / income;
    const flowRatio = expenses / income;
    
    if (debtRatio > 12 || flowRatio > 0.95) return { label: 'CRITICAL_LEAKAGE', color: 'text-rose-600', icon: ShieldAlert, bg: 'bg-rose-50' };
    if (debtRatio > 6) return { label: 'DEBT_SATURATION', color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50' };
    if (summary.net_worth < 0) return { label: 'NET_NEGATIVE_EQUITY', color: 'text-rose-500', icon: Target, bg: 'bg-rose-50' };
    return { label: 'CLUSTER_OPTIMAL', color: 'text-emerald-600', icon: ShieldCheck, bg: 'bg-emerald-50' };
  }, [summary]);

  const survivalRunway = useMemo(() => {
    if (!summary || !summary.monthly_expenses) return 0;
    return Math.floor(summary.total_saved / summary.monthly_expenses * 10) / 10;
  }, [summary]);

  return (
    <div className="space-y-12 lg:space-y-16 pb-40 italic">
      {/* ── Dynamic Command Header ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <span className="bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full leading-none italic">OS_ACTIVE</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 leading-none italic">GLOBAL_SYNCHRONY</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-950 uppercase leading-none italic">Welcome, {firstName}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 leading-none ml-1 italic">Real-time systemic oversight for Charith.</p>
        </div>
        <div className={`flex items-center gap-6 lg:gap-8 p-6 lg:p-8 ${healthStatus.bg} rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl transition-all duration-700 min-w-full lg:min-w-[360px] group border border-slate-100`}>
           <div className={`p-4 lg:p-6 bg-white rounded-full ${healthStatus.color} shadow-lg transition-transform group-hover:scale-110`}><healthStatus.icon size={28} className={healthStatus.label === 'SYNCHRONIZING...' ? 'animate-spin' : 'animate-pulse'} /></div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-60 leading-none italic">Cluster Health Index</p>
              <p className={`text-xl lg:text-2xl font-black tracking-tighter uppercase ${healthStatus.color} italic`}>{healthStatus.label}</p>
           </div>
        </div>
      </div>

      {/* ── BURDEN OVERLAY (New features) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-0 lg:px-2">
         {/* Interest Leakage Pulse */}
         <LeakagePulse hourlyRate={summary?.hourly_leakage} />
         
         {/* Survival Mode (Runway) */}
         <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 h-full min-h-[180px]">
            <div className="flex items-center justify-between mb-8">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:rotate-12 transition-all"><LifeBuoy size={24} /></div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-right italic leading-none">Survival Runway</p>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] text-right mt-1 italic leading-none">Months until core depletion</p>
               </div>
            </div>
            <div className="relative py-4">
               <p className="text-6xl font-black text-slate-950 tracking-tighter italic leading-none group-hover:scale-105 transition-all origin-left">{survivalRunway} <span className="text-xl text-slate-300">Mo</span></p>
            </div>
            <div className="flex items-center gap-4 pt-6 border-t border-slate-50 mt-4">
               <div className="h-1.5 flex-1 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${Math.min(survivalRunway * 10, 100)}%` }}></div>
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${survivalRunway < 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {survivalRunway < 3 ? 'CRITICAL_RUNWAY' : 'RESERVE_STABLE'}
               </span>
            </div>
         </div>
      </div>

      {/* ── Primary Flux Matrix ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? [1,2,3].map(i => <div key={i} className="h-[180px] bg-white border border-slate-100 rounded-[2rem] animate-pulse"/>) : (
          <>
            <MetricCard title="Consolidated Inbound" amount={summary?.total_income || summary?.monthly_income || 0} subtitle="Cycle Fluidity" icon={TrendingUp} colorClass="text-emerald-500" gradientClass="bg-emerald-50" />
            <MetricCard title="Allocated Leakage" amount={summary?.total_expenses || summary?.monthly_expenses || 0} subtitle="Consumption Index" icon={TrendingDown} colorClass="text-rose-500" gradientClass="bg-rose-50" />
            <MetricCard title="Capital Momentum" amount={summary?.net_cash_flow || 0} subtitle="Surge Retention" icon={Zap} colorClass="text-amber-500" gradientClass="bg-amber-50" />
          </>
        )}
      </div>

      {/* ── Subscription Leakage Analytics (New) ────────────────────────── */}
      {summary?.total_subscriptions > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3 bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-12 group hover:shadow-2xl transition-all duration-700">
              <div className="p-6 bg-slate-950 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl group-hover:rotate-12 transition-all">
                 <RefreshCw size={32} className="animate-spin-slow" />
              </div>
              <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic">Recurring Leakage Pulse</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 </div>
                 <h3 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">Subscription Overhead</h3>
                 <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed italic opacity-60">The system has identified {formatCurrency(summary.total_subscriptions)} in monthly recurring leakage, including multi-currency USD nodes converted at 300 LKR/USD.</p>
              </div>
              <div className="text-right shrink-0">
                 <p className="text-4xl font-black text-slate-950 tracking-tighter italic">{formatCurrency(summary.total_subscriptions)}</p>
                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mt-2 italic leading-none">Monthly Systemic Drain</p>
              </div>
           </div>
           <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100 flex flex-col justify-center items-center text-center gap-4 hover:bg-blue-50/50 transition-all cursor-pointer" onClick={() => window.location.href='/subscriptions'}>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.5em] italic">Manage Nodes</p>
              <ChevronRight size={24} className="text-slate-200" />
           </div>
        </div>
      )}

      {/* ── System Integrity Layer ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         {/* Asset Resilience */}
         <div className="bg-slate-950 rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-12 shadow-4xl text-white relative overflow-hidden group min-h-[420px] lg:min-h-[480px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-all duration-[5000ms]"></div>
            <div className="relative z-10 space-y-10 lg:space-y-12">
               <div className="flex items-center gap-6">
                  <div className="p-4 lg:p-5 bg-white/5 border border-white/10 rounded-[2rem] group-hover:bg-blue-600/10 transition-all"><ShieldCheck className="text-blue-500" size={28} /></div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none mb-2 italic">Asset Resilience</h3>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-60 italic">Consolidation Matrix</p>
                  </div>
               </div>
               <div className="bg-white/5 rounded-[2rem] lg:rounded-[2.5rem] border border-white/10 p-10 lg:p-12 flex flex-col justify-between min-h-[220px] lg:min-h-[240px] group transition-all duration-700 hover:bg-emerald-500/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <p className="text-[10px] lg:text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] leading-none italic">Savings Core</p>
                     <TrendingUp size={18} className="text-emerald-500 opacity-40" />
                  </div>
                  <div>
                     <p className="text-5xl lg:text-6xl font-black tracking-tighter leading-none group-hover:scale-105 transition-all origin-left mb-6 italic">{formatCurrency(summary?.total_saved || 0)}</p>
                     <div className="flex flex-wrap items-center gap-4 text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-40 italic">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> LIQUID_VERIFIED</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="relative z-10 flex items-center justify-between pt-10 border-t border-white/5">
                <p className="hidden sm:block text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-40 italic">System Optimization Persistent</p>
                <button onClick={() => window.location.href = '/savings'} className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl border border-white/5 transition-all font-black uppercase tracking-[0.4em] text-[8px] lg:text-[9px] shadow-2xl flex items-center gap-3 italic">
                  Launch Matrix <ChevronRight size={14}/>
                </button>
            </div>
         </div>

         {/* Flux Trace */}
         <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-12 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-700 flex flex-col min-h-[420px] lg:min-h-[480px]">
            <div className="flex items-center justify-between mb-12 px-2">
               <div className="space-y-2">
                  <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-slate-950 leading-none italic">Flux Trace</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none opacity-60 italic">System Log Trace</p>
               </div>
               <div className="p-3 lg:p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-blue-500 transition-all"><History size={24} /></div>
            </div>
             <div className="space-y-6 flex-1">
               {isLoading ? [1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-50 rounded-[1.5rem] animate-pulse"/>) : (
                  summary?.recent_transactions?.map((txn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all duration-500 group/row cursor-default border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-5">
                           <div className={`p-2 lg:p-3 rounded-xl shadow-sm ${txn.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                              {txn.type === 'income' ? <ArrowUpRight size={16}/> : <ArrowDownRight size={22}/>}
                           </div>
                           <div>
                              <p className="text-md lg:text-lg font-black text-slate-950 tracking-tighter uppercase leading-none mb-1 group/row:text-blue-600 transition-colors italic">{txn.description}</p>
                              <p className="text-[8px] lg:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none italic">{txn.date}</p>
                           </div>
                        </div>
                        <p className={`text-lg lg:text-xl font-black tracking-tighter italic ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </p>
                    </div>
                  )) || (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 italic font-black uppercase tracking-widest text-[10px]">No recent flux anomalies recorded</div>
                  )
               )}
            </div>
            <button className="mt-8 py-5 w-full bg-slate-50 hover:bg-slate-100 rounded-[1.5rem] text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 italic leading-none">
               <Maximize2 size={14} className="opacity-40" /> Expand Historical Trace
            </button>
         </div>
      </div>

      {/* ── Analytical Integrity Footer ────────────────────────────────────── */}
      <div className="text-center mt-20 bg-white/40 backdrop-blur-xl py-12 rounded-[3.5rem] border border-slate-100 group hover:shadow-2xl transition-all duration-1000 relative overflow-hidden mx-2 lg:mx-0">
         <div className="flex items-center justify-center gap-8 lg:gap-16 mb-10">
            <Clock size={28} className="text-slate-200 group-hover:text-blue-600 transition-all duration-700" />
            <div className="p-8 lg:p-10 bg-slate-950 rounded-[2rem] lg:rounded-[2.5rem] shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000">
               <Zap size={44} className="text-white" />
            </div>
            <Target size={28} className="text-slate-200 group-hover:text-emerald-500 transition-all duration-700" />
         </div>
         <p className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] lg:tracking-[0.8em] px-8 lg:px-12 leading-loose opacity-40 group-hover:opacity-100 transition-all duration-700 max-w-5xl mx-auto italic">© 2026 {user?.name}. Vantage Strategy v4.2 -- Operational Logic Persistent.</p>
         <div className="mt-8 flex flex-wrap justify-center gap-6 lg:gap-10 opacity-20 group-hover:opacity-100 transition-all duration-1000">
            <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.6em] lg:tracking-[0.8em] text-blue-600 italic">SYSTEM_v4.2.1</span>
            <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.6em] lg:tracking-[0.8em] text-emerald-600 italic">AES_GCM_SYNC</span>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
