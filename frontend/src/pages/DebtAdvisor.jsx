import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import {
  Trophy, Zap, Target, Brain, TrendingDown, AlertTriangle, CheckCircle,
  Flame, Clock, DollarSign, BarChart2, ArrowRight, Info, Shield, Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const monthToDate = (m) => {
  const now = new Date();
  now.setMonth(now.getMonth() + m);
  return now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

// ── Installment Plans Data (hardcoded from bank statements) ─────────────────
const INSTALLMENT_PLANS = [
  { card: 'NTB AMEX',    description: 'Unity Systems Solutions',       monthly: 9441.67,  remaining: 8,  total_remaining: 66091.65, color: '#6366f1' },
  { card: 'NTB AMEX',    description: 'Luxury X (Plan A)',              monthly: 14333.33, remaining: 7,  total_remaining: 86000.02, color: '#8b5cf6' },
  { card: 'Sampath Card',description: 'Abans Elite 20M Appliance',     monthly: 2999.95,  remaining: 19, total_remaining: 56999.05, color: '#f59e0b' },
  { card: 'Sampath Card',description: 'Luxury X 24M (final stretch)',   monthly: 19583.33, remaining: 2,  total_remaining: 39166.66, color: '#10b981' },
  { card: 'NDB Card',    description: 'Bara Auto International',        monthly: 2998.00,  remaining: 0, total_remaining: 0, color: '#3b82f6' },
  { card: 'NDB Card',    description: 'Sell-X Computers',               monthly: 2717.00,  remaining: 11, total_remaining: 29887.00, color: '#06b6d4' },
];

const CARD_COLORS = {
  'BOC Credit Card': '#ef4444',
  'NDB Card': '#3b82f6',
  'Sampath Card': '#f59e0b',
  'NTB AMEX': '#8b5cf6',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-5 italic ring-1 ring-black/5">
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-4 opacity-70">Month {label}</p>
      <div className="space-y-3">
        {payload.map(p => (
          <div key={p.name} className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }}/>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{p.name === 'avalanche' ? 'Avalanche' : 'Snowball'}</span>
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tighter italic">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const InsightCard = ({ icon, text, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    red: 'bg-rose-50 border-rose-100 text-rose-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  };
  return (
    <div className={`flex items-start gap-4 border rounded-2xl p-5 transition-all hover:scale-[1.01] hover:shadow-md ${colors[color]}`}>
      <div className="shrink-0 p-2 bg-white/60 rounded-xl shadow-sm">{icon}</div>
      <p className="text-[12px] uppercase tracking-tight italic opacity-90 leading-relaxed font-bold">{text}</p>
    </div>
  );
};

// ── Accountant-grade payoff strategy ─────────────────────────────────────────
const computeStrategy = (debts, extraMonthly) => {
  if (!debts?.length) return null;

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayments = debts.reduce((s, d) => s + d.min_payment, 0);
  const totalBudget = totalMinPayments + extraMonthly;

  // Avalanche (highest rate first) — mathematically optimal
  const avalancheOrder = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
  // Snowball (lowest balance first) — psychologically motivating
  const snowballOrder = [...debts].sort((a, b) => a.balance - b.balance);

  const simulate = (order) => {
    const balances = Object.fromEntries(order.map(d => [d.id, d.balance]));
    const rates = Object.fromEntries(order.map(d => [d.id, d.interest_rate / 100 / 12]));
    const mins = Object.fromEntries(order.map(d => [d.id, d.min_payment]));
    let month = 0;
    let totalInterest = 0;
    const payoffMonths = {};

    while (Object.values(balances).some(b => b > 0.01) && month < 360) {
      month++;
      let remaining = totalBudget;

      // Pay minimums first
      for (const d of order) {
        if (balances[d.id] <= 0) continue;
        const interest = balances[d.id] * rates[d.id];
        totalInterest += interest;
        const minPay = Math.min(mins[d.id], balances[d.id] + interest);
        balances[d.id] = Math.max(0, balances[d.id] + interest - minPay);
        remaining -= minPay;
        if (balances[d.id] <= 0 && !payoffMonths[d.id]) payoffMonths[d.id] = month;
      }

      // Throw extra at focus target (first non-zero)
      for (const d of order) {
        if (balances[d.id] <= 0) continue;
        const extra = Math.min(remaining, balances[d.id]);
        balances[d.id] -= extra;
        remaining -= extra;
        if (balances[d.id] <= 0 && !payoffMonths[d.id]) payoffMonths[d.id] = month;
        break;
      }
    }

    return { months: month, totalInterest, payoffMonths };
  };

  const avalancheResult = simulate(avalancheOrder);
  const snowballResult = simulate(snowballOrder);
  const interestSaved = snowballResult.totalInterest - avalancheResult.totalInterest;

  // Monthly interest breakdown by card
  const monthlyInterestByCard = debts.map(d => ({
    name: d.name.replace(' Credit Card', '').replace(' Card', ''),
    monthly_interest: Math.round(d.balance * (d.interest_rate / 100 / 12)),
    balance: d.balance,
    rate: d.interest_rate,
  })).sort((a, b) => b.monthly_interest - a.monthly_interest);

  return {
    totalDebt,
    totalMinPayments,
    totalBudget,
    avalancheMonths: avalancheResult.months,
    snowballMonths: snowballResult.months,
    totalInterestAvalanche: avalancheResult.totalInterest,
    totalInterestSnowball: snowballResult.totalInterest,
    interestSaved,
    avalancheOrder,
    snowballOrder,
    payoffMonths: avalancheResult.payoffMonths,
    monthlyInterestByCard,
  };
};

const DebtAdvisor = () => {
  const { user } = useAuth();
  const [extraInput, setExtraInput] = useState('50000');
  const [strategy, setStrategy] = useState('avalanche');
  const extraVal = parseFloat(extraInput) || 0;

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const { data: proj } = useQuery({
    queryKey: ['debtProjection', extraVal, debts?.length],
    queryFn: async () => (await api.get(`/debts/projection?extra=${extraVal}`)).data,
    enabled: !!debts?.length,
  });

  const activeDebts = debts?.filter(d => d.status !== 'Paid Off') ?? [];

  const plan = useMemo(() => computeStrategy(activeDebts, extraVal), [activeDebts, extraVal]);

  // Chart data for extinction trajectory
  const chart = proj?.chart ?? [];

  const totalInstallmentsByCard = useMemo(() => {
    const byCard = {};
    for (const plan of INSTALLMENT_PLANS) {
      byCard[plan.card] = (byCard[plan.card] || 0) + plan.monthly;
    }
    return byCard;
  }, []);

  if (activeDebts.length === 0) return (
    <div className="py-32 text-center flex flex-col items-center gap-12 italic">
      <div className="p-16 bg-emerald-50 text-emerald-500 rounded-full border-8 border-white shadow-2xl">
        <Trophy size={80}/>
      </div>
      <div className="max-w-xl space-y-6">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-950">Debt Free</h1>
        <p className="text-slate-400 font-black text-sm uppercase tracking-[0.6em] opacity-40 italic">All liabilities cleared. Financial freedom achieved.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-32 max-w-7xl mx-auto px-6 italic">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-3">
          <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1.5 rounded-full">Pro Accountant Advisory</span>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase leading-none">Debt Elimination Plan</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60">Personalised strategy to eliminate LKR {formatCurrency(plan?.totalDebt || 0).replace('LKR', '').trim()} in credit card debt</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStrategy('avalanche')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${strategy === 'avalanche' ? 'bg-slate-950 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}>
            Avalanche (Optimal)
          </button>
          <button onClick={() => setStrategy('snowball')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${strategy === 'snowball' ? 'bg-purple-600 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}>
            Snowball
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 rounded-[2rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] relative z-10">Total Debt</p>
          <div className="relative z-10">
            <p className="text-2xl lg:text-3xl font-black text-white tracking-tighter">{formatCurrency(plan?.totalDebt || 0)}</p>
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1">Across 4 cards</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px] hover:shadow-xl transition-all">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Monthly Interest Burn</p>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-rose-600 tracking-tighter">
              {formatCurrency(plan?.monthlyInterestByCard?.reduce((s, c) => s + c.monthly_interest, 0) || 0)}
            </p>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Every month, doing nothing</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px] hover:shadow-xl transition-all">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Debt-Free Timeline</p>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tighter">
              {strategy === 'avalanche' ? (plan?.avalancheMonths || '--') : (plan?.snowballMonths || '--')} <span className="text-sm opacity-40">mo</span>
            </p>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">≈ {((strategy === 'avalanche' ? plan?.avalancheMonths : plan?.snowballMonths) / 12 || 0).toFixed(1)} years</p>
          </div>
        </div>
        <div className="bg-emerald-600 rounded-[2rem] p-8 shadow-xl text-white flex flex-col justify-between min-h-[160px]">
          <p className="text-[9px] font-black text-emerald-100 uppercase tracking-[0.4em]">Interest Saved (Avalanche vs Snowball)</p>
          <div>
            <p className="text-2xl lg:text-3xl font-black tracking-tighter">{formatCurrency(Math.abs(plan?.interestSaved || 0))}</p>
            <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mt-1">By using Avalanche method</p>
          </div>
        </div>
      </div>

      {/* ── PER-CARD PAYMENT SCHEDULE ── THE MAIN EVENT ── */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 p-8 text-white">
          <h2 className="text-2xl font-black uppercase tracking-tighter">📅 Your Payment Schedule — This Month</h2>
          <p className="text-rose-100 text-[11px] font-bold uppercase tracking-wide mt-1">
            Exact dates, exact amounts. Pay these on time to avoid penalties and reduce balances fastest.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                <th className="px-8 py-5 text-left">Card</th>
                <th className="px-8 py-5 text-left">Pay By Date</th>
                <th className="px-8 py-5 text-right">Minimum Due</th>
                <th className="px-8 py-5 text-right">Recommended Pay</th>
                <th className="px-8 py-5 text-right">Balance After</th>
                <th className="px-8 py-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* BOC CC — Due May 4 */}
              <tr className="hover:bg-rose-50/30 transition-all bg-rose-50/10">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full bg-red-500"/>
                    <div>
                      <p className="font-black text-slate-950 uppercase tracking-tight">BOC Credit Card</p>
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">🎯 PRIMARY TARGET</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="bg-red-100 text-red-700 font-black text-sm px-4 py-2 rounded-xl inline-block uppercase">4 May 2026</div>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-950">LKR 23,017</td>
                <td className="px-8 py-6 text-right">
                  <p className="font-black text-emerald-600 text-lg">LKR 73,017</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Min + 50,000 extra</p>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-700">≈ LKR 387,328</td>
                <td className="px-8 py-6">
                  <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Pay Online via BOC</span>
                </td>
              </tr>
              {/* NDB — Due Apr 30 */}
              <tr className="hover:bg-blue-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full bg-blue-500"/>
                    <div>
                      <p className="font-black text-slate-950 uppercase tracking-tight">NDB Visa Platinum</p>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">26% APR — Urgent</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="bg-orange-100 text-orange-700 font-black text-sm px-4 py-2 rounded-xl inline-block uppercase">30 Apr 2026</div>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-950">LKR 4,960</td>
                <td className="px-8 py-6 text-right">
                  <p className="font-black text-emerald-600 text-lg">LKR 15,000</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">3× minimum</p>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-700">≈ LKR 109,010</td>
                <td className="px-8 py-6">
                  <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">CEFT from BOC</span>
                </td>
              </tr>
              {/* Sampath CC — Due Apr 20 */}
              <tr className="hover:bg-amber-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full bg-amber-500"/>
                    <div>
                      <p className="font-black text-slate-950 uppercase tracking-tight">Sampath Credit Card</p>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">26% APR — Has installments</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="bg-red-100 text-red-700 font-black text-sm px-4 py-2 rounded-xl inline-block uppercase">20 Apr 2026 ⚠️</div>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-950">LKR 8,852</td>
                <td className="px-8 py-6 text-right">
                  <p className="font-black text-emerald-600 text-lg">LKR 20,000</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Covers instalments</p>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-700">≈ LKR 232,915</td>
                <td className="px-8 py-6">
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">CEFT from BOC</span>
                </td>
              </tr>
              {/* AMEX — Due May 8 */}
              <tr className="hover:bg-purple-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full bg-purple-500"/>
                    <div>
                      <p className="font-black text-slate-950 uppercase tracking-tight">NTB AMEX</p>
                      <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Installment card — don't overpay</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="bg-purple-100 text-purple-700 font-black text-sm px-4 py-2 rounded-xl inline-block uppercase">~8 May 2026</div>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-950">LKR 5,000</td>
                <td className="px-8 py-6 text-right">
                  <p className="font-black text-emerald-600 text-lg">LKR 5,000</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Min only — plans auto-debit</p>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-700">≈ LKR 164,554</td>
                <td className="px-8 py-6">
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">NTB Online Pay</span>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-950 text-white">
              <tr>
                <td className="px-8 py-5 font-black text-[10px] uppercase tracking-widest" colSpan={2}>Total This Month</td>
                <td className="px-8 py-5 text-right font-black text-rose-400">LKR 41,829</td>
                <td className="px-8 py-5 text-right font-black text-emerald-400 text-lg">LKR 113,017</td>
                <td className="px-8 py-5"/>
                <td className="px-8 py-5 text-right text-[9px] font-black text-white/40 uppercase">Recommended total outflow</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-6 bg-amber-50 border-t border-amber-100 flex items-start gap-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5"/>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
            ⚠️ Sampath due date 20 Apr is IMMINENT — pay LKR 20,000 today if not yet done. Late payment = 26% penalty + credit score damage.
          </p>
        </div>
      </div>

      {/* ── ACCOUNTANT'S PLAN ── */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 to-slate-800 p-10 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/10 rounded-2xl"><Brain size={28} className="text-blue-300"/></div>
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em]">Pro Accountant's Recommendation</p>
              <h2 className="text-2xl font-black tracking-tighter uppercase">The Exact Plan to Clear Your Debt</h2>
            </div>
          </div>
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-wide mt-2">
            Based on your current balances, interest rates, and minimum payments. Avalanche method recommended — saves the most money.
          </p>
        </div>
        
        {/* Extra payment input */}
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <Zap size={20} className="text-emerald-500 shrink-0"/>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extra Monthly Payment Above Minimums</p>
              <p className="text-[11px] text-slate-500 italic">Even LKR 10,000 extra saves months of debt. Try different amounts.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">LKR</span>
            <input type="number" min="0" step="5000" value={extraInput} onChange={e => setExtraInput(e.target.value)}
              className="bg-transparent text-slate-950 font-black text-2xl outline-none w-36 tracking-tighter placeholder:opacity-20"
              placeholder="50000"/>
            <div className="bg-emerald-500 text-white p-2 rounded-xl"><Target size={18}/></div>
          </div>
        </div>

        {/* Card-by-card breakdown */}
        <div className="p-8 space-y-0 divide-y divide-slate-50">
          {(strategy === 'avalanche' ? plan?.avalancheOrder : plan?.snowballOrder)?.map((debt, idx) => {
            const monthlyInterest = debt.balance * (debt.interest_rate / 100 / 12);
            const payoffMonth = plan?.payoffMonths?.[debt.id];
            const isFirst = idx === 0;
            const installs = INSTALLMENT_PLANS.filter(p => p.card === debt.name);
            const installTotal = installs.reduce((s, p) => s + p.monthly, 0);
            const freeBalance = debt.balance - installs.reduce((s, p) => s + p.total_remaining, 0);

            return (
              <div key={debt.id} className={`py-8 ${isFirst ? 'bg-rose-50/30' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Priority badge + name */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black italic text-white shrink-0 shadow-lg`}
                      style={{ background: CARD_COLORS[debt.name] || '#64748b' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-slate-950 text-xl tracking-tighter uppercase">{debt.name}</p>
                        {isFirst && <span className="bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">🎯 ATTACK FIRST</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{debt.interest_rate}% APR</span>
                        <span className="text-[10px] font-black text-slate-300">•</span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">LKR {Math.round(monthlyInterest).toLocaleString()} interest/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 text-center lg:text-right">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                      <p className="text-lg font-black text-slate-950 tracking-tighter">{formatCurrency(debt.balance)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Payment</p>
                      <p className="text-lg font-black text-blue-600 tracking-tighter">{formatCurrency(debt.min_payment)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid Off By</p>
                      <p className="text-lg font-black text-emerald-600 tracking-tighter">{payoffMonth ? monthToDate(payoffMonth) : '--'}</p>
                    </div>
                  </div>
                </div>

                {/* Installment plans for this card */}
                {installs.length > 0 && (
                  <div className="mt-4 ml-16 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Installment Plans:</p>
                    {installs.map((plan, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: plan.color }}></div>
                          <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">{plan.description}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="text-[10px] font-black text-slate-400">{plan.remaining} mo remaining</span>
                          <span className="text-[11px] font-black text-rose-600">{formatCurrency(plan.monthly)}/mo</span>
                          <span className="text-[10px] font-black text-emerald-600">{formatCurrency(plan.total_remaining)} left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Utilization bar */}
                {debt.credit_limit > 0 && (
                  <div className="mt-4 ml-16">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      <span>Utilization: {((debt.balance / debt.credit_limit) * 100).toFixed(1)}%</span>
                      <span>Limit: {formatCurrency(debt.credit_limit)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((debt.balance / debt.credit_limit) * 100, 100)}%`, background: CARD_COLORS[debt.name] || '#64748b' }}/>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Extinction Trajectory Chart */}
      {chart.length > 0 && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter italic">Extinction Trajectory</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-60 mt-1">Month-by-month debt dissolution</p>
            </div>
            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] bg-slate-50 px-5 py-3 rounded-full border border-slate-100">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Avalanche</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-dashed border-purple-500 bg-purple-100"></div> Snowball</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="avGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={v => `M${v}`}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="avalanche" stroke="#2563eb" strokeWidth={4} fill="url(#avGrad)" dot={false} activeDot={{ r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}/>
                <Area type="monotone" dataKey="snowball" stroke="#a855f7" strokeWidth={2} fill="transparent" strokeDasharray="8 8" opacity={0.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Interest by Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter mb-8 flex items-center gap-4 italic">
            <Flame size={26} className="text-rose-500"/> Monthly Interest Drain
          </h2>
          <div className="space-y-5">
            {plan?.monthlyInterestByCard?.map((card, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  <span>{card.name}</span>
                  <span className="text-rose-600">{formatCurrency(card.monthly_interest)}/mo at {card.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((card.monthly_interest / plan.monthlyInterestByCard[0].monthly_interest) * 100, 100)}%`, background: Object.values(CARD_COLORS)[i] || '#ef4444' }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Interest</p>
            <p className="text-2xl font-black text-rose-600 tracking-tighter">{formatCurrency(plan?.monthlyInterestByCard?.reduce((s, c) => s + c.monthly_interest, 0) || 0)}</p>
          </div>
        </div>

        {/* Accountant's Intelligence Hub */}
        <div className="space-y-5">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-4 italic">
            <Brain size={26} className="text-blue-600"/> Accountant's Intelligence
          </h2>
          <InsightCard icon={<Target size={18}/>} color="red"
            text={`PRIORITY ALERT: BOC Credit Card (460,344) is your highest balance. It's also accruing the most interest. Attack this card with every available rupee above minimums.`}/>
          <InsightCard icon={<Zap size={18}/>} color="amber"
            text={`Sampath Card's Luxury X 24M plan ends in just 2 months (LKR 19,583/mo payment). Once it clears, redirect that LKR 19,583 as an extra attack on BOC CC — this accelerates your freedom by ~12 months.`}/>
          <InsightCard icon={<CheckCircle size={18}/>} color="green"
            text={`NDB Card is nearly clear at LKR 124k. With your current payments it clears within 15 months. Once done, stack that payment on BOC CC — the "Debt Snowroller" effect.`}/>
          <InsightCard icon={<TrendingDown size={18}/>} color="blue"
            text={`AMEX installment plans (Unity + Luxury X) lock LKR 23,775/mo for 7-8 more months. These are zero-interest plans — do NOT pay them off early. Let them run and use excess cash on high-rate cards.`}/>
          <InsightCard icon={<Shield size={18}/>} color="purple"
            text={`Avoid using BOC CC for any new expenses until balance drops below LKR 200,000. Your 61% utilization is damaging your credit profile. Freeze the card if needed.`}/>
        </div>
      </div>

      {/* Installment Plans Summary */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic flex items-center gap-4">
            <Clock size={24} className="text-amber-500"/> Active Installment Plans
          </h2>
          <div className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-amber-100">
            {INSTALLMENT_PLANS.filter(p => p.remaining > 0).length} Active Plans
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                <th className="px-8 py-5 text-left">Card</th>
                <th className="px-8 py-5 text-left">Description</th>
                <th className="px-8 py-5 text-right">Monthly</th>
                <th className="px-8 py-5 text-right">Remaining</th>
                <th className="px-8 py-5 text-right">Balance Left</th>
                <th className="px-8 py-5 text-right">Ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INSTALLMENT_PLANS.map((plan, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: plan.color }}></div>
                      <span className="font-black text-slate-700 text-sm uppercase tracking-wide">{plan.card.replace('Credit Card', 'CC').replace(' Card', '')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600 italic">{plan.description}</td>
                  <td className="px-8 py-5 text-right font-black text-slate-950">{formatCurrency(plan.monthly)}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`font-black text-sm ${plan.remaining <= 2 ? 'text-emerald-600' : plan.remaining <= 6 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {plan.remaining} mo
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-rose-600">{formatCurrency(plan.total_remaining)}</td>
                  <td className="px-8 py-5 text-right text-[11px] font-black text-slate-500 uppercase">
                    {plan.remaining === 0 ? '✅ Complete' : monthToDate(plan.remaining)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 text-white">
              <tr>
                <td className="px-8 py-5 font-black text-[10px] uppercase tracking-widest" colSpan={2}>Total Locked Monthly</td>
                <td className="px-8 py-5 text-right font-black text-amber-400">{formatCurrency(INSTALLMENT_PLANS.reduce((s,p) => s + p.monthly, 0))}</td>
                <td className="px-8 py-5" colSpan={2}></td>
                <td className="px-8 py-5 text-right text-[10px] font-black text-white/40 uppercase">Across {INSTALLMENT_PLANS.length} plans</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="text-center mt-16 bg-white/40 backdrop-blur-md py-12 rounded-[3rem] border border-slate-200/50 relative overflow-hidden">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.8em] px-16 opacity-40 leading-loose">
          Vantage Pro Advisory · Strategy computed from official bank statements · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default DebtAdvisor;
