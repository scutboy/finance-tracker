# Next Phase Instructions
**Prepared:** 18 April 2026  
**Status:** Dashboard layout bugs → fix first, then build Priority 2 features

---

## Part A — Dashboard Layout Bugs (Fix Before Anything Else)

### Bug 1 — Left/Right Column Height Mismatch (Tiles Overlapping)

**Root cause:** The left column stacks three separate cards (`Focus Debt` → `Leakage Pulse` → `Emergency Fund`) using `space-y-8`. The right column is a single `Budget This Month` card with `h-full`. In a CSS grid, `h-full` on a single card does not automatically stretch to match the combined height of three separate sibling items on the other side. The right card ends at its own content height, leaving a gap — or the grid row forces a height that causes content to overflow and visually overlap.

**File:** `frontend/src/pages/Dashboard_v4.jsx` — lines 167–237

**Fix:** Move the `LeakagePulse` and `Emergency Fund` cards **out** of the left column and into their own dedicated row above the two-column section. The two-column section should only contain `Focus Debt` (left) and `Budget This Month` (right) — both are naturally similar in height and will align correctly.

```jsx
{/* ── Leakage + Runway Row (full width, naturally balanced) ─── */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <LeakagePulse hourlyRate={summary?.hourly_leakage} />
  {/* Emergency Fund card here */}
</div>

{/* ── Focus Debt + Budget (now symmetrical) ──────────────────── */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Focus Debt — left */}
  {/* Budget This Month — right */}
</div>
```

---

### Bug 2 — Cash Flow Chart Shows Months in Wrong Order

**Root cause:** The backend returns `cash_flow` already sorted oldest → newest (Nov → Apr). The frontend then does `[...summary.cash_flow].reverse()` which flips it to newest → oldest (Apr → Nov). A timeline chart should always read left-to-right chronologically.

**File:** `frontend/src/pages/Dashboard_v4.jsx` — line 154

**Fix:** Remove the `.reverse()` call.

```jsx
// WRONG:
<BarChart data={[...summary.cash_flow].reverse()}>

// CORRECT:
<BarChart data={summary.cash_flow}>
```

---

### Bug 3 — Credit Card Tiles Have Been Removed

The previous version rendered CC balance cards (`debt_breakdown`) as a compact tile row. The current version removed them entirely. The only debt visible is the single "Focus Debt" card. You cannot see all four card balances at a glance.

**Fix:** Re-add the CC balance tile strip between the 3-metric row and the chart:

```jsx
{/* ── Credit Card Balance Strip ─────────────────────────── */}
{summary?.debt_breakdown?.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {summary.debt_breakdown.map((d, i) => {
      const palette = ['bg-red-50','bg-blue-50','bg-amber-50','bg-purple-50'];
      const text    = ['text-red-600','text-blue-600','text-amber-600','text-purple-600'];
      return (
        <div key={i} className={`${palette[i]} rounded-2xl p-5 border border-slate-100`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 truncate">
            {d.name.replace(' Credit Card','').replace(' Card','')}
          </p>
          <p className={`text-xl font-black tracking-tight ${text[i]}`}>
            {formatCurrency(d.balance)}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Outstanding</p>
        </div>
      );
    })}
  </div>
)}
```

---

### Bug 4 — `emergency_balance` Is Not Returned by the API

The dashboard JSX reads `summary?.emergency_balance` and `summary?.budget_status` but the backend (`dashboard.py`) does not return either of these fields. The Emergency Fund coverage card will always show 0 months and the Budget section will always show "No active budget categories."

**File:** `backend/app/api/endpoints/dashboard.py`

**Fix — add to the return block:**

```python
# Emergency fund balance (find goal named "emergency")
emergency_goal = next(
    (g for g in goals if 'emergency' in g.name.lower()), None
)
emergency_balance = emergency_goal.current_amount if emergency_goal else 0.0

# Budget vs Actual for current cycle
from app.db.models import BudgetCategory
budget_cats = db.query(BudgetCategory).filter(
    BudgetCategory.user_id == current_user.id
).all()

budget_status = []
for bc in budget_cats:
    actual = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.category == bc.name,
        models.Expense.date >= cycle_start,
        models.Expense.is_transfer == False
    ).scalar() or 0.0
    budget_status.append({
        "name": bc.name,
        "budget": bc.monthly_budget,
        "actual": round(actual, 2),
        "pct": round(actual / bc.monthly_budget * 100, 1) if bc.monthly_budget > 0 else 0
    })

# Add to return dict:
return {
    ...existing fields...,
    "emergency_balance": round(emergency_balance, 2),
    "budget_status": budget_status,
}
```

---

### Corrected Dashboard Layout Order

Once all four bugs are fixed, the page should flow like this top to bottom:

```
1. Header (greeting + health status + cycle dates)
2. Three metric cards: Income | Spent | Net Cash Flow
3. Credit card balance strip (4 tiles, one per card)
4. 6-month bar chart (oldest → newest, left to right)
5. Leakage Pulse + Emergency Fund Coverage (2-column, balanced)
6. Focus Debt (left) + Budget This Month (right) (2-column, balanced)
7. Recent Transactions (full width)
```

