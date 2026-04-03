import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Metric Card Component ───────────────────────────────────────────────────
const MetricCard = ({ title, amount, subtitle, icon: Icon, colorClass, gradientClass, type }) => {
  return (
    <div className={`relative group overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 p-8 flex flex-col justify-between min-h-[200px]`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl ${gradientClass} transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm border border-slate-50`}>
            <Icon className={colorClass} size={22} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 italic">Vantage Engine</span>
            <span className="text-[9px] font-black text-slate-950 uppercase tracking-[0.2em] italic">Active Sync</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3 italic opacity-60 ml-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none group-hover:scale-105 transition-transform duration-500 origin-left">
            {formatCurrency(amount)}
          </h3>
        </div>
      </div>
      <div className="relative z-10 pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-40">{subtitle}</p>
        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

// ─── Dashboard Main ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Member';

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
  });

  return (
    <div className="space-y-20 pb-40 max-w-7xl mx-auto">
      {/* Dynamic Command Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <span className="bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full italic">Status: Online</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic underline-offset-8 decoration-1 decoration-slate-200">Terminal ID: LKR-001</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Welcome, {firstName}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 leading-none italic ml-1">Real-time systemic oversight for {user?.name}.</p>
        </div>
        <div className="flex items-center gap-8 p-6 bg-white border border-slate-100 rounded-[3rem] shadow-2xl hover:shadow-3xl transition-all duration-700 min-w-[320px] group">
           <div className="p-6 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform"><Activity size={28} className="animate-pulse" /></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic opacity-60 leading-none">Cluster Health</p>
              <p className="text-2xl font-black text-slate-950 italic tracking-tighter">METRIC_OPTIMAL</p>
           </div>
        </div>
      </div>

      {/* Primary Flux Matrix Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-[220px] bg-white border border-slate-100 rounded-[2rem] animate-pulse"/>)
        ) : (
          <>
            <MetricCard 
              title="Consolidated Inbound" 
              amount={summary?.monthly_income || 0} 
              type="inflow"
              subtitle="Current Epoch Flux"
              icon={TrendingUp} 
              colorClass="text-emerald-500"
              gradientClass="bg-emerald-50"
            />
            <MetricCard 
              title="Allocated Leakage" 
              amount={summary?.monthly_expenses || 0} 
              type="outflow"
              subtitle="Operational Consumption"
              icon={TrendingDown} 
              colorClass="text-rose-500"
              gradientClass="bg-rose-50"
            />
            <MetricCard 
              title="Capital Momentum" 
              amount={summary?.net_cash_flow || 0} 
              type="delta"
              subtitle="Systemic Surge Capacity"
              icon={Zap} 
              colorClass="text-amber-500"
              gradientClass="bg-amber-50"
            />
          </>
        )}
      </div>

      {/* System Integrity & Trace Layer */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12 px-6">
         {/* Asset Resilience Stats */}
         <div className="xl:col-span-3 bg-slate-950 rounded-[2rem] p-12 shadow-4xl text-white relative overflow-hidden group hover:scale-[1.01] transition-transform duration-1000 min-h-[450px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none group-hover:scale-125 transition-all duration-[5000ms]"></div>
            <div className="relative z-10 space-y-10">
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl group-hover:bg-blue-600/10 transition-colors duration-500"><ShieldCheck className="text-blue-500" size={36} /></div>
                  <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-3">Asset Resilience</h3>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Consolidated Net Resilience Matrix</p>
                  </div>
               </div>
               <div className="bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 p-10 flex flex-col justify-between min-h-[220px] group transition-all duration-700 hover:bg-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000 blur-3xl"></div>
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-white text-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/5 group-hover:rotate-12 transition-transform border border-emerald-50"><TrendingUp size={24} /></div>
                     <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter italic">Savings Core</h3>
                  </div>
               </div>
               <div>
                  <p className="text-5xl font-black tracking-tighter italic leading-none drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 origin-left">{formatCurrency(summary?.total_saved || 0)}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-8 italic leading-none opacity-60">Verified Liquid & Future Assets Locked</p>
               </div>
            </div>
            </div>
            <div className="relative z-10 flex items-center justify-between pt-12 border-t border-white/5">
                <div className="flex items-center gap-6">
                   <div className="flex -space-x-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center font-black text-[10px] italic shadow-2xl">A</div>
                      <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-slate-950 flex items-center justify-center font-black text-[10px] italic shadow-2xl">R</div>
                      <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center font-black text-[10px] italic shadow-2xl">Z</div>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60">Multi-Channel Flux Optimization Persistent</p>
                </div>
                 <button 
                  onClick={() => window.location.href = '/debt-advisor'}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-[2rem] border border-white/5 transition-all font-black uppercase tracking-[0.5em] text-[10px] italic shadow-2xl group/btn">
                   Launch Matrix <ArrowUpRight size={18} className="group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-all duration-500"/>
                 </button>
            </div>
         </div>

         {/* Protocol Trace Timeline (Recent) */}
         <div className="xl:col-span-2 bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 group hover:shadow-3xl transition-all duration-700 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors duration-500 shadow-inner group-hover:shadow-blue-500/10 border border-transparent group-hover:border-blue-100"><History size={28} className="text-slate-300 group-hover:text-blue-500 transition-colors" /></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-950 leading-none">Flux Trace</h3>
               </div>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none opacity-60">System Log v4.2</span>
            </div>

            <div className="space-y-10 flex-1">
               {isLoading ? (
                 [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse"/>)
               ) : summary?.recent_income?.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full gap-8 opacity-20">
                    <CheckCircle2 size={64} className="text-slate-300" />
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">No detected flux anomalies</p>
                 </div>
               ) : (
                 summary?.recent_income?.slice(0, 4).map((txn, idx) => (
                   <div key={idx} className="flex items-center justify-between group/item p-2 hover:bg-slate-50/50 rounded-[1.5rem] transition-all duration-500 cursor-default">
                       <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl shadow-sm transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-12 ${txn.type === 'income' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                             {txn.type === 'income' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-950 tracking-tighter italic uppercase leading-none mb-2 group-hover/item:text-blue-600 transition-colors">{txn.description}</p>
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic leading-none">{txn.category} ── {txn.date}</p>
                          </div>
                       </div>
                       <p className={`text-xl font-black italic tracking-tighter leading-none group-hover/item:scale-110 transition-transform duration-500 ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                       </p>
                    </div>
                 ))
               )}
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50 text-center">
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic hover:text-blue-600 transition-colors group/btn flex items-center justify-center gap-4 mx-auto">
                 <Maximize2 size={16} className="opacity-40 group-hover/btn:scale-125 transition-transform" />
                 Open Historical Trace Ledger
               </button>
            </div>
         </div>
      </div>

      {/* Analytical Integrity Footer */}
      <div className="text-center mt-20 bg-white/40 backdrop-blur-xl py-16 rounded-[4rem] border border-slate-100/50 mx-6 group hover:shadow-2xl transition-all duration-1000 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-rose-600 opacity-20 group-hover:opacity-60 transition-all duration-1000"></div>
         <div className="flex items-center justify-center gap-16 mb-10 relative z-10">
            <Clock size={36} className="text-slate-200 group-hover:text-blue-600 transition-all duration-700 hover:rotate-12" />
            <div className="p-10 bg-slate-950 rounded-[2.5rem] shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000 cursor-pointer">
               <Zap size={56} className="text-white" />
            </div>
            <Target size={36} className="text-slate-200 group-hover:text-emerald-500 transition-all duration-700 hover:-rotate-12" />
         </div>
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic px-12 leading-[2.5] relative z-10 max-w-5xl mx-auto opacity-40 group-hover:opacity-100 transition-opacity duration-700">© 2026 {user?.name}. Vantage Strategy v4.2 -- Operational Logic Persistent -- All Assets Verified.</p>
         <div className="mt-8 flex justify-center gap-8 opacity-20 group-hover:opacity-100 transition-all duration-1000">
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-blue-600">SYSTEM_HEALTH: NOMINAL</span>
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-emerald-600">SYNC_STATUS: ACTIVE</span>
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-amber-600">VANTAGE_v4.2</span>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
