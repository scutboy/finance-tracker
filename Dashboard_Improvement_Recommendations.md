# Dashboard Improvement Recommendations
**Prepared:** 18 April 2026  
**File reviewed:** `frontend/src/pages/Dashboard_v4.jsx` + `backend/app/api/endpoints/dashboard.py`

---

## What the Dashboard Is Supposed to Do

The dashboard should answer **one question in under 10 seconds:**

> *"How am I doing with money this month — and is anything on fire?"*

That means: income received, money spent, what I owe, what I've saved, and any immediate alerts. Everything else belongs on a deeper page.

---

## The Core Problem: Style Over Clarity

The current dashboard was built with a heavy focus on visual drama — "Leakage Flux", "Cluster Health Index", "Vantage Node", "Systemic Intelligence Failure", "Flux Trace", "Capital Momentum". Every label is obfuscated. The result is a page that looks impressive in a demo but is genuinely hard to read as a daily financial tool.

**Examples of what's on screen vs what it actually means:**

| What the UI says | What it actually is |
|------------------|---------------------|
| Consolidated Inbound | Income this cycle |
| Allocated Leakage | Expenses this cycle |
| Capital Momentum | Net cash flow (income − expenses) |
| Cluster Health Index | A debt/income ratio status |
| Leakage Flux | Hourly interest cost on CC debt |
| Survival Runway | Months your savings would last |
| Flux Trace | Recent transactions |
| Asset Resilience / Savings Core | Total savings across all goals |

This isn't a personal preference — if you need to mentally translate every label to understand what you're looking at, the dashboard is failing at its job.

---

## Issue 1 — Language and Labels

**Fix:** Replace all the system-metaphor labels with plain financial English. This is a frontend-only change in `Dashboard_v4.jsx`.

| Current label | Replace with |
|---------------|--------------|
| Consolidated Inbound | Income This Cycle |
| Allocated Leakage | Spent This Cycle |
| Capital Momentum | Net Cash Flow |
| Cluster Health Index | Financial Health |
| CLUSTER_OPTIMAL | ✅ On Track |
| DEBT_SATURATION | ⚠️ High Debt Load |
| CRITICAL_LEAKAGE | 🔴 Spending Exceeds Income |
| Leakage Flux / Hourly Interest Bleed | Interest Costing You Per Hour |
| Survival Runway | Emergency Fund Coverage |
| Flux Trace | Recent Transactions |
| Asset Resilience / Savings Core | Total Savings |
| Systemic Intelligence Failure | Could not load dashboard |
| Re-Launch Intelligence Node | Retry |

---

## Issue 2 — The 6-Month Chart Is Built but Not Shown

The backend calculates and returns `cash_flow` — a month-by-month array with `income`, `spent`, and `net` for the last 6 months. The frontend never renders it. There is a Recharts import in `package.json` and it's used on other pages.

This is the most useful thing the dashboard could show — your income vs spending trend over time — and it's already computed. It just needs to be wired up.

**What to add:**
```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={280}>
  <BarChart data={summary?.cash_flow}>
    <XAxis dataKey="month" />
    <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
    <Tooltip formatter={v => formatCurrency(v)} />
    <Legend />
    <Bar dataKey="income" name="Income" fill="#10b981" />
    <Bar dataKey="spent" name="Spent" fill="#ef4444" />
  </BarChart>
</ResponsiveContainer>
```

---

## Issue 3 — The "Survival Runway" Metric is Misleading

The current formula is:

```js
survivalRunway = total_saved / monthly_expenses
```

This divides your **total savings goal balances** (Emergency Fund + Education + Retirement + Property) by your monthly expenses. It is showing `~3.7 months` — but most of that "savings" is the Education and Retirement fund, which you cannot touch in an emergency without penalty.

**Fix:** Calculate this using only the Emergency Fund goal specifically, not all savings.

```python
# In dashboard.py — only use Emergency Fund goal
emergency_fund = next((g for g in goals if 'emergency' in g.name.lower()), None)
emergency_balance = emergency_fund.current_amount if emergency_fund else 0
```

That gives you a real, honest runway figure.

---

## Issue 4 — No Monthly Budget vs Actual

The Budget module lets you set category budgets, but the dashboard has no summary of how you're tracking against them this month. This is the most actionable daily check — "I've spent 80% of my food budget and it's only the 18th."

