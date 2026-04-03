import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Wallet, Landmark, TrendingDown, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight, Target, ShieldCheck, HeartPulse, Zap, X, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const COLORS = ['#A32D2D', '#854F0B', '#185FA5', '#3B6D11', '#4A5568'];

// Helper to safely parse localized currency strings back to numbers for logic
const safeParseAmount = (amt) => {
  if (typeof amt !== 'string') return 0;
  const cleaned = amt.replace(/[^0-9.-]+/g, "");
  return parseFloat(cleaned) || 0;
};

const MetricCard = ({ title, amount, icon, isNegative = false, subtitle = null, isNetFlow = false }) => {
  const numericAmount = isNetFlow ? safeParseAmount(amount) : 0;
  const isPositiveFlux = numericAmount >= 0;

  return (
    <div className={`p-6 rounded-3xl shadow-sm border flex items-center gap-5 transition-all hover:shadow-lg bg-white group ${
      isNetFlow 
        ? (isPositiveFlux ? 'bg-emerald-50/20 border-emerald-100/50' : 'bg-rose-50/20 border-rose-100/50')
        : 'border-slate-200/50'
    }`}>
      <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 ${
        isNegative 
          ? 'bg-rose-50 text-rose-600' 
          : 'bg-emerald-50 text-emerald-600'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-2xl font-bold truncate tracking-tight ${
          isNegative ? 'text-rose-600' : (isNetFlow ? (isPositiveFlux ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-900')
        }`}>
          {amount || "Rs 0"}
        </h3>
        {subtitle && <p className="text-[9px] text-slate-400 mt-1 font-medium uppercase tracking-wider opacity-60 italic">{subtitle}</p>}
      </div>
    </div>
  );
};

const SweeperModal = ({ surplus, onClose, targetDebt }) => {
  const surplusVal = surplus || 0;
  const debtAlloc = Math.round(surplusVal * 0.4);
  const savingsAlloc = Math.round(surplusVal * 0.6);

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/50">
        <div className="bg-slate-900 p-10 text-white text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"><X size={24}/></button>
          <div className="bg-white/10 w-20 h-20 rounded-2xl rotate-6 flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
            <Zap size={32} className="text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-2">Flux Management</h2>
          <p className="text-blue-200/60 font-medium uppercase tracking-widest text-[9px]">Unallocated Surge: {formatCurrency(surplusVal)}</p>
        </div>
        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl"><Target size={20}/></div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Debt Neutralization (40%)</p>
                <p className="text-sm font-bold text-slate-900">{targetDebt?.name || 'Primary Liability Node'}</p>
              </div>
              <p className="font-bold text-rose-600 text-xl">{formatCurrency(debtAlloc)}</p>
            </div>
            <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="bg-emerald-50 text-emerald-500 p-3 rounded-xl"><ShieldCheck size={20}/></div>
              <div className="flex-1 flex flex-col">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Resilience Buffering (60%)</p>
                <p className="text-sm font-bold text-slate-900">Reserve Cache</p>
              </div>
              <p className="font-bold text-emerald-600 text-xl">{formatCurrency(savingsAlloc)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all">
            Execute Allocation
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [showSweeper, setShowSweeper] = React.useState(false);
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic">Synchronizing Node Data...</p>
      </div>
    </div>
  );

  if (isError || !summary) return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <AlertCircle size={64} className="text-rose-200 mb-6" />
      <h2 className="text-xl font-bold uppercase tracking-tight italic text-slate-900">Sync Interrupted</h2>
      <p className="text-slate-500 mt-2 text-xs uppercase tracking-widest leading-loose">The satellite link to the financial matrix was lost. Retrying...</p>
      <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">Re-initiate Link</button>
    </div>
  );

  const {
    net_worth = 0, total_debt = 0, total_saved = 0,
    monthly_expenses = 0, monthly_income = 0, net_cash_flow = 0,
    cash_flow = [], savings_progress = [], recent_income = [], target_debt = null
  } = summary;

  const chartData = Array.isArray(cash_flow) ? [...cash_flow].reverse().slice(0, 6) : [];
  const hasSurplus = net_cash_flow > 1000;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 uppercase italic">
          Welcome, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Member'}</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium text-xs uppercase tracking-widest opacity-60">Wealth telemetry online.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Net Worth" amount={formatCurrency(net_worth)} icon={<ArrowUpRight size={22}/>} isNegative={net_worth < 0} subtitle="Asset Logic" />
        <MetricCard title="Monthly Inflow" amount={formatCurrency(monthly_income)} icon={<TrendingUp size={22}/>} subtitle="Current Cycle" />
        <MetricCard title="Monthly Outflow" amount={formatCurrency(monthly_expenses)} icon={<TrendingDown size={22}/>} isNegative={true} subtitle="Cycle Burn" />
        <MetricCard title="Net Flow" amount={`${net_cash_flow >= 0 ? '+' : ''}${formatCurrency(net_cash_flow)}`} icon={net_cash_flow >= 0 ? <ArrowUpRight size={22}/> : <ArrowDownRight size={22}/>} isNetFlow={true} subtitle="Strategic Alignment" />
        <MetricCard title="Total Savings" amount={formatCurrency(total_saved)} icon={<ShieldCheck size={22}/>} subtitle="Reserve Cache" />
        <MetricCard title="Total Liability" amount={formatCurrency(total_debt)} icon={<Landmark size={22}/>} isNegative={true} subtitle="Current Exposure" />
      </div>

      {/* Charts / Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic mb-10">Flux Trajectory</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="spent" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic mb-8">Node Events</h3>
          <div className="space-y-4">
            {recent_income.slice(0, 4).map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white text-emerald-500 p-2 rounded-lg shadow-sm font-bold"><TrendingUp size={16}/></div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm tracking-tight italic">{entry.description}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{entry.category}</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">{formatCurrency(entry.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSweeper && (
        <SweeperModal surplus={net_cash_flow} onClose={() => setShowSweeper(false)} targetDebt={target_debt}/>
      )}
    </div>
  );
};

export default Dashboard;
