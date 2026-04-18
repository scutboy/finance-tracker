# Finance Tracker — Improvement Recommendations
**Prepared:** 18 April 2026  
**Scope:** Data quality fixes, missing features, technical improvements, and future enhancements  
**Priority order:** Fix data first → then build features on clean foundation

---

## Priority 1 — Fix Data (Before Anything Else)

Every dashboard figure is currently distorted. None of these require UI changes — they are SQL patches and one Alembic migration. The exact scripts for all five are in `Finance_DB_Audit_Recommendations.md`.

| Step | Fix | Impact |
|------|-----|--------|
| 1 | Delete 6 duplicate income rows (IDs 13–18) | Removes LKR 1,193,253 phantom income |
| 2 | Add `is_transfer` boolean to `expenses` table + flag all CEFT/CC payment rows | Marks 14 double-counted transfer pairs |
| 3 | Delete duplicate transfer expense sides (BOC Current Account vs Savings A/C pairs) | Removes LKR 696,225 phantom expenses |
| 4 | Unify account tags (`Debit Card` → `ComBank Debit Card`, `Sampath Card` → `Sampath Credit Card`, etc.) | Fixes ~LKR 570k of misattributed spend |
| 5 | Re-attribute 29 generic `Credit Card` entries to correct cards (BOC/Sampath/NDB) | Enables accurate per-card balances |
| 6 | Add `account` column to `Income` table via Alembic migration | Enables per-account income tracking |
| 7 | Insert missing ComBank income entries (335k CEFT + 200k Digital Banking top-ups) | Balances ComBank ledger |

> Until these 7 steps are done, Net Worth, Cash Flow, and all per-account balance cards show incorrect figures.

---

## Priority 2 — Critical Missing Features

### 2.1 — Transfer Entity (Prevents Future Double-Counting)

**Problem:** Moving money between your own accounts (BOC → ComBank, BOC → CC payment) is currently stored as an `Expense`. This is why the double-counting problem exists and will keep recurring.

**Fix:** Add a `Transfer` model with `from_account`, `to_account`, `amount`, and `date`. Exclude all transfers from P&L, net worth delta, and budget calculations. Replace the `Transfer/Cash` expense category with actual Transfer records.

