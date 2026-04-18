# Finance Tracker — Database Audit & Recommendations
**Prepared:** 18 April 2026  
**Database:** `backend/finance_tracker.db`  
**Schema version (Alembic):** `l8g9h0i1j2k3`  
**Scope:** All tables — `expenses`, `income`, `debts`, `subscriptions`

---

## Executive Summary

Five structural problems were identified that are distorting every financial figure the app displays. The most critical are income duplication (overstating income by **LKR 1,193,253**) and transfer double-counting (inflating expenses by **LKR 696,225**). Together they make the net worth and savings calculations unreliable. None of these require UI changes — they are all database and schema-level fixes.

| # | Issue | Impact (LKR) | Priority |
|---|-------|-------------|----------|
| 1 | Income table duplicates | +1,193,253 false income | 🔴 Critical |
| 2 | Transfer double-counting | +696,225 false expenses | 🔴 Critical |
| 3 | Fragmented account tags | Misattributed ~570k | 🟠 High |
| 4 | Missing ComBank income entries | −535,125 missing income | 🟠 High |
| 5 | `Income` table missing `account` field | No per-account tracking | 🟡 Medium |

---

## Issue 1 — Income Table Duplicates

### What is happening
The bank statement auto-importer and manual entry ran over the same transactions, creating two rows for each deposit — one with a system-generated description, one with your personal label.

### Evidence
Six date + amount pairs appear twice in the `income` table:

| Date | Amount (LKR) | Auto-imported description | Manual description |
|------|-------------|--------------------------|-------------------|
| 25 Feb 2026 | 262,214.12 | Cash / Cheque Deposit - BOC | SLIPS IN deposit |
| 12 Mar 2026 | 200,000.00 | Transfer Credit - BOC | CRS putha deposit |
| 25 Mar 2026 | 262,094.45 | Cash / Cheque Deposit - BOC | SLIPS IN deposit |
| 7 Apr 2026 | 3,899.80 | Cash / Cheque Deposit - BOC | SLIPS IN deposit |
| 7 Apr 2026 | 290,000.00 | Transfer Credit - BOC | Putha exam fee |
| 9 Apr 2026 | 175,044.93 | Cash / Cheque Deposit - BOC | SLIPS IN deposit |
| **Total** | **1,193,253.30** | | |

**Reported total income: LKR 2,847,811**  
**Correct total income: LKR 1,654,558**

### Fix
Decide which description to keep (the personal labels are more meaningful) and delete the auto-imported duplicates. Each pair shares the same `date` and `amount` — the higher `id` is the duplicate in most cases, but verify before deleting.

```sql
-- Preview duplicates before deleting
SELECT id, date, description, amount
FROM income
WHERE (date, amount) IN (
    SELECT date, amount FROM income
    GROUP BY date, amount HAVING COUNT(*) > 1
)
ORDER BY date, amount, id;

-- Once verified, delete the auto-imported versions (lower IDs: 13,14,15,16,17,18)
-- Keep the manually-named entries (IDs: 20,21,22,23,24,25,26,27,28)
DELETE FROM income WHERE id IN (13, 14, 15, 16, 17, 18);
```

---

## Issue 2 — Transfer Double-Counting

### What is happening
Every BOC savings account transfer is being logged from **both** the source account (`Savings A/C`) and the destination/companion account (`BOC Current Account`), counting each transfer twice as an expense.

### Evidence
14 confirmed matching pairs (same date, same amount, different `account` tag):

| Date | Amount (LKR) | As `Savings A/C` | As `BOC Current Account` |
|------|-------------|-----------------|--------------------------|
| 10 Feb | 10,025 | CEFT Transfer | personal |
| 10 Feb | 15,025 | Transfer Debit | CEFT CC payment |
| 11 Feb | 10,000 | Online Transfer | personal |
| 23 Feb | 2,000 | Online Transfer | 0775577633 transfer |
| 25 Feb | 4,000 | Online Transfer | 0114970731 transfer |
| 4 Mar | 50,025 | CEFT Transfer | Personal transfer |
| 11 Mar | 15,025 | Transfer Debit | CEFT CC Payment |
| 13 Mar | 200,000 | Online Transfer | BOC CC payment |
| 13 Mar | 20,025 | Transfer Debit | CEFT CC Payment |
| 31 Mar | 10,025 | Transfer Debit | CEFT CC Payment |
| 31 Mar | 10,025 | Transfer Debit | CEFT CC Payment |
| 31 Mar | 40,025 | Transfer Debit | CEFT Gold Loan |
| 9 Apr | 20,025 | Transfer Debit | personal CEFT |
| 9 Apr | 290,000 | Online Transfer (CC Payment) | BOC CC payment 290k |
| **Total** | **696,225** | | |

### Root cause
`Savings A/C` and `BOC Current Account` are being treated as two separate accounts in the database, but they refer to the **same BOC account** viewed from two different import sources (SMS alerts vs. manual entry). Additionally, internal transfers between your own accounts should never be P&L items at all.

### Fix (two-step)

