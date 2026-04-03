import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, TrendingUp, TrendingDown, Target, Wallet, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: summary, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Node Trace...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 border-2 border-rose-100 bg-rose-50 rounded-3xl text-rose-600 text-center">
        <AlertTriangle className="mx-auto mb-4" size={40} />
        <h2 className="text-lg font-bold uppercase mb-2">Sync failure</h2>
        <p className="text-xs">{error?.message || 'Matrix link dropped'}</p>
      </div>
    );
  }

  const {
    net_worth = 0, monthly_income = 0, monthly_expenses = 0,
    total_debt = 0, total_saved = 0
  } = summary || {};

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 italic uppercase">
          Welcome, <span className="text-blue-600">{user?.name || 'Vantage Member'}</span>
        </h1>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em]">Protocol Active // Stable State</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Net Worth Card */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShieldCheck size={24}/></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Asset Logic</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Net Worth</p>
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900">{formatCurrency(net_worth)}</h2>
        </div>

        {/* Monthly Income */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24}/></div>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">+ Live Flux</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Inbound</p>
          <h2 className="text-3xl font-bold tracking-tighter text-emerald-600">{formatCurrency(monthly_income)}</h2>
        </div>

        {/* Monthly Expenses */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown size={24}/></div>
            <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">- Burn Trace</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Outbound</p>
          <h2 className="text-3xl font-bold tracking-tighter text-rose-600">{formatCurrency(monthly_expenses)}</h2>
        </div>

        {/* Current Debt */}
        <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-white">
              <Target size={24} />
            </div>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Active Exposure</span>
          </div>
          <p className="text-[10px] text-white/50 font-bold uppercase mb-1">Consolidated Liability</p>
          <h2 className="text-3xl font-bold tracking-tighter text-rose-400 italic">{formatCurrency(total_debt)}</h2>
        </div>

        {/* Savings */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Wallet size={24}/></div>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Buffer Status</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Savings</p>
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900">{formatCurrency(total_saved)}</h2>
        </div>
      </div>
      
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">High Dynamic Range components offline for initialization</p>
      </div>
    </div>
  );
};

export default Dashboard;