---

## Part B — Priority 2 Features (Build After Dashboard is Stable)

### 2.1 — Transfer Entity

**What to build:** A new `Transfer` model, API endpoints, and a transfer entry screen. Transfers move money between your own accounts (BOC → ComBank, BOC → CC payment) without affecting P&L.

**Backend — `models.py`:**
```python
class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    from_account = Column(String, nullable=False)
    to_account = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User")
```

**Alembic migration:** Create `o1p2q3r4s5t6_add_transfers_table.py`

**New API endpoints** (`/api/transfers`):
- `GET /` — list transfers
- `POST /` — create transfer
- `PUT /{id}` — edit
- `DELETE /{id}` — delete

**Key rule:** All existing `expenses` rows where `is_transfer = TRUE` should be migrated into this table and deleted from `expenses`. After migration, the `Transfer/Cash` expense category becomes obsolete.

---

### 2.2 — Opening Balance per Account

**What to build:** A way to set a starting balance for each account as of the tracking start date (1 Feb 2026), so the running balance math works correctly.

**Backend — add to `Debt` model (credit cards):**
```python
opening_balance = Column(Float, default=0.0)  # Balance before tracking began
```

**For bank accounts**, create a simple `AccountBalance` table:
```python
class AccountBalance(Base):
    __tablename__ = "account_balances"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_name = Column(String, nullable=False)  # e.g. "BOC Current Account"
    opening_balance = Column(Float, default=0.0)
    as_of_date = Column(Date, nullable=False)      # e.g. 2026-02-01
```

**Opening balances to enter** (from the CC Reconciliation sheet):

| Account | Opening Balance | As Of |
|---------|----------------|-------|
| BOC Credit Card | LKR 309,523 (pre-existing debt) | 1 Feb 2026 |
| Sampath Credit Card | ~LKR 88,790 | 1 Feb 2026 |
| NDB Card | ~LKR 97,685 | 1 Feb 2026 |
| NTB AMEX | ~LKR 120,000 | 1 Feb 2026 |
| BOC Current Account | LKR 0 (unknown — set manually) | 1 Feb 2026 |

---

### 2.3 — SMS Paste Import

**What to build:** A text area in the Expenses import flow where you paste raw SMS messages. The parser extracts transactions automatically.

**Backend — extend `statement_parser.py`:**
```python
def parse_sms_text(raw_text: str) -> list[dict]:
    """Parse pasted SMS alert messages from Sri Lankan banks."""
    transactions = []
    
    # BOC pattern: "Your A/C 1234 debited LKR 5,000.00 on 18-Apr-26 at MERCHANT"
    boc_pattern = re.compile(
        r'debited LKR ([\d,]+\.?\d*) on (\d{2}-\w{3}-\d{2}) at (.+)',
        re.IGNORECASE
    )
    
    # ComBank pattern: "LKR 2,500 debited from A/C ending 3146 on 18/04/2026 at MERCHANT"
    combank_pattern = re.compile(
        r'LKR ([\d,]+\.?\d*) debited from A/C ending (\d{4}) on (\d{2}/\d{2}/\d{4}) at (.+)',
        re.IGNORECASE
    )
    
    # Sampath pattern: "Rs.1,500.00 has been debited from your Sampath account ***7926"
    sampath_pattern = re.compile(
        r'Rs\.([\d,]+\.?\d*) has been debited.+?(\d{2}/\d{2}/\d{4})',
        re.IGNORECASE
    )
    
    for line in raw_text.strip().splitlines():
        # try each pattern...
    
    return transactions
```

**New endpoint:** `POST /api/expenses/parse-sms` — accepts `{ "sms_text": "..." }`, returns the same preview format as the existing PDF upload.

---

### 2.4 — Live USD/LKR Rate

**What to build:** Replace the hardcoded `USD_TO_LKR_RATE = 300.0` with a user-configurable setting stored in the database.

**Backend — new `UserSetting` table or add to User model:**
```python
usd_to_lkr_rate = Column(Float, default=300.0)
rate_last_updated = Column(DateTime, nullable=True)
```

**Settings page UI:** Add a "Currency Rate" field under Settings → General. Show the current rate, the last-updated date, and a "Update Rate" button. Optionally, fetch from a free API (exchangerate-api.com) on button click.

---

## Recommended Build Order

```
This week:
  □ Fix Bug 1 (column height asymmetry — restructure grid)
  □ Fix Bug 2 (reverse chart data order)
  □ Fix Bug 3 (restore CC balance tile strip)
  □ Fix Bug 4 (add emergency_balance + budget_status to API response)
  □ Verify dashboard renders correctly on mobile and desktop

Next week:
  □ Build Transfer entity + migration (2.1)
  □ Migrate existing is_transfer expense rows into transfers table

Week 3:
  □ Add opening balance fields (2.2)
  □ Enter opening balances for all 4 credit cards

Week 4:
  □ SMS paste import (2.3)
  □ Live USD rate setting (2.4)
```

---

*The dashboard bugs are all in `Dashboard_v4.jsx` and `dashboard.py` — no other files need to change for Part A. Part B requires new model files, migrations, and API endpoints but no breaking changes to existing tables.*
