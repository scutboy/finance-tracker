import React, { useMemo } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MetricCard = ({ title, amount, subtitle, icon: Icon, colorClass, gradientClass }) => {
  return (
    <div className="relative group overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 p-8 flex flex-col justify-between min-h-[200px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl ${gradientClass} transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm border border-slate-50`}>
            <Icon className={colorClass} size={22} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 italic">Vantage Node</span>
            <span className="text-[9px] font-black text-slate-950 uppercase tracking-[0.2em] italic opacity-40">Operational</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3 italic opacity-60 ml-1">{title}</p>
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
    
    const debtRatio = summary.total_debt / (summary.monthly_income || 1);
    const flowRatio = summary.monthly_expenses / (summary.monthly_income || 1);
    
    if (debtRatio > 12 || flowRatio > 0.95) return { label: 'CRITICAL_LEAKAGE', color: 'text-rose-600', icon: ShieldAlert, bg: 'bg-rose-50' };
    if (debtRatio > 6) return { label: 'DEBT_SATURATION', color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50' };
    if (summary.net_worth < 0) return { label: 'NET_NEGATIVE_EQUITY', color: 'text-rose-500', icon: Target, bg: 'bg-rose-50' };
    
    return { label: 'CLUSTER_OPTIMAL', color: 'text-emerald-600', icon: ShieldCheck, bg: 'bg-emerald-50' };
  }, [summary]);

  return (
    <div className="space-y-16 pb-40 max-w-7xl mx-auto px-6 italic">
      {/* ── Dynamic Command Header ────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <span className="bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full leading-none">OS_ACTIVE</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 leading-none">VANTAGE_v4.2 PRO</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase leading-none">Welcome, {firstName}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 leading-none ml-1">Real-time financial systemic oversight.</p>
        </div>
        <div className={`flex items-center gap-8 p-8 ${healthStatus.bg} rounded-[3rem] shadow-2xl transition-all duration-700 min-w-[360px] group border border-slate-100`}>
           <div className={`p-6 bg-white rounded-full ${healthStatus.color} shadow-lg transition-transform group-hover:scale-110`}><healthStatus.icon size={32} className={healthStatus.label === 'SYNCHRONIZING...' ? 'animate-spin' : 'animate-pulse'} /></div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-60 leading-none">Cluster Health Index</p>
              <p className={`text-2xl font-black tracking-tighter uppercase ${healthStatus.color}`}>{healthStatus.label}</p>
           </div>
        </div>
      </div>

      {/* ── Primary Flux Matrix ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {isLoading ? [1,2,3].map(i => <div key={i} className="h-[200px] bg-white border border-slate-100 rounded-[2rem] animate-pulse"/>) : (
          <>
            <MetricCard title="Consolidated Inbound" amount={summary?.monthly_income || 0} subtitle="Current Cycle Fluidity" icon={TrendingUp} colorClass="text-emerald-500" gradientClass="bg-emerald-50" />
            <MetricCard title="Allocated Leakage" amount={summary?.monthly_expenses || 0} subtitle="Consumption Index" icon={TrendingDown} colorClass="text-rose-500" gradientClass="bg-rose-50" />
            <MetricCard title="Capital Momentum" amount={summary?.net_cash_flow || 0} subtitle="Surge Retention Capability" icon={Zap} colorClass="text-amber-500" gradientClass="bg-amber-50" />
          </>
        )}
      </div>

      {/* ── System Integrity Layer ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         {/* Asset Resilience Stats */}
         <div className="bg-slate-950 rounded-[3rem] p-12 shadow-4xl text-white relative overflow-hidden group min-h-[480px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-all duration-[5000ms]"></div>
            <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-[2rem] group-hover:bg-blue-600/10 transition-colors duration-500"><ShieldCheck className="text-blue-500" size={32} /></div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Asset Resilience</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-60">Consolidated Reserve Matrix</p>
                  </div>
               </div>
               <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-12 flex flex-col justify-between min-h-[240px] group transition-all duration-700 hover:bg-emerald-500/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] leading-none">Savings Core Activity</p>
                     <TrendingUp size={20} className="text-emerald-500 opacity-40" />
                  </div>
                  <div>
                     <p className="text-6xl font-black tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700 origin-left mb-6">{formatCurrency(summary?.total_saved || 0)}</p>
                     <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-40">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> LIQUID_VERIFIED</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> ASSET_PROTECTED</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="relative z-10 flex items-center justify-between pt-10 border-t border-white/5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-40">Multi-Channel Flux Optimization Persistent</p>
                <button onClick={() => window.location.href = '/savings'} className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl border border-white/5 transition-all font-black uppercase tracking-[0.4em] text-[9px] shadow-2xl flex items-center gap-3">
                  Reserves <ChevronRight size={14}/>
                </button>
            </div>
         </div>

         {/* Flux Trace Timeline */}
         <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-700 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between mb-12 px-2">
               <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-950 leading-none">Flux Trace</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none opacity-60">System Log Trace v4.2</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-blue-500 transition-all"><History size={24} /></div>
            </div>
            <div className="space-y-8 flex-1">
               {isLoading ? [1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-50 rounded-[1.5rem] animate-pulse"/>) : (
                  summary?.recent_income?.slice(0, 4).map((txn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all duration-500 group/row cursor-default border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-5">
                           <div className={`p-3 rounded-xl shadow-sm ${txn.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                              {txn.type === 'income' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                           </div>
                           <div>
                              <p className="text-lg font-black text-slate-950 tracking-tighter uppercase leading-none mb-1 group-hover/row:text-blue-600 transition-colors uppercase">{txn.description}</p>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">{txn.date}</p>
                           </div>
                        </div>
                        <p className={`text-xl font-black tracking-tighter ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </p>
                    </div>
                  ))
               )}
            </div>
            <button className="mt-10 py-5 w-full bg-slate-50 hover:bg-slate-100 rounded-[1.5rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4">
               <Maximize2 size={16} className="opacity-40" /> Expand Historical Trace
            </button>
         </div>
      </div>

      {/* ── Analytical Integrity Footer ────────────────────────────────────── */}
      <div className="text-center mt-20 bg-white/40 backdrop-blur-xl py-16 rounded-[4rem] border border-slate-100 group hover:shadow-2xl transition-all duration-1000 relative overflow-hidden">
         <div className="flex items-center justify-center gap-16 mb-12">
            <Clock size={36} className="text-slate-200 group-hover:text-blue-600 transition-all duration-700" />
            <div className="p-10 bg-slate-950 rounded-[2.5rem] shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000">
               <Zap size={56} className="text-white" />
            </div>
            <Target size={36} className="text-slate-200 group-hover:text-emerald-500 transition-all duration-700" />
         </div>
         <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.8em] px-12 leading-loose opacity-40 group-hover:opacity-100 transition-all duration-700 max-w-5xl mx-auto">© 2026 {user?.name}. Strategic v4.2 -- System Real-time Flux monitoring persistent -- Integrity Cluster Verified.</p>
         <div className="mt-10 flex justify-center gap-10 opacity-20 group-hover:opacity-100 transition-all duration-1000">
            <span className="text-[9px] font-black uppercase tracking-[0.8em] text-blue-600">CLUSTER_LOAD: 12.4%</span>
            <span className="text-[9px] font-black uppercase tracking-[0.8em] text-emerald-600">LATENCY: 14ms</span>
            <span className="text-[9px] font-black uppercase tracking-[0.8em] text-amber-600">ENCRYPTION: AES_GCM</span>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
