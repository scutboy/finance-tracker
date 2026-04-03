import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    retry: 1
  });

  if (isLoading) return <div style={{ padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>SYNCING MATRIX...</div>;
  if (isError) return <div style={{ padding: '40px', color: 'red' }}>LINK FAILURE</div>;

  const {
    net_worth = 0, monthly_income = 0, monthly_expenses = 0,
    total_debt = 0, total_saved = 0
  } = summary || {};

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic text-slate-900 leading-none">
          {user?.name || 'Vantage Member'} // <span className="text-blue-600">Active</span>
        </h1>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] mt-2">Protocol Live State</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Net Worth</p>
          <h2 className="text-3xl font-black text-slate-900 italic">{formatCurrency(net_worth)}</h2>
        </div>
        <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Total Savings</p>
          <h2 className="text-3xl font-black text-slate-900 italic">{formatCurrency(total_saved)}</h2>
        </div>
        <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Income Cache</p>
          <h2 className="text-3xl font-black text-emerald-600 italic">{formatCurrency(monthly_income)}</h2>
        </div>
        <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Expenditure Trace</p>
          <h2 className="text-3xl font-black text-rose-600 italic">{formatCurrency(monthly_expenses)}</h2>
        </div>
        <div className="p-10 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl col-span-1 md:col-span-2">
          <p className="text-[10px] text-white/40 font-bold uppercase mb-2">System Liability Target</p>
          <h2 className="text-4xl font-black text-rose-400 italic">{formatCurrency(total_debt)}</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
