import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { Wallet, Landmark, TrendingDown, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight, Target, ShieldCheck } from 'lucide-react';
import Confetti from 'react-confetti';

const COLORS = ['#A32D2D', '#854F0B', '#185FA5', '#3B6D11', '#4A5568'];

const MetricCard = ({ title, amount, icon, isNegative = false, subtitle = null }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3.5 rounded-xl ${isNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <h3 className={`text-xl font-extrabold truncate ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>{amount}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="h-8 bg-gray-200 rounded w-1/4"/>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"/>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-100 rounded-xl"/>
        <div className="h-64 bg-gray-100 rounded-xl"/>
      </div>
    </div>
  );

  if (isError || !summary) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <p className="font-medium">Could not load dashboard data.</p>
      <p className="text-sm mt-1">Make sure the backend is running and try refreshing.</p>
    </div>
  );

  const {
    net_worth = 0, total_debt = 0, total_saved = 0,
    monthly_expenses = 0, monthly_income = 0, net_cash_flow = 0,
    cash_flow = [], savings_progress = [], debt_breakdown = [],
    recent_income = [], target_debt = null
  } = summary;

  const chartData = [...cash_flow].reverse();

  return (
    <div className="space-y-8">
      {/* ── Spotlight: Next Debt Target ───────────────────────────────────────── */}
      {target_debt && (
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 shadow-lg shadow-red-200/50 flex flex-col md:flex-row items-start md:items-center justify-between text-white">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Target size={32} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-red-100 uppercase tracking-wider text-xs mb-1">Current Target: Priority Wipeout</p>
              <h2 className="text-3xl font-black mb-1">Destroy the {target_debt.name}</h2>
              <p className="text-red-50 max-w-md text-sm leading-relaxed">
                Based on your Snowball strategy, pay the minimums on everything else and throw every extra Rupee at this balance.
              </p>
            </div>
          </div>
          <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm text-center md:text-right">
            <p className="text-xs text-red-100 uppercase font-semibold">Remaining Balance</p>
            <p className="text-2xl font-black">{formatCurrency(target_debt.balance)}</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your complete financial overview.</p>
      </div>

      {/* ── 6 Metric Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard title="Net Worth" amount={formatCurrency(net_worth)}
          icon={<Wallet size={22}/>} isNegative={net_worth < 0}
          subtitle="Savings minus total debt"/>
        <MetricCard title="Monthly Income" amount={formatCurrency(monthly_income)}
          icon={<TrendingUp size={22}/>}
          subtitle="Income this month"/>
        <MetricCard title="Monthly Expenses" amount={formatCurrency(monthly_expenses)}
          icon={<TrendingDown size={22}/>} isNegative={true}
          subtitle="Spent this month"/>
        <div className={`bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow ${net_cash_flow >= 0 ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`p-3.5 rounded-xl ${net_cash_flow >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {net_cash_flow >= 0 ? <ArrowUpRight size={22}/> : <ArrowDownRight size={22}/>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Cash Flow</p>
            <h3 className={`text-xl font-extrabold ${net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {net_cash_flow >= 0 ? '+' : ''}{formatCurrency(net_cash_flow)}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Income - Expenses</p>
          </div>
        </div>
        <MetricCard title="Total Saved" amount={formatCurrency(total_saved)}
          icon={<PiggyBank size={22}/>}
          subtitle="Across all goals"/>
        <MetricCard title="Total Debt" amount={formatCurrency(total_debt)}
          icon={<Landmark size={22}/>} isNegative={true}
          subtitle="Active balances"/>
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-base font-bold text-gray-900 mb-5">Income vs Expenses — Last 6 Months</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={v => `Rs ${(v/1000).toFixed(0)}k`}/>
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expenses']}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: 12 }}/>
                <Legend formatter={v => v === 'income' ? 'Income' : 'Expenses'} iconType="circle" iconSize={8}/>
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="income"/>
                <Bar dataKey="spent" fill="#f87171" radius={[4, 4, 0, 0]} name="spent"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt Breakdown Donut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-2">Debt Breakdown</h3>
          {debt_breakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">No active debts 🎉</div>
          ) : (
            <div className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={debt_breakdown} innerRadius={68} outerRadius={90} paddingAngle={3}
                    dataKey="balance" nameKey="name">
                    {debt_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: 12 }}/>
                  <Legend iconType="circle" iconSize={8} formatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span className="text-xs font-medium text-gray-400">Total</span>
                <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(total_debt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Savings Progress ───────────────────────────────────────────────────── */}
      {savings_progress.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-5">Savings Goals Progress</h3>
          <div className="space-y-7">
            {savings_progress.map(goal => {
              const isEmergency = goal.name.toLowerCase().includes('emergency');
              const oneMonth = isEmergency ? monthly_expenses : 0;
              const threeMonths = isEmergency ? monthly_expenses * 3 : 0;
              const sixMonths = isEmergency ? monthly_expenses * 6 : 0;

              return (
              <div key={goal.name}>
                <div className="flex justify-between items-end mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{goal.name}</span>
                    {isEmergency && <ShieldCheck size={16} className="text-green-500"/>}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-green-600">{formatCurrency(goal.current)}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-500">{formatCurrency(goal.target)}</span>
                  </div>
                </div>
                
                {/* Dynamically adjust max bar scale to show realistic milestones if Emergency */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
                  <div className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${goal.percentage}%` }}/>
                    
                  {/* Dynamic Milestones based on Monthly Expense */}
                  {isEmergency && monthly_expenses > 0 && (
                    <>
                      {(oneMonth / goal.target) * 100 < 90 && (
                        <div className="absolute top-0 bottom-0 border-l-2 border-white/60" style={{ left: `${(oneMonth / goal.target) * 100}%` }} title="1 Month Buffer"></div>
                      )}
                      {(threeMonths / goal.target) * 100 < 90 && (
                        <div className="absolute top-0 bottom-0 border-l-2 border-white/60" style={{ left: `${(threeMonths / goal.target) * 100}%` }} title="3 Months Buffer"></div>
                      )}
                      {(sixMonths / goal.target) * 100 < 90 && (
                        <div className="absolute top-0 bottom-0 border-l-2 border-blue-400" style={{ left: `${(sixMonths / goal.target) * 100}%` }} title="6 Months Secure"></div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  {isEmergency && monthly_expenses > 0 ? (
                    <div className="flex gap-4 text-[10px] text-gray-400 font-medium">
                      <span>1M: {formatCurrency(oneMonth)}</span>
                      <span>3M: {formatCurrency(threeMonths)}</span>
                      <span className="text-blue-500/80">6M Target: {formatCurrency(sixMonths)}</span>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-xs text-gray-400 font-medium">{goal.percentage.toFixed(1)}%</p>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* ── Recent Income ──────────────────────────────────────────────────────── */}
      {recent_income.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">Recent Income</h3>
          <div className="space-y-3">
            {recent_income.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{entry.description}</p>
                  <p className="text-xs text-gray-400">{entry.date} · {entry.category}</p>
                </div>
                <span className="font-bold text-green-600 text-sm">+ {formatCurrency(entry.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
