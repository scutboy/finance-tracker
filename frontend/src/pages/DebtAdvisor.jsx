import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import {
  Lightbulb, TrendingDown, Trophy, Zap, Clock, DollarSign,
  ShieldCheck, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const monthToDate = (m) => {
  const now = new Date();
  now.setMonth(now.getMonth() + m);
  return now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const InsightCard = ({ icon, text, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  };
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-4 ${colors[color]}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <p className="text-sm font-medium leading-relaxed">{text}</p>
    </div>
  );
};

const StatBox = ({ label, value, sub, color = 'text-gray-900' }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-2">Month {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }}/>
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-bold text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Debt Advisor Page ────────────────────────────────────────────────────────
const DebtAdvisor = () => {
  const [extra, setExtra] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);

  const extraVal = parseFloat(extra) || 0;

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const { data: proj, isLoading, refetch } = useQuery({
    queryKey: ['debtProjection', extraVal],
    queryFn: async () => (await api.get(`/debts/projection?extra=${extraVal}`)).data,
    enabled: true,
  });

  const activeDebts = debts?.filter(d => d.status !== 'Paid Off') ?? [];

  if (activeDebts.length === 0) return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Debt Advisor</h1>
        <p className="text-gray-500 mt-1">Your personalised path to financial freedom.</p>
      </div>
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 text-center flex flex-col items-center gap-4">
        <Trophy size={56} className="text-green-400"/>
        <h2 className="text-2xl font-bold text-gray-900">You're Debt Free! 🎉</h2>
        <p className="text-gray-500 max-w-sm">No active debt accounts found. Keep it up!</p>
      </div>
    </div>
  );

  const chart = proj?.chart ?? [];
  const displayChart = showFullTable ? chart : chart.filter(p => p.month % 3 === 0 || p.month === 1);

  // Decide whether avalanche or snowball is better for this user
  const preferAvalanche = (proj?.savings_vs_snowball ?? 0) >= 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Debt Advisor</h1>
        <p className="text-gray-500 mt-1">Active calculations and your personalised path to financial freedom.</p>
      </div>

      {/* ── Extra Payment What-If ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-lg font-bold mb-1">💡 What If Calculator</h2>
        <p className="text-blue-200 text-sm mb-4">See how much sooner you can be debt-free by paying extra each month.</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-blue-300 text-sm font-medium">Rs</span>
            <input
              type="number" min="0" step="1000"
              value={extra}
              onChange={e => { setExtra(e.target.value); setSubmitted(false); }}
              placeholder="Extra monthly payment"
              className="w-full bg-white/15 border border-white/30 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <button
            onClick={() => { setSubmitted(true); refetch(); }}
            className="bg-white text-blue-700 font-bold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition text-sm shadow-sm"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* ── Strategy Comparison ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"/>)}
        </div>
      ) : proj && (
        <>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Strategy Comparison</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`rounded-xl p-5 border-2 shadow-sm ${preferAvalanche ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {preferAvalanche && <ShieldCheck size={16} className="text-blue-600"/>}
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Avalanche Strategy</p>
                  {preferAvalanche && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">RECOMMENDED</span>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Months</p>
                    <p className="text-2xl font-extrabold text-gray-900">{proj.avalanche_months}</p>
                    <p className="text-xs text-gray-400">{(proj.avalanche_months/12).toFixed(1)}y</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Interest</p>
                    <p className="text-xl font-extrabold text-red-600">{formatCurrency(proj.avalanche_interest)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">Highest rate first → minimises total interest paid</p>
              </div>

              <div className={`rounded-xl p-5 border-2 shadow-sm ${!preferAvalanche ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {!preferAvalanche && <ShieldCheck size={16} className="text-purple-600"/>}
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Snowball Strategy</p>
                  {!preferAvalanche && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">RECOMMENDED</span>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Months</p>
                    <p className="text-2xl font-extrabold text-gray-900">{proj.snowball_months}</p>
                    <p className="text-xs text-gray-400">{(proj.snowball_months/12).toFixed(1)}y</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Interest</p>
                    <p className="text-xl font-extrabold text-red-600">{formatCurrency(proj.snowball_interest)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">Smallest balance first → quick wins, boosts motivation</p>
              </div>

              {(submitted && extraVal > 0) && (
                <div className="rounded-xl p-5 border-2 border-green-400 bg-green-50 shadow-sm col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-green-600"/>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">With +{formatCurrency(extraVal)}/mo</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Debt Free In</p>
                      <p className="text-2xl font-extrabold text-green-700">{proj.avalanche_months}</p>
                      <p className="text-xs text-gray-400">months</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Interest Saved</p>
                      <p className="text-xl font-extrabold text-green-700">+{formatCurrency(Math.max(0, proj.savings_vs_snowball))}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 font-medium mt-2 border-t border-green-200 pt-2">
                    {proj.months_saved_vs_snowball > 0 ? `${proj.months_saved_vs_snowball} months faster than snowball!` : 'Every extra rupee counts!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Payoff Timeline Chart ───────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Balance Over Time — Both Strategies</h2>
              <span className="text-xs text-gray-400">{chart.length > 0 ? `${chart.length} months shown` : ''}</span>
            </div>
            {chart.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">Add debts to see the projection.</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart}>
                    <defs>
                      <linearGradient id="av" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickFormatter={v => `Mo ${v}`}/>
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8}
                      formatter={v => v === 'avalanche' ? 'Avalanche' : 'Snowball'}/>
                    <Area type="monotone" dataKey="avalanche" stroke="#3b82f6" strokeWidth={2.5}
                      fill="url(#av)" name="avalanche"/>
                    <Area type="monotone" dataKey="snowball" stroke="#8b5cf6" strokeWidth={2.5}
                      fill="url(#sw)" name="snowball" strokeDasharray="5 5"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Payoff Order ────────────────────────────────────────────────── */}
          {proj.payoff_order?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Avalanche Payoff Order</h2>
              <div className="space-y-3">
                {proj.payoff_order.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      idx === 0 ? 'bg-blue-600 text-white' : idx === 1 ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>{idx + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={12}/>
                          <span>Month {item.paid_month} ({monthToDate(item.paid_month)})</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-400' : 'bg-gray-300'}`}
                          style={{ width: `${Math.min((item.paid_month / (proj.avalanche_months || 1)) * 100, 100)}%` }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI Insights ─────────────────────────────────────────────────── */}
          {proj.insights?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-500"/>
                Personalised Insights
              </h2>
              {proj.insights.map((tip, i) => {
                const colors = ['blue', 'green', 'amber', 'blue', 'green'];
                const icons = [
                  <TrendingDown size={18}/>,
                  <Trophy size={18}/>,
                  <Zap size={18}/>,
                  <AlertTriangle size={18}/>,
                  <DollarSign size={18}/>,
                ];
                return <InsightCard key={i} icon={icons[i % icons.length]} text={tip} color={colors[i % colors.length]}/>;
              })}
            </div>
          )}

          {/* ── Current Debts at a Glance ────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4">Your Active Accounts</h2>
            <div className="space-y-3">
              {activeDebts.map(debt => {
                const monthlyInterest = (debt.balance * debt.interest_rate / 100 / 12);
                return (
                  <div key={debt.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{debt.name}</p>
                      <p className="text-xs text-gray-400">{debt.type} · {debt.interest_rate}% APR</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(debt.balance)}</p>
                      <p className="text-xs text-red-500 font-medium">+{formatCurrency(monthlyInterest)}/mo interest</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-sm font-bold text-gray-700">Total Outstanding</p>
              <p className="text-xl font-extrabold text-red-600">{formatCurrency(proj.total_debt)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DebtAdvisor;
