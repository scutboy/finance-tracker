import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Wallet, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-xl"></div>
        <div className="space-y-2 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Vantage Link Active</p>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Synchronizing Financial Matrix...</p>
        </div>
      </div>
    );
  }

  const {
    net_worth = 0, monthly_income = 0, monthly_expenses = 0,
    total_debt = 0, total_saved = 0, net_cash_flow = 0
  } = summary || {};

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full shadow-lg shadow-blue-600/20">Telemetry Live</span>
             <span className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em] opacity-50 italic">Node ID: {user?.id?.toString().slice(0,8) || 'V-STABLE'}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
            Welcome, <span className="text-blue-600 font-black">{user?.name?.split(' ')[0] || 'Vantage Member'}</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] opacity-60">Strategic Wealth Protocol Established.</p>
        </div>

        <div className={`px-8 py-5 rounded-[2.5rem] border-2 bg-white flex items-center gap-6 transition-all shadow-sm ${
           net_cash_flow >= 0 ? 'border-emerald-100 shadow-emerald-600/5' : 'border-rose-100 shadow-rose-600/5'
        }`}>
           <div className={`p-3.5 rounded-2xl ${net_cash_flow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Activity size={24} className={net_cash_flow > 0 ? 'animate-pulse' : ''} />
           </div>
           <div>
              <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 leading-none">Matrix Health</p>
              <p className={`text-sm font-black uppercase tracking-widest italic ${net_cash_flow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {net_cash_flow >= 0 ? 'Optimal Growth' : 'Deficit Risk Detected'}
              </p>
           </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Net Worth */}
        <div className="group relative bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl group-hover:rotate-6 transition-transform"><ShieldCheck size={28}/></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic group-hover:text-blue-400 transition-colors">Composite asset base</span>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 relative z-10">Net Worth Matrix</p>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 group-hover:scale-[1.02] transition-transform relative z-10 italic">
            {formatCurrency(net_worth)}
          </h2>
        </div>

        {/* Monthly Income */}
        <div className="group relative bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:rotate-12 transition-transform"><TrendingUp size={28}/></div>
            <div className="text-right">
              <span className="text-[9px] font-black text-emerald-600 italic block mb-1">Cycle Inflow Verified</span>
              <ArrowUpRight size={14} className="ml-auto text-emerald-300" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 relative z-10">Monthly Flux Cache</p>
          <h2 className="text-4xl font-black tracking-tighter text-emerald-600 group-hover:translate-x-1 transition-transform relative z-10 italic">
            {formatCurrency(monthly_income)}
          </h2>
        </div>

        {/* Monthly Expenses */}
        <div className="group relative bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-rose-600/5 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl group-hover:-rotate-12 transition-transform"><TrendingDown size={28}/></div>
            <div className="text-right">
              <span className="text-[9px] font-black text-rose-600 italic block mb-1">Burn Trace Active</span>
              <ArrowDownRight size={14} className="ml-auto text-rose-300" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 relative z-10">Monthly Outbound Log</p>
          <h2 className="text-4xl font-black tracking-tighter text-rose-600 group-hover:-translate-x-1 transition-transform relative z-10 italic">
            {formatCurrency(monthly_expenses)}
          </h2>
        </div>

        {/* Current Debt Snipe Target */}
        <div className="group relative bg-slate-950 p-10 rounded-[3rem] shadow-2xl transition-all duration-500 overflow-hidden col-span-1 lg:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-500/10 opacity-50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-all duration-[3000ms]"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
             <div className="flex items-center gap-8">
               <div className="p-6 bg-white/5 rounded-3xl backdrop-blur-3xl border border-white/10 text-white shadow-2xl group-hover:scale-110 transition-transform">
                 <Target size={40} className="text-rose-400" />
               </div>
               <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-[0.4em] px-2.5 py-1 rounded-full">Primary Threat</span>
                    <span className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] italic">Vantage Anchor Point</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-white italic uppercase mb-2">Consolidated Liabilities</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60">High APR Protocol Exposure Detected.</p>
               </div>
             </div>
             
             <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mb-3 italic">Total Exposure</p>
                <p className="text-5xl font-black tracking-tighter text-rose-500 group-hover:scale-110 transition-transform italic">
                  {formatCurrency(total_debt)}
                </p>
             </div>
          </div>
        </div>

        {/* Savings Cache */}
        <div className="group relative bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="p-4 bg-slate-50 text-slate-900 rounded-3xl group-hover:rotate-6 transition-transform"><Wallet size={28}/></div>
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm">
              Vault Secure
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 relative z-10">Resilience Buffer State</p>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 group-hover:scale-[1.02] transition-transform relative z-10 italic">
            {formatCurrency(total_saved)}
          </h2>
        </div>
      </div>
      
      {/* Dynamic Status Bar */}
      <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200/60 rounded-[3rem] text-center group cursor-default">
         <div className="flex items-center justify-center gap-6 opacity-30 group-hover:opacity-100 transition-opacity">
            <Zap size={16} className="text-blue-600 animate-pulse" />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Vantage Wealth Matrix Version 3.1.0 // Protocol Optimized</p>
            <Zap size={16} className="text-blue-600 animate-pulse" />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