**Step A — Consolidate the duplicate entries now:**  
Remove the `BOC Current Account` side of each double-counted pair above (or the `Savings A/C` side — pick one canonical source and delete the other).

**Step B — Add `is_transfer` flag to prevent this in future:**  
Add a boolean column `is_transfer` to the `expenses` table. Flag all internal transfers (CEFT, online transfers between own accounts, CC payments). Exclude `is_transfer = TRUE` rows from all P&L, net worth, and budget calculations.

```sql
-- Alembic migration (or raw SQL for now):
ALTER TABLE expenses ADD COLUMN is_transfer BOOLEAN DEFAULT FALSE;

-- Flag all known transfer entries:
UPDATE expenses SET is_transfer = TRUE
WHERE category = 'Transfer/Cash'
   OR description LIKE '%CEFT%'
   OR description LIKE '%CC payment%'
   OR description LIKE '%CC Payment%'
   OR description LIKE '%Personal transfer%';
```

---

## Issue 3 — Fragmented Account Tags (Same Card, Multiple Names)

### What is happening
The same physical card/account is tracked under multiple different string labels, making it impossible to get a coherent per-account view.

### Evidence

| Actual Account | Tags Currently in DB | Entry Count | Total (LKR) |
|----------------|---------------------|-------------|------------|
| ComBank Debit Card | `Debit Card` (85) + `ComBank Debit Card` (1) | 86 | 273,375 |
| Sampath Credit Card | `Sampath Card` (10) + `Sampath Credit Card` (15) | 25 | 235,316 |
| NTB AMEX | `NTB Credit Card` (2) + `NTB AMEX Credit Card` (9) | 11 | 88,541 |
| BOC / Sampath / NDB mixed | `Credit Card` (29 entries) | 29 | 185,966 |

### The `Credit Card` generic bucket breakdown
These 29 entries need to be re-attributed to the correct card:

**→ BOC Credit Card** (card 5524 ****8210):
GALLE ELECTRICAL, HAPPY FEET, DHL KEELLS, UBER EATS CBH (Feb 15, 16, 25), CAPTAIN TABLE, UBER EATS CBH (Mar 9), CLAUDE.AI SUBSCRIPTION, SARASAVI BOOK SHOP (Mar 18), VITO PIZZA KANDY, UBER EATS CBH (Mar 23), S.N.K. ENTERPRISES (Mar 26), KCC MULTIPLEX, UBER EATS CBH (Apr 4)

**→ Sampath Credit Card** (card ***7926):
Netflix.com (Feb 1, Mar 1, Apr 1), GEFORCE NOW (Feb 27), ABANS ELITE, SARASAVI BOOKSHOP KANDY (Feb 28), WORLD PLAY × 2 (Mar 15), KANDY CITY CENTER (Mar 15), NETHUN PHARMACY (Mar 21), XIANG YUN RESTAURANT (Mar 27)

**→ NDB Credit Card** (card 8645):
APPLE.COM/BILL (Jan 24, Feb 24, Mar 24)

### Fix
```sql
-- Unify ComBank Debit Card
UPDATE expenses SET account = 'ComBank Debit Card' WHERE account = 'Debit Card';

-- Unify Sampath Credit Card
UPDATE expenses SET account = 'Sampath Credit Card' WHERE account = 'Sampath Card';

-- Unify NTB AMEX
UPDATE expenses SET account = 'NTB AMEX Credit Card' WHERE account = 'NTB Credit Card';

-- Re-attribute generic Credit Card entries (run description-by-description):
UPDATE expenses SET account = 'BOC Credit Card'
WHERE account = 'Credit Card'
  AND description IN (
    'GALLE ELECTRICAL AGENC KANDY', 'HAPPY FEET AND HANDS P COLOMBO 05',
    'DHL KEELLS PVT LTD COLOMBO 02', 'CAPTAIN TABLE KANDY',
    'CLAUDE.AI SUBSCRIPTION SAN FRANCISCO', 'SARASAVI BOOK SHOP NUGEGODA',
    'VITO PIZZA KANDY PVT LTD', 'S.N.K. ENTERPRISES WEWELDENIYA',
    'KCC MULTIPLEX KANDY'
  );

UPDATE expenses SET account = 'Sampath Credit Card'
WHERE account = 'Credit Card'
  AND description IN (
    'Netflix.com', 'GEFORCE NOW - BRO.GAME (Thailand)',
    'ABANS ELITE - 20M (appliance)', 'SARASAVI BOOKSHOP KANDY',
    'WORLD PLAY', 'KANDY CITY CENTER', 'NETHUN PHARMACY',
    'XIANG YUN RESTAURANT'
  );

UPDATE expenses SET account = 'NDB Credit Card'
WHERE account = 'Credit Card'
  AND description = 'APPLE.COM/BILL (Singapore)';

-- Also tag UBER EATS CBH entries by date context:
UPDATE expenses SET account = 'BOC Credit Card'
WHERE account = 'Credit Card'
  AND description LIKE '%UBER EATS CBH%'
  AND date IN ('2026-02-15','2026-02-16','2026-02-25','2026-03-09','2026-03-23','2026-04-04');
```

