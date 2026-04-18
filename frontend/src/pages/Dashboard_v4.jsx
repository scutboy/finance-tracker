import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  Maximize2,
  AlertTriangle,
  ShieldAlert,
  Flame,
  LifeBuoy,
  RefreshCw,
  Wallet,
  History,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeakagePulse = ({ hourlyRate }) => {
  return (
    <div className="bg-rose-950 rounded-[2rem] p-8 text-white relative overflow-hidden group border border-rose-500/10 h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-[60px] group-hover:scale-150 transition-all duration-[4000ms]"></div>
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="p-3 bg-white/5 rounded-2xl text-rose-500"><Flame size={20} className="animate-pulse" /></div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Debt Warning</span>
      </div>
      <div className="relative z-10 space-y-2">
        <p className="text-[12px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-2">Interest Costing You</p>
        <p className="text-4xl font-black tracking-tighter mb-4">{formatCurrency(hourlyRate || 0)} / hr</p>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mt-8">Pay down highest-rate debt to stop this loss</p>
    </div>
  );
};

const MetricCard = ({ title, amount, subtitle, icon: Icon, colorClass, gradientClass }) => {
  return (
    <div className="relative group overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8 flex flex-col justify-between min-h-[180px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${gradientClass} transition-all duration-300 group-hover:scale-110 shadow-sm border border-slate-50`}>
            <Icon className={colorClass} size={22} />
          </div>
        </div>
        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-2 leading-none">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors duration-300">
          {formatCurrency(amount)}
        </h3>
      </div>
      <div className="relative z-10 pt-4 mt-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">{subtitle}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Member';

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    retry: 1,
  });

  const healthStatus = useMemo(() => {
    if (!summary) return { label: 'Loading...', color: 'text-slate-500', icon: Activity, bg: 'bg-slate-100' };
    const income = summary.total_income || summary.monthly_income || 1;
    const expenses = summary.total_expenses || summary.monthly_expenses || 0;
    const debt = summary.total_debt || 0;
    
    const debtRatio = debt / income;
    const flowRatio = expenses / income;
    
    if (debtRatio > 12 || flowRatio > 0.95) return { label: '🔴 Spending Exceeds Income', color: 'text-rose-600', icon: ShieldAlert, bg: 'bg-rose-50' };
    if (debtRatio > 6) return { label: '⚠️ High Debt Load', color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50' };
    if (summary.net_worth < 0) return { label: 'Net Negative Equity', color: 'text-rose-500', icon: Target, bg: 'bg-rose-50' };
    return { label: '✅ On Track', color: 'text-emerald-600', icon: ShieldCheck, bg: 'bg-emerald-50' };
  }, [summary]);

  const survivalRunway = useMemo(() => {
    if (!summary || !summary.monthly_expenses) return 0;
    return Math.floor((summary.emergency_balance || 0) / summary.monthly_expenses * 10) / 10;
  }, [summary]);
  
  const cycleDates = useMemo(() => {
    const now = new Date();
    let start, end;
    if (now.getDate() >= 25) {
        start = new Date(now.getFullYear(), now.getMonth(), 25);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 24);
    } else {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 25);
        end = new Date(now.getFullYear(), now.getMonth(), 24);
    }
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-GB', opts)} - ${end.toLocaleDateString('en-GB', opts)}`;
  }, []);

  if (isLoading) {
      return <div className="p-20 text-center animate-pulse text-slate-400">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-12 lg:space-y-10 pb-40">
      {isError && (
        <div className="mx-6 p-8 bg-rose-50 text-rose-700 rounded-3xl border border-rose-200 shadow-sm">
           <div className="flex items-center gap-4 mb-2">
              <ShieldAlert size={28} />
              <h2 className="text-xl font-bold tracking-tight">Could not load dashboard</h2>
           </div>
           <p className="text-sm opacity-80 mb-6">Check your connection and try again.</p>
           <button onClick={() => window.location.reload()} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">Retry</button>
        </div>
      )}

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <p className="text-slate-500 font-bold text-sm uppercase tracking-wider italic">Cycle: {cycleDates}</p>
          <div className="flex items-center gap-6">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none italic uppercase">Good morning, {firstName}</h1>
            <Link to="/sms-inbox" className="hidden lg:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 italic">
                <MessageSquare size={14} />
                Ingest SMS
            </Link>
          </div>
        </div>
        <div className={`flex items-center gap-6 p-6 lg:p-6 ${healthStatus.bg} rounded-3xl min-w-full lg:min-w-[320px] transition-all`}>
           <div className={`p-4 bg-white rounded-full ${healthStatus.color} shadow-sm`}><healthStatus.icon size={28} /></div>
           <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 italic">Financial Health</p>
              <p className={`text-xl font-black tracking-tight ${healthStatus.color} italic`}>{healthStatus.label}</p>
           </div>
        </div>
      </div>

      {/* ── Primary Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Income This Cycle" amount={summary?.total_income || summary?.monthly_income || 0} subtitle="Total Inbound" icon={TrendingUp} colorClass="text-emerald-500" gradientClass="bg-emerald-50" />
        <MetricCard title="Spent This Cycle" amount={summary?.total_expenses || summary?.monthly_expenses || 0} subtitle="Total Outbound" icon={TrendingDown} colorClass="text-rose-500" gradientClass="bg-rose-50" />
        <MetricCard title="Net Cash Flow" amount={summary?.net_cash_flow || 0} subtitle="Surplus / Deficit" icon={Wallet} colorClass="text-blue-500" gradientClass="bg-blue-50" />
      </div>

      {/* ── Cycle Analytical Breakdown (Audit Trail) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Audit */}
        <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
          <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp size={18}/></div>
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest leading-none italic">Income Composition</h3>
            </div>
            <p className="text-emerald-700 font-black tracking-tighter text-xl italic">{formatCurrency(summary?.total_income || summary?.monthly_income || 0)}</p>
          </div>
          <div className="overflow-y-auto p-2">
            {summary?.cycle_income_transactions?.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight block">{t.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">{t.date} • {t.category}</p>
                </div>
                <p className="font-black text-emerald-600 tracking-tight whitespace-nowrap pl-4">+{formatCurrency(t.amount)}</p>
              </div>
            )) || <p className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No income detected this cycle.</p>}
          </div>
        </div>

        {/* Expense Audit */}
        <div className="bg-white rounded-[2rem] border border-rose-100 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
          <div className="bg-rose-50 p-6 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><TrendingDown size={18}/></div>
              <h3 className="text-sm font-black text-rose-950 uppercase tracking-widest leading-none italic">Expense Composition</h3>
            </div>
            <p className="text-rose-700 font-black tracking-tighter text-xl italic">{formatCurrency(summary?.total_expenses || summary?.monthly_expenses || 0)}</p>
          </div>
          <div className="overflow-y-auto p-2">
            {summary?.cycle_expense_transactions?.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight block">{t.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">{t.date} • {t.category}</p>
                </div>
                <p className="font-black text-rose-600 tracking-tight whitespace-nowrap pl-4">-{formatCurrency(t.amount)}</p>
              </div>
            )) || <p className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No expenses detected this cycle.</p>}
          </div>
        </div>
      </div>

      {/* ── Credit Card Balance Strip ─────────────────────────── */}
      {summary?.debt_breakdown?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.debt_breakdown.map((d, i) => {
            const palette = ['bg-red-50','bg-blue-50','bg-amber-50','bg-purple-50'];
            const text    = ['text-red-600','text-blue-600','text-amber-600','text-purple-600'];
            
            const cardTxns = summary?.cycle_expense_transactions?.filter(t => t.account === d.name) || [];
            const cardTotalSpent = cardTxns.reduce((s, t) => s + t.amount, 0);

            return (
              <div key={i} className={`${palette[i]} rounded-[2rem] p-5 border border-slate-100 flex flex-col`}>
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 truncate">
                    {d.name.replace(' Credit Card','').replace(' Card','')}
                  </p>
                  <p className={`text-xl font-black tracking-tight ${text[i]}`}>
                    {formatCurrency(d.balance)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Outstanding</p>
                </div>
                
                {/* Embedded Transaction List */}
                <div className="mt-2 bg-white/60 rounded-xl p-3 flex-1 flex flex-col text-[10px]">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-black/5">
                     <span className="font-black uppercase tracking-widest text-slate-500">Cycle Spend</span>
                     <span className={`font-black ${text[i]}`}>{formatCurrency(cardTotalSpent)}</span>
                  </div>
                  <div className="overflow-y-auto max-h-[140px] space-y-2 pr-1 custom-scrollbar">
                     {cardTxns.length > 0 ? cardTxns.map((t, idx) => (
                       <div key={idx} className="flex justify-between items-start gap-2">
                         <span className="font-bold text-slate-700 leading-tight truncate" title={t.description}>{t.description}</span>
                         <span className="font-black text-slate-900 shrink-0">{formatCurrency(t.amount)}</span>
                       </div>
                     )) : (
                       <p className="text-center font-bold text-slate-400 py-6 italic uppercase tracking-widest text-[9px]">No activity</p>
                     )}
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      )}

      {/* ── 6-Month Cash Flow Chart ─────────────────────────────── */}
      {summary?.cash_flow && summary.cash_flow.length > 0 && (
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={20}/> 6-Month Cash Flow</h3>
             <ResponsiveContainer width="100%" height={280}>
               <BarChart data={summary.cash_flow}>
                 <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip formatter={v => formatCurrency(v)} cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'}} />
                 <Legend wrapperStyle={{paddingTop: '20px'}}/>
                 <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                 <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
               </BarChart>
             </ResponsiveContainer>
         </div>
      )}

      {/* ── Leakage + Runway Row (full width, naturally balanced) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeakagePulse hourlyRate={summary?.hourly_leakage} />
          
          <div className="bg-white rounded-[2rem] p-8 border border-emerald-100 bg-emerald-50/30 shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><LifeBuoy size={24} /></div>
              <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Emergency Fund Coverage</p>
              </div>
              </div>
              <div className="relative py-2">
              <p className="text-5xl font-black text-emerald-950 tracking-tight">{survivalRunway} <span className="text-xl text-emerald-600">Months</span></p>
              </div>
              <p className="text-sm font-medium text-emerald-700 mt-2">Saved: {formatCurrency(summary?.emergency_balance || 0)}</p>
          </div>
      </div>

      {/* ── Focus Debt + Budget (now symmetrical) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
        {/* Left Side: Focus Debt */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Focus Debt</h3>
          {summary?.target_debt ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">{summary.target_debt.name}</p>
                    <p className="text-2xl font-black text-rose-600 tracking-tight">{formatCurrency(summary.target_debt.balance)}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2 bg-rose-50 inline-block px-2 py-1 rounded-md">@{summary.target_debt.interest_rate}% APR</p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-black uppercase text-rose-500 tracking-wider">Pay Extra Here</span>
                 </div>
              </div>
          ) : (
              <p className="text-slate-400 text-sm">No active debts flagged for payoff.</p>
          )}
        </div>

        {/* Right Side: Budget Status */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Target size={20}/> Budget This Month</h3>
            {summary?.budget_status && summary.budget_status.length > 0 ? (
               <div className="space-y-6">
                 {summary.budget_status.map((b, i) => {
                    const isOver = b.pct > 100;
                    const isWarn = b.pct >= 85 && !isOver;
                    const color = isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-blue-500';
                    return (
                        <div key={i}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-slate-700 text-sm">{b.name}</span>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${isOver ? 'text-rose-600' : 'text-slate-600'}`}>{formatCurrency(b.actual)}</span>
                                    <span className="text-xs text-slate-400 ml-1">/ {formatCurrency(b.budget)}</span>
                                </div>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(b.pct, 100)}%` }}></div>
                            </div>
                            <div className="mt-1 text-right">
                                <span className={`text-[10px] font-bold ${isOver ? 'text-rose-600' : 'text-slate-400'}`}>{b.pct}% Used {isOver && '⚠'}</span>
                            </div>
                        </div>
                    );
                 })}
               </div>
            ) : (
               <p className="text-slate-400 text-sm">No active budget categories set for this month.</p>
            )}
        </div>
      </div>

      {/* ── Transaction Trace ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><History size={20}/> Recent Transactions</h3>
            <button onClick={() => window.location.href='/expenses'} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ChevronRight size={16} /></button>
        </div>
        <div className="space-y-4">
            {summary?.recent_transactions?.map((txn, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shadow-sm ${txn.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {txn.type === 'income' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-800 tracking-tight">{txn.description}</p>
                            <p className="text-xs font-medium text-slate-400 tracking-wide">{txn.date} &bull; {txn.category}</p>
                        </div>
                    </div>
                    <p className={`text-lg font-black tracking-tight ${txn.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                </div>
            )) || (
                <div className="py-12 text-center text-slate-400 font-medium text-sm">No recent transactions recorded.</div>
            )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