**What to add to the dashboard API** (a new summary block):

```python
# In dashboard.py — add budget tracking
from app.db.models import BudgetCategory

budget_categories = db.query(BudgetCategory).filter(
    BudgetCategory.user_id == current_user.id
).all()

budget_status = []
for bc in budget_categories:
    actual = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.category == bc.name,
        Expense.date >= cycle_start,
        Expense.is_transfer == False
    ).scalar() or 0.0
    budget_status.append({
        "name": bc.name,
        "budget": bc.monthly_budget,
        "actual": actual,
        "pct": round(actual / bc.monthly_budget * 100, 1) if bc.monthly_budget > 0 else 0
    })
```

On the dashboard, show a compact progress bar per category — green under 75%, amber 75–100%, red over 100%.

---

## Issue 5 — Debt Section Shows Balances But Not Progress

The dashboard shows each CC balance as a static number. It doesn't show:
- How much you've paid off this cycle
- Whether you're on track with minimum payments
- Which card the DebtAdvisor is recommending you target

The target debt IS calculated in the backend (`target_debt` field) — it's just not prominently displayed. The dashboard should have a "Focus Debt" card showing the card you should be paying extra toward this month, with its balance and interest rate clearly visible.

---

## Issue 6 — Pay Cycle Label Is Not Visible

The backend computes expenses from `cycle_start` (the 25th of the previous month) which is correct for your payroll cycle. But the dashboard just says "This Cycle" with no date. A user coming back after a few days can't tell what period the numbers cover.

**Fix:** Show the cycle period explicitly, e.g. `25 Mar – 18 Apr 2026` as a subtitle under the income/expense cards.

---

## Issue 7 — The Error State Is Unhelpful

If the API fails, the current error message is:
> *"Systemic Intelligence Failure — The Vantage core encountered a critical anomaly during flux synchronization."*

No one knows what to do with this. Replace with:
> *"Dashboard failed to load. Check your connection and try again."*

---

## Proposed Dashboard Layout (Redesigned)

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, Charith   •   Cycle: 25 Mar – 24 Apr 2026   │
│  Financial Health: ✅ On Track                               │
├──────────────┬──────────────┬──────────────────────────────┤
│  Income      │  Spent       │  Net Cash Flow               │
│  LKR X       │  LKR X       │  LKR X (surplus/deficit)     │
│  This cycle  │  This cycle  │  This cycle                  │
├──────────────┴──────────────┴──────────────────────────────┤
│  6-Month Income vs Spending Chart (bar chart)               │
├──────────────────────────────┬─────────────────────────────┤
│  Credit Cards                │  Budget This Month          │
│  BOC     LKR 460k ████████   │  Food       82% ████████░   │
│  Sampath LKR 252k ██████░    │  Medical   208% ██████████! │
│  NDB     LKR 124k ████░      │  Transport  45% ████░       │
│  AMEX    LKR 169k █████░     │                             │
├──────────────────────────────┼─────────────────────────────┤
│  Focus Debt (Snowball)       │  Emergency Fund             │
│  NDB Card — LKR 124k @ 26%   │  3.2 months coverage        │
│  Pay extra here first        │  LKR 420k / LKR 500k target │
├──────────────────────────────┴─────────────────────────────┤
│  Recent Transactions                                        │
│  Apr 18 · UBER EATS · -LKR 850           (Food)            │
│  Apr 17 · SLIPS IN  · +LKR 262,094       (Income)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes Required

| Change | Where | Effort |
|--------|--------|--------|
| Replace all obfuscated labels with plain English | `Dashboard_v4.jsx` | Low |
| Wire up the 6-month cash flow chart (data already exists) | `Dashboard_v4.jsx` | Low |
| Fix Survival Runway to use Emergency Fund only | `dashboard.py` + JSX | Low |
| Add Budget vs Actual progress bars | `dashboard.py` + JSX | Medium |
| Show cycle date range under income/expense cards | `Dashboard_v4.jsx` | Low |
| Add "Focus Debt" card using existing `target_debt` data | `Dashboard_v4.jsx` | Low |
| Fix error state message | `Dashboard_v4.jsx` | Low |

Most of these are frontend-only changes. The biggest new backend work is the Budget vs Actual block, and even that is straightforward given the existing schema.

---

*The goal is a dashboard you can open on your phone between patients and understand in 10 seconds — not one that requires reading comprehension.*