```python
class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    from_account = Column(String, nullable=False)
    to_account = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

### 2.2 — Opening Balance per Account

**Problem:** Every credit card has a pre-February 2026 balance that the tracker doesn't know about. The CC Reconciliation sheet shows a ~LKR 700k gap between tracked spend and reported balances — all attributable to transactions before the tracking start date.

**Fix:** Add an `opening_balance` field to the `Debt` model (already exists for credit cards) and a similar concept for bank accounts. The dashboard balance cards should calculate: `opening_balance + tracked_inflows − tracked_outflows`.

---

### 2.3 — SMS Import / Paste Import

**Problem:** The bank statement importer handles PDF and CSV, but your actual workflow is SMS alerts. Reading and pasting SMS text is faster and more real-time than finding and uploading PDFs.

**Fix:** Add a text area input ("Paste SMS messages") to the import flow alongside the existing file upload. The `statement_parser.py` service already has bank-specific regex patterns — extend these to match the Sri Lankan SMS alert format for BOC, ComBank, Sampath, NDB, and NTB AMEX.

Example SMS patterns to parse:
```
BOC:   "Your A/C 1234 debited LKR 5,000.00 on 18-Apr-26 at MERCHANT NAME"
ComBank: "LKR 2,500 debited from A/C ending 3146 on 18/04/2026 at MERCHANT"
Sampath: "Rs.1,500.00 has been debited from your Sampath account ***7926"
```

---

### 2.4 — Live Currency Rate for Foreign Subscriptions

**Problem:** USD/LKR conversion is hardcoded at `300` in the backend. Subscriptions billed in USD (Claude.ai, GeForce Now, Apple, Netflix) will silently show wrong LKR totals as the exchange rate moves. As of April 2026, the rate is closer to 305–310.

**Fix:** Either fetch a live rate from a free API (e.g., exchangerate-api.com) once daily, or add a user-configurable "USD rate" setting in Settings that defaults to the current rate and prompts for update when stale.

```python
# In settings or a config table:
usd_to_lkr_rate = Column(Float, default=300.0)
rate_last_updated = Column(DateTime)
```

---

## Priority 3 — Dashboard & Analytics Improvements

### 3.1 — Budget vs Actual View

The Budget module exists but there is no view comparing what you budgeted against what you actually spent per category in a given month. This is the most useful budget feature and it's currently absent.

Add a monthly comparison table:

| Category | Budget | Actual | Variance | % Used |
|----------|--------|--------|----------|--------|
| Food | 50,000 | 43,200 | +6,800 | 86% |
| Medical | 30,000 | 62,400 | −32,400 | 208% ⚠ |

---

### 3.2 — Per-Account Balance Cards

Once `account` is added to the `Income` table (Step 6 above), the dashboard should show a running balance for each account:

- **BOC Current Account:** Opening + Income − Expenses (filtered by account)
- **ComBank Debit Card:** Same logic
- **Each credit card:** Balance from `debts` table + payments made − new charges

This is currently impossible because income has no account tag.

---

### 3.3 — Spending Trend (Year-over-Year / Month-over-Month)

The dashboard shows a 6-month cash flow trend but no category-level breakdown over time. Adding a chart that shows monthly spend per category over 6 months would make it easy to spot creeping lifestyle inflation or one-off spikes (e.g., the LKR 200k BOC CC payment in March).

---

### 3.4 — Debt Payoff Progress Tracker

The DebtAdvisor page shows projections but doesn't show historical payoff progress — how much debt has actually been reduced month by month. A simple line chart of total debt balance over time (derived from `debt_payments`) would make the payoff effort visible and motivating.

---

## Priority 4 — Technical / Code Quality

### 4.1 — Expense Category Enum Enforcement

The `category` column on `Expense` is a plain `String` with no database-level constraint. The bank statement importer and manual entry can silently create arbitrary category strings that the frontend doesn't know how to display. Move to a `SQLAlchemyEnum` like the `Income` table already uses.

### 4.2 — CORS Security

CORS is set to wildcard (`"*"`) in the backend:
```python
allow_origins=["*"]
```
This is fine for local development but should be restricted to your actual frontend origin before exposing the app over a network (e.g., if you ever deploy to Railway/Vercel or access from outside your home network).

### 4.3 — Debt Payment Deduplication

The `debt_payments` table has 8 confirmed duplicate entries:

| Card | Duplicate Pairs | Overcount (LKR) |
|------|----------------|-----------------|
| NDB | 3 pairs | ~30,000 |
| Sampath | 3 pairs | ~45,000 |
| NTB AMEX | 2 pairs | ~50,000 |

These inflate the "Payments Made" figure in the DebtAdvisor projection and make payoff timelines appear shorter than they are. Delete the duplicate rows after verifying which entry in each pair is the original.

### 4.4 — Add Unique Constraint on Income (date + amount + description)

To prevent future accidental duplication from re-imports, add a unique constraint:
```python
__table_args__ = (
    UniqueConstraint('user_id', 'date', 'amount', 'description', name='uq_income_entry'),
)
```
This would have prevented the 6 current duplicates entirely.

### 4.5 — Startup Database Repair Should Be Removed

`database.py` runs tactical `ALTER TABLE` and `UPDATE` statements on every app startup to patch schema issues. This is a code smell — it means past migrations weren't done properly. Once the audit fixes are applied and a clean Alembic migration is created for the `account` and `is_transfer` columns, remove the startup repair block and run migrations properly via `alembic upgrade head`.

---

## Priority 5 — Future Features (Post Clean-Up)

These are worth building once the data foundation is solid:

| Feature | Why It's Useful |
|---------|----------------|
| Monthly PDF/CSV export | Print a statement for any month; useful for tax records |
| Bill reminders / due date alerts | You have 4 credit cards with different due dates — easy to miss |
| Recurring expense automation | Flag subscriptions that appear in expenses automatically |
| Year-over-year spending comparison | "Am I spending more this April vs last April?" |
| Net worth projection | Given current savings rate, when do you reach a target NW? |
| Doctor-specific categories | Medical conferences, CME fees, equipment, locum income — none of the current categories cover these |
| Family member sub-accounts | "Putha exam fee", "CRS putha deposit" suggest family expenses are mixed in — a family member tag would help separate these |

---

## Recommended Implementation Order

```
Week 1:  Run all 7 database fixes from Finance_DB_Audit_Recommendations.md
Week 2:  Add Transfer entity + opening balance fields
Week 3:  Budget vs Actual view + per-account balance cards
Week 4:  SMS paste import + live USD rate
Later:   Export, reminders, projections, family tagging
```

---

*All database fixes are non-destructive and reversible with a prior backup. Run `sqlite3 finance_tracker.db ".backup finance_tracker_backup.db"` before applying any SQL.*