---

## Issue 4 — Missing ComBank Income Entries (~LKR 535,125)

### What is happening
Money transferred from BOC into your ComBank account is logged as a BOC expense but never appears as income credited to ComBank. This makes ComBank's running balance appear deeply negative and overstates total outflows.

### Two sub-problems

**4a — Personal CEFT transfers (BOC → ComBank), not in income at all:**

| Date | Amount Sent from BOC | Net Transferred to ComBank |
|------|---------------------|---------------------------|
| 5 Jan 2026 | 30,025 | 30,000 |
| 22 Jan 2026 | 10,025 | 10,000 |
| 23 Jan 2026 | 50,025 | 50,000 |
| 28 Jan 2026 | 45,025 | 45,000 |
| 4 Mar 2026 | 50,025 | 50,000 |
| 30 Mar 2026 | 130,025 | 130,000 |
| 9 Apr 2026 | 20,025 | 20,000 |
| **Total** | **335,175** | **335,000** |

**4b — ComBank "Digital Banking Division" top-ups, never imported:**  
These credits appeared in your ComBank SMS thread but are absent from the database entirely:

| Date | Amount (LKR) | SMS description |
|------|-------------|----------------|
| ~28 Feb 2026 | 50,000 | Credit to 8004511560 – Digital Banking Division |
| ~14 Mar 2026 | 35,000 | Credit to 8004511560 – Digital Banking Division |
| ~26 Mar 2026 | 50,000 | Credit to 8004511560 – Digital Banking Division |
| 12 Apr 2026 | 30,000 | Credit to 8004511560 – Digital Banking Division |
| 16 Apr 2026 | 35,000 | Credit to 8004511560 – Digital Banking Division |
| **Total** | **200,000** | |

### Fix
Once the `account` field exists in the `income` table (see Issue 5), insert these as income entries with `account = 'ComBank Debit Card'` and `category = 'other'` (internal transfer — not real income, but needed to balance the account ledger until a proper Transfer entity exists).

---

## Issue 5 — `Income` Table Has No `account` Field

### What is happening
The `Income` model has no column for which bank account received the money. Every income entry is a floating figure with no account attribution. This means:
- You cannot see the ComBank balance separately from BOC.
- The ~535k missing ComBank credits (Issue 4) cannot be properly categorised even after they are added.
- The dashboard's "account balance" cards have no reliable income-side data to work from.

### Evidence (`models.py`, lines 69–80)
```python
class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, ...)
    user_id = Column(Integer, ...)
    date = Column(Date, ...)
    description = Column(String, ...)
    amount = Column(Float, ...)
    category = Column(SQLAlchemyEnum(IncomeCategoryEnum), ...)  # ← no account field
    created_at = Column(DateTime, ...)
```

### Fix — Alembic migration

**1. Add the column to the model:**
```python
account = Column(String, nullable=True)  # e.g. "BOC Current Account", "ComBank Debit Card"
```

**2. Create the migration:**
```python
# alembic/versions/m9h0i1j2k3l4_add_account_to_income.py
def upgrade():
    op.add_column('income', sa.Column('account', sa.String(), nullable=True))

def downgrade():
    op.drop_column('income', 'account')
```

**3. Backfill existing records:**
```sql
-- All current BOC deposits
UPDATE income SET account = 'BOC Current Account'
WHERE description LIKE '%BOC%' OR description LIKE '%SLIPS IN%'
   OR description LIKE '%CRS%' OR description LIKE '%putha%';

-- Husband transfer goes to BOC (adjust if different)
UPDATE income SET account = 'BOC Current Account' WHERE description = 'Husband transfer';

-- CRS deposit
UPDATE income SET account = 'BOC Current Account' WHERE description LIKE '%CRS deposit%';
```

---

## Recommended Fix Order

Apply in this sequence to avoid cascading issues:

1. **Remove income duplicates** (Issue 1) — biggest distortion, safest fix
2. **Add `is_transfer` flag and mark all Transfer/Cash expenses** (Issue 2, Step B)
3. **Delete the duplicate transfer sides** — remove `BOC Current Account` entries that match `Savings A/C` pairs (Issue 2, Step A)
4. **Unify account tags** (Issue 3) — standardise all card/account names
5. **Re-attribute the generic `Credit Card` 29 entries** to correct cards (Issue 3)
6. **Add `account` field to `Income` table** via Alembic migration (Issue 5)
7. **Insert missing ComBank income entries** with the correct account tag (Issue 4)

---

## Schema Change Summary

| Table | Change | Type |
|-------|--------|------|
| `income` | Add `account VARCHAR` column | Alembic migration |
| `expenses` | Add `is_transfer BOOLEAN DEFAULT FALSE` column | Alembic migration |
| `expenses` | Backfill `account` tag corrections | Data patch |
| `income` | Remove 6 duplicate rows | Data patch |
| `expenses` | Remove ~14 double-counted transfer rows | Data patch |

---

*All SQL statements above are safe to run in a transaction with a prior backup. No schema destructive operations (DROP TABLE, DROP COLUMN) are required.*
