import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Wallet, Landmark, TrendingDown, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight, Target, ShieldCheck, HeartPulse, Zap, X } from 'lucide-react';
import Confetti from 'react-confetti';
import { format, parseISO } from 'date-fns';

const COLORS = ['#A32D2D', '#854F0B', '#185FA5', '#3B6D11', '#4A5568'];

const MetricCard = ({ title, amount, icon, isNegative = false, subtitle = null, isNetFlow = false }) => (
  <div className={`p-6 rounded-3xl shadow-sm border flex items-center gap-5 transition-all hover:shadow-lg bg-white group ${
    isNetFlow 
      ? (parseFloat(amount.replace(/[^0-9.-]+/g,"")) >= 0 ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-rose-50/30 border-rose-100/50')
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
      <h3 className={`text-2xl font-bold truncate text-slate-900 tracking-tight ${
        isNegative ? 'text-rose-600' : (isNetFlow ? (parseFloat(amount.replace(/[^0-9.-]+/g,"")) >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-900')
      }`}>{amount}</h3>
      {subtitle && <p className="text-[9px] text-slate-400 mt-1 font-medium uppercase tracking-wider opacity-60 italic">{subtitle}</p>}
    </div>
  </div>
);

const SweeperModal = ({ surplus, onClose, targetDebt, emergencyGoal }) => {
  const debtAlloc = Math.round(surplus * 0.4);
  const savingsAlloc = Math.round(surplus * 0.6);

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/50">
        <div className="bg-vantage-950 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"><X size={24}/></button>
          <div className="bg-white/10 w-20 h-20 rounded-2xl rotate-6 flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
            <Zap size={32} className="text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-2">Realignment Protocol</h2>
          <p className="text-blue-200/60 font-medium uppercase tracking-widest text-[9px]">Unallocated flux: {formatCurrency(surplus)}</p>
        </div>
        <div className="p-10 space-y-8">
          <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-widest">
            Optimal Allocation Strategy:
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl"><Target size={20}/></div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Debt Sniper (40%)</p>
                <p className="text-sm font-bold text-slate-900">{targetDebt?.name || 'Primary Liability'}</p>
              </div>
              <p className="font-bold text-rose-600 text-xl">{formatCurrency(debtAlloc)}</p>
            </div>
            <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="bg-emerald-50 text-emerald-500 p-3 rounded-xl"><ShieldCheck size={20}/></div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Future Fund (60%)</p>
                <p className="text-sm font-bold text-slate-900">Emergency Cache</p>
              </div>
              <p className="font-bold text-emerald-600 text-xl">{formatCurrency(savingsAlloc)}</p>
            </div>
          </div>
          <div className="pt-4">
            <button onClick={onClose} className="w-full py-5 bg-vantage-950 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-lg active:scale-[0.98]">
              Commit Realignment
            </button>
          </div>
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
    <div className="space-y-10 animate-pulse">
      <div className="h-12 bg-slate-100 rounded-2xl w-1/3"/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-slate-50 rounded-3xl"/>)}
      </div>
    </div>
  );

  if (isError || !summary) return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
      <HeartPulse size={64} className="opacity-20 mb-6 animate-pulse" />
      <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 mb-2">Sync Offline</h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Satellite link synchronizing...</p>
    </div>
  );

  const {
    net_worth = 0, total_debt = 0, total_saved = 0,
    monthly_expenses = 0, monthly_income = 0, net_cash_flow = 0,
    cash_flow = [], savings_progress = [], debt_breakdown = [],
    recent_income = [], target_debt = null
  } = summary;

  const chartData = [...cash_flow].reverse();
  const hasSurplus = net_cash_flow > 1000;

  return (
    <div className="space-y-10">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border border-blue-100">TELEMETRY LIVE</span>
            <span className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em] opacity-50">CYCLE TRACE ACTIVE</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 uppercase italic">
            Welcome, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Member'}</span>
          </h1>
          <p className="text-slate-400 mt-3 font-medium text-xs uppercase tracking-widest opacity-60">Precision wealth tracking established.</p>
        </div>

        <div className={`px-6 py-4 rounded-2xl border flex items-center gap-4 transition-all ${
          net_cash_flow >= 0 
            ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-900' 
            : 'bg-rose-50/30 border-rose-100/50 text-rose-900'
        }`}>
          <div className={`p-2.5 rounded-xl ${net_cash_flow >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            <HeartPulse size={20} className={net_cash_flow > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest opacity-50 leading-none mb-1">Status</p>
            <p className="text-sm font-bold uppercase tracking-tight">{net_cash_flow >= 0 ? 'Healthy' : 'Deficit Risk'}</p>
          </div>
        </div>
      </div>

      {/* ── Action Banners ────────────────────────────────────────────────────── */}
      {(hasSurplus || target_debt) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {hasSurplus && (
            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-3xl p-8 flex items-center justify-between gap-6 transition-all hover:bg-emerald-50">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm"><Zap size={32}/></div>
                <div>
                  <p className="text-[9px] font-bold text-emerald-800/60 uppercase tracking-widest mb-1.5">Unallocated Liquidity</p>
                  <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">{formatCurrency(net_cash_flow)} Found</h2>
                </div>
              </div>
              <button onClick={() => setShowSweeper(true)} className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                Execute
              </button>
            </div>
          )}

          {target_debt && (
            <div className="bg-vantage-950 text-white rounded-3xl p-8 flex items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <Target size={32} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-rose-400/60 uppercase tracking-widest mb-1.5">Priority Target</p>
                  <h2 className="text-2xl font-bold tracking-tight italic">{target_debt.name}</h2>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Exposure</p>
                <p className="text-xl font-bold text-rose-400">{formatCurrency(target_debt.balance)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Metric Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Net Worth" amount={formatCurrency(net_worth)}
          icon={<ArrowUpRight size={22}/>} isNegative={net_worth < 0}
          subtitle="Total Asset Logic"/>
        <MetricCard title="Inbound Flux" amount={formatCurrency(monthly_income)}
          icon={<TrendingUp size={22}/>}
          subtitle="Monthly Cycle Inflow"/>
        <MetricCard title="Expenditure" amount={formatCurrency(monthly_expenses)}
          icon={<TrendingDown size={22}/>} isNegative={true}
          subtitle="Cycle Consumption Trace"/>
        <MetricCard title="Net Delta" amount={`${net_cash_flow >= 0 ? '+' : ''}${formatCurrency(net_cash_flow)}`}
          icon={net_cash_flow >= 0 ? <ArrowUpRight size={22}/> : <ArrowDownRight size={22}/>}
          isNetFlow={true}
          subtitle="Strategic Alignment Flux"/>
        <MetricCard title="Vault Cache" amount={formatCurrency(total_saved)}
          icon={<ShieldCheck size={22}/>}
          subtitle="Emergency Liquidity"/>
        <MetricCard title="Liability" amount={formatCurrency(total_debt)}
          icon={<Landmark size={22}/>} isNegative={true}
          subtitle="Consolidated Exposure"/>
      </div>

      {/* ── Charts & Lists ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Trajectory</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">6-Month Flux Audit</p>
            </div>
            <TrendingUp size={20} className="text-slate-300" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="spent" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-10">
             <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Node Logs</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Latest Inbound Events</p>
            </div>
            <ArrowUpRight className="text-emerald-500" size={24} />
          </div>
          <div className="space-y-4">
            {recent_income.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40">
                 <Wallet size={48}/>
                 <p className="font-bold uppercase tracking-widest text-[9px]">No Logs Detected</p>
              </div>
            ) : (
              recent_income.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white text-emerald-500 p-2.5 rounded-xl shadow-sm"><ArrowUpRight size={18}/></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm italic tracking-tight">{entry.description}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{format(parseISO(entry.date), 'dd MMM')} • {entry.category}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 text-xl italic tracking-tighter">+{formatCurrency(entry.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Resilience Target ────────────────────────────────────────────── */}
      {savings_progress.length > 0 && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight italic">Resilience Profile</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Emergency Cache Optimization</p>
            </div>
            <ShieldCheck size={28} className="text-blue-500 opacity-30" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {savings_progress.map(goal => (
              <div key={goal.name} className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="flex gap-4">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-slate-900"><PiggyBank size={20}/></div>
                    <div>
                      <span className="font-bold text-slate-900 text-lg tracking-tight italic">{goal.name}</span>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vault Progress</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-emerald-600 text-2xl italic tracking-tighter">{formatCurrency(goal.current)}</p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-50 rounded-2xl h-6 p-1 overflow-hidden relative border border-slate-100">
                  <div className="bg-emerald-500 h-full rounded-xl transition-all duration-1000 shadow-sm"
                    style={{ width: `${goal.percentage}%` }}>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400 italic">Target: {formatCurrency(goal.target)}</span>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">{goal.percentage.toFixed(1)}% Efficiency</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showSweeper && (
        <SweeperModal 
          surplus={net_cash_flow} 
          onClose={() => setShowSweeper(false)} 
          targetDebt={target_debt}
          emergencyGoal={savings_progress.find(g => g.name.toLowerCase().includes('emergency'))}
        />
      )}
    </div>
  );
};

export default Dashboard;
