# Installment Plan — Full Database Fix
**Prepared:** 18 April 2026  
**Source:** Bank Statements folder cross-referenced with `finance_tracker.db`  
**Confirmed by user:** Two separate LUXURY X plans on Sampath ✓ | BARA AUTO completed ✓

---

## Summary of All Active Installment Plans

| Plan | Card | Billing Day | Current | Remaining | Monthly (LKR) | Total Left (LKR) |
|------|------|------------|---------|-----------|--------------|-----------------|
| LUXURY X Plan A | Sampath CC | 6th | 23/24 | **1** | 19,583.33 | 19,583.33 |
| LUXURY X Plan B | Sampath CC | 19th | 8/24 | **16** | 19,028.50 | 304,456.00 |
| LUXURY X Plan C | NTB AMEX | 31st | 6/12 | **6** | 14,333.33 | 86,000.00 |
| UNITY SYSTEMS | NTB AMEX | 28th | 5/12 | **7** | 9,441.67 | 66,091.69 |
| ABANS ELITE | Sampath CC | 1st | 1/20 | **19** | 2,999.95 | 56,999.05 |
| SELL-X Computers | NDB CC | 8th | 5/36 | **31** | 2,717.00 | 84,227.00 |
| 1 PRO MART PVT LTD | NDB CC | 16th | 3/25 | **22** | 2,248.00 | 49,456.00 |
| **TOTAL COMMITTED** | | | | | **Rs 71,352/month** | **Rs 666,813** |

> PRO MART billed on the 16th (Mar entry), SELL-X billed on the 8th (Apr entry). Months already elapsed estimated from NDB statement remaining counts.

---

## Data Issues to Fix

### Issue 1 — ABANS ELITE Double Count 🔴
Full purchase price (Rs 59,999) AND first installment (Rs 2,999.95) are both in the DB.  
The Rs 59,999 was never a real charge — it was the import label before the plan was identified.

```sql
DELETE FROM expenses WHERE id = 148;
```

### Issue 2 — Future Installments Not in DB 🟠
Only the current month's entry exists for each plan. All future installments are invisible to budget projections, cash flow chart, and debt advisor. Total invisible committed spend: **Rs 666,813**.

---

## Full SQL — All Future Installments

Run this in Railway shell or as an Alembic migration. Take a backup first:
```bash
sqlite3 finance_tracker.db ".backup finance_tracker_backup_installments.db"
```

```sql
BEGIN TRANSACTION;

-- ════════════════════════════════════════════════════════════════
-- FIX 1: Remove ABANS ELITE double-count (full price, not an installment)
-- ════════════════════════════════════════════════════════════════
DELETE FROM expenses WHERE id = 148;


-- ════════════════════════════════════════════════════════════════
-- LUXURY X — Plan A (Sampath CC, billing ~6th, 1 remaining)
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-04-06', 'LUXURY X - 24M INSTALLMENT 24/24', 19583.33, 'Other', 'Sampath Credit Card', 0);


-- ════════════════════════════════════════════════════════════════
-- LUXURY X — Plan B (Sampath CC, billing ~19th, 16 remaining)
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-04-19', 'LUXURY X - 24M INSTALLMENT 9/24',  19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-05-19', 'LUXURY X - 24M INSTALLMENT 10/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-06-19', 'LUXURY X - 24M INSTALLMENT 11/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-07-19', 'LUXURY X - 24M INSTALLMENT 12/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-08-19', 'LUXURY X - 24M INSTALLMENT 13/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-09-19', 'LUXURY X - 24M INSTALLMENT 14/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-10-19', 'LUXURY X - 24M INSTALLMENT 15/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-11-19', 'LUXURY X - 24M INSTALLMENT 16/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2026-12-19', 'LUXURY X - 24M INSTALLMENT 17/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-01-19', 'LUXURY X - 24M INSTALLMENT 18/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-02-19', 'LUXURY X - 24M INSTALLMENT 19/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-03-19', 'LUXURY X - 24M INSTALLMENT 20/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-04-19', 'LUXURY X - 24M INSTALLMENT 21/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-05-19', 'LUXURY X - 24M INSTALLMENT 22/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-06-19', 'LUXURY X - 24M INSTALLMENT 23/24', 19028.50, 'Other', 'Sampath Credit Card', 0),
(1, '2027-07-19', 'LUXURY X - 24M INSTALLMENT 24/24', 19028.50, 'Other', 'Sampath Credit Card', 0);


-- ════════════════════════════════════════════════════════════════
-- LUXURY X — Plan C (NTB AMEX, billing ~31st/30th, 6 remaining)
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-04-30', 'LUXURY X INST 7/12',  14333.33, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-05-31', 'LUXURY X INST 8/12',  14333.33, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-06-30', 'LUXURY X INST 9/12',  14333.33, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-07-31', 'LUXURY X INST 10/12', 14333.33, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-08-31', 'LUXURY X INST 11/12', 14333.33, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-09-30', 'LUXURY X INST 12/12', 14333.33, 'Other', 'NTB AMEX Credit Card', 0);


-- ════════════════════════════════════════════════════════════════
-- UNITY SYSTEMS SOLUTIONS (NTB AMEX, billing ~28th, 7 remaining)
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-04-28', 'UNITY SYSTEMS SOLUTIONS INST 6/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-05-28', 'UNITY SYSTEMS SOLUTIONS INST 7/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-06-28', 'UNITY SYSTEMS SOLUTIONS INST 8/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-07-28', 'UNITY SYSTEMS SOLUTIONS INST 9/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-08-28', 'UNITY SYSTEMS SOLUTIONS INST 10/12', 9441.67, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-09-28', 'UNITY SYSTEMS SOLUTIONS INST 11/12', 9441.67, 'Other', 'NTB AMEX Credit Card', 0),
(1, '2026-10-28', 'UNITY SYSTEMS SOLUTIONS INST 12/12', 9441.67, 'Other', 'NTB AMEX Credit Card', 0);


-- ════════════════════════════════════════════════════════════════
-- ABANS ELITE (Sampath CC, billing ~1st, 19 remaining: 2/20–20/20)
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-04-01', 'ABANS ELITE - 20M INSTALLMENT 2/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-05-01', 'ABANS ELITE - 20M INSTALLMENT 3/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-06-01', 'ABANS ELITE - 20M INSTALLMENT 4/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-07-01', 'ABANS ELITE - 20M INSTALLMENT 5/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-08-01', 'ABANS ELITE - 20M INSTALLMENT 6/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-09-01', 'ABANS ELITE - 20M INSTALLMENT 7/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-10-01', 'ABANS ELITE - 20M INSTALLMENT 8/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-11-01', 'ABANS ELITE - 20M INSTALLMENT 9/20',  2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2026-12-01', 'ABANS ELITE - 20M INSTALLMENT 10/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-01-01', 'ABANS ELITE - 20M INSTALLMENT 11/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-02-01', 'ABANS ELITE - 20M INSTALLMENT 12/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-03-01', 'ABANS ELITE - 20M INSTALLMENT 13/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-04-01', 'ABANS ELITE - 20M INSTALLMENT 14/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-05-01', 'ABANS ELITE - 20M INSTALLMENT 15/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-06-01', 'ABANS ELITE - 20M INSTALLMENT 16/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-07-01', 'ABANS ELITE - 20M INSTALLMENT 17/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-08-01', 'ABANS ELITE - 20M INSTALLMENT 18/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-09-01', 'ABANS ELITE - 20M INSTALLMENT 19/20', 2999.95, 'Other', 'Sampath Credit Card', 0),
(1, '2027-10-01', 'ABANS ELITE - 20M INSTALLMENT 20/20', 2999.95, 'Other', 'Sampath Credit Card', 0);


-- ════════════════════════════════════════════════════════════════
-- SELL-X COMPUTERS (NDB CC, billing ~8th, 31 remaining)
-- NDB statement: Total 36M, Rs 97,824 original, Rs 84,227 remaining, 31 months left
-- Monthly = 97,824 / 36 = Rs 2,717.33 ≈ Rs 2,717
-- Current installment in DB = Apr 8 (month 5 of 36), so months 6–36 remain
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-05-08', 'SELL-X COMPUTERS INST 6/36',  2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-06-08', 'SELL-X COMPUTERS INST 7/36',  2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-07-08', 'SELL-X COMPUTERS INST 8/36',  2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-08-08', 'SELL-X COMPUTERS INST 9/36',  2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-09-08', 'SELL-X COMPUTERS INST 10/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-10-08', 'SELL-X COMPUTERS INST 11/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-11-08', 'SELL-X COMPUTERS INST 12/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-12-08', 'SELL-X COMPUTERS INST 13/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-01-08', 'SELL-X COMPUTERS INST 14/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-02-08', 'SELL-X COMPUTERS INST 15/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-03-08', 'SELL-X COMPUTERS INST 16/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-04-08', 'SELL-X COMPUTERS INST 17/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-05-08', 'SELL-X COMPUTERS INST 18/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-06-08', 'SELL-X COMPUTERS INST 19/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-07-08', 'SELL-X COMPUTERS INST 20/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-08-08', 'SELL-X COMPUTERS INST 21/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-09-08', 'SELL-X COMPUTERS INST 22/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-10-08', 'SELL-X COMPUTERS INST 23/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-11-08', 'SELL-X COMPUTERS INST 24/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-12-08', 'SELL-X COMPUTERS INST 25/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-01-08', 'SELL-X COMPUTERS INST 26/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-02-08', 'SELL-X COMPUTERS INST 27/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-03-08', 'SELL-X COMPUTERS INST 28/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-04-08', 'SELL-X COMPUTERS INST 29/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-05-08', 'SELL-X COMPUTERS INST 30/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-06-08', 'SELL-X COMPUTERS INST 31/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-07-08', 'SELL-X COMPUTERS INST 32/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-08-08', 'SELL-X COMPUTERS INST 33/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-09-08', 'SELL-X COMPUTERS INST 34/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-10-08', 'SELL-X COMPUTERS INST 35/36', 2717.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-11-08', 'SELL-X COMPUTERS INST 36/36', 2717.00, 'Other', 'NDB Credit Card', 0);


-- ════════════════════════════════════════════════════════════════
-- 1 PRO MART PVT LTD (NDB CC, billing ~16th, 22 remaining)
-- NDB statement: Total 25M, Rs 56,200 original, Rs 49,456 remaining, 22 months left
-- Monthly = 56,200 / 25 = Rs 2,248
-- Current installment in DB = Mar 16 (month 3 of 25), so months 4–25 remain
-- ════════════════════════════════════════════════════════════════
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer) VALUES
(1, '2026-04-16', '1 PRO MART PVT LTD INST 4/25',  2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-05-16', '1 PRO MART PVT LTD INST 5/25',  2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-06-16', '1 PRO MART PVT LTD INST 6/25',  2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-07-16', '1 PRO MART PVT LTD INST 7/25',  2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-08-16', '1 PRO MART PVT LTD INST 8/25',  2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-09-16', '1 PRO MART PVT LTD INST 9/25',  2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-10-16', '1 PRO MART PVT LTD INST 10/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-11-16', '1 PRO MART PVT LTD INST 11/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2026-12-16', '1 PRO MART PVT LTD INST 12/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-01-16', '1 PRO MART PVT LTD INST 13/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-02-16', '1 PRO MART PVT LTD INST 14/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-03-16', '1 PRO MART PVT LTD INST 15/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-04-16', '1 PRO MART PVT LTD INST 16/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-05-16', '1 PRO MART PVT LTD INST 17/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-06-16', '1 PRO MART PVT LTD INST 18/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-07-16', '1 PRO MART PVT LTD INST 19/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-08-16', '1 PRO MART PVT LTD INST 20/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-09-16', '1 PRO MART PVT LTD INST 21/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-10-16', '1 PRO MART PVT LTD INST 22/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-11-16', '1 PRO MART PVT LTD INST 23/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2027-12-16', '1 PRO MART PVT LTD INST 24/25', 2248.00, 'Other', 'NDB Credit Card', 0),
(1, '2028-01-16', '1 PRO MART PVT LTD INST 25/25', 2248.00, 'Other', 'NDB Credit Card', 0);


COMMIT;
```

---

## How to Run on Railway

Option A — Railway shell (fastest):
```bash
# In Railway → your backend service → Shell tab
cd /app
sqlite3 finance_tracker.db < installment_migration.sql
```

Option B — Alembic migration (recommended, keeps history clean):

Create `backend/alembic/versions/o2p3q4r5s6t7_add_future_installments.py`:

```python
"""Add all future installment plan entries

Revision ID: o2p3q4r5s6t7
Revises: 9d6968563db4
Create Date: 2026-04-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'o2p3q4r5s6t7'
down_revision = '9d6968563db4'

def upgrade():
    bind = op.get_bind()

    # Get user ID
    row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not row:
        return
    uid = row[0]

    # Remove ABANS ELITE double-count
    bind.execute(sa.text("DELETE FROM expenses WHERE id = 148"))

    # All future installments
    entries = [
        # LUXURY X Plan A — Sampath (1 remaining)
        (uid, '2026-04-06', 'LUXURY X - 24M INSTALLMENT 24/24', 19583.33, 'Other', 'Sampath Credit Card'),

        # LUXURY X Plan B — Sampath (16 remaining)
        (uid, '2026-04-19', 'LUXURY X - 24M INSTALLMENT 9/24',  19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-05-19', 'LUXURY X - 24M INSTALLMENT 10/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-06-19', 'LUXURY X - 24M INSTALLMENT 11/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-07-19', 'LUXURY X - 24M INSTALLMENT 12/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-08-19', 'LUXURY X - 24M INSTALLMENT 13/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-09-19', 'LUXURY X - 24M INSTALLMENT 14/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-10-19', 'LUXURY X - 24M INSTALLMENT 15/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-11-19', 'LUXURY X - 24M INSTALLMENT 16/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-12-19', 'LUXURY X - 24M INSTALLMENT 17/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-01-19', 'LUXURY X - 24M INSTALLMENT 18/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-02-19', 'LUXURY X - 24M INSTALLMENT 19/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-03-19', 'LUXURY X - 24M INSTALLMENT 20/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-04-19', 'LUXURY X - 24M INSTALLMENT 21/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-05-19', 'LUXURY X - 24M INSTALLMENT 22/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-06-19', 'LUXURY X - 24M INSTALLMENT 23/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-07-19', 'LUXURY X - 24M INSTALLMENT 24/24', 19028.50, 'Other', 'Sampath Credit Card'),

        # LUXURY X Plan C — NTB AMEX (6 remaining)
        (uid, '2026-04-30', 'LUXURY X INST 7/12',  14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-05-31', 'LUXURY X INST 8/12',  14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-06-30', 'LUXURY X INST 9/12',  14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-07-31', 'LUXURY X INST 10/12', 14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-08-31', 'LUXURY X INST 11/12', 14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-09-30', 'LUXURY X INST 12/12', 14333.33, 'Other', 'NTB AMEX Credit Card'),

        # UNITY SYSTEMS — NTB AMEX (7 remaining)
        (uid, '2026-04-28', 'UNITY SYSTEMS SOLUTIONS INST 6/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-05-28', 'UNITY SYSTEMS SOLUTIONS INST 7/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-06-28', 'UNITY SYSTEMS SOLUTIONS INST 8/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-07-28', 'UNITY SYSTEMS SOLUTIONS INST 9/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-08-28', 'UNITY SYSTEMS SOLUTIONS INST 10/12', 9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-09-28', 'UNITY SYSTEMS SOLUTIONS INST 11/12', 9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-10-28', 'UNITY SYSTEMS SOLUTIONS INST 12/12', 9441.67, 'Other', 'NTB AMEX Credit Card'),

        # ABANS ELITE — Sampath (19 remaining: 2/20–20/20)
        (uid, '2026-04-01', 'ABANS ELITE - 20M INSTALLMENT 2/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-05-01', 'ABANS ELITE - 20M INSTALLMENT 3/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-06-01', 'ABANS ELITE - 20M INSTALLMENT 4/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-07-01', 'ABANS ELITE - 20M INSTALLMENT 5/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-08-01', 'ABANS ELITE - 20M INSTALLMENT 6/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-09-01', 'ABANS ELITE - 20M INSTALLMENT 7/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-10-01', 'ABANS ELITE - 20M INSTALLMENT 8/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-11-01', 'ABANS ELITE - 20M INSTALLMENT 9/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-12-01', 'ABANS ELITE - 20M INSTALLMENT 10/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-01-01', 'ABANS ELITE - 20M INSTALLMENT 11/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-02-01', 'ABANS ELITE - 20M INSTALLMENT 12/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-03-01', 'ABANS ELITE - 20M INSTALLMENT 13/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-04-01', 'ABANS ELITE - 20M INSTALLMENT 14/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-05-01', 'ABANS ELITE - 20M INSTALLMENT 15/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-06-01', 'ABANS ELITE - 20M INSTALLMENT 16/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-07-01', 'ABANS ELITE - 20M INSTALLMENT 17/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-08-01', 'ABANS ELITE - 20M INSTALLMENT 18/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-09-01', 'ABANS ELITE - 20M INSTALLMENT 19/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-10-01', 'ABANS ELITE - 20M INSTALLMENT 20/20', 2999.95, 'Other', 'Sampath Credit Card'),

        # SELL-X COMPUTERS — NDB (31 remaining: 6/36–36/36, billing ~8th)
        (uid, '2026-05-08', 'SELL-X COMPUTERS INST 6/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-06-08', 'SELL-X COMPUTERS INST 7/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-07-08', 'SELL-X COMPUTERS INST 8/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-08-08', 'SELL-X COMPUTERS INST 9/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-09-08', 'SELL-X COMPUTERS INST 10/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-10-08', 'SELL-X COMPUTERS INST 11/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-11-08', 'SELL-X COMPUTERS INST 12/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-12-08', 'SELL-X COMPUTERS INST 13/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-01-08', 'SELL-X COMPUTERS INST 14/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-02-08', 'SELL-X COMPUTERS INST 15/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-03-08', 'SELL-X COMPUTERS INST 16/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-04-08', 'SELL-X COMPUTERS INST 17/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-05-08', 'SELL-X COMPUTERS INST 18/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-06-08', 'SELL-X COMPUTERS INST 19/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-07-08', 'SELL-X COMPUTERS INST 20/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-08-08', 'SELL-X COMPUTERS INST 21/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-09-08', 'SELL-X COMPUTERS INST 22/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-10-08', 'SELL-X COMPUTERS INST 23/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-11-08', 'SELL-X COMPUTERS INST 24/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-12-08', 'SELL-X COMPUTERS INST 25/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-01-08', 'SELL-X COMPUTERS INST 26/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-02-08', 'SELL-X COMPUTERS INST 27/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-03-08', 'SELL-X COMPUTERS INST 28/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-04-08', 'SELL-X COMPUTERS INST 29/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-05-08', 'SELL-X COMPUTERS INST 30/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-06-08', 'SELL-X COMPUTERS INST 31/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-07-08', 'SELL-X COMPUTERS INST 32/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-08-08', 'SELL-X COMPUTERS INST 33/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-09-08', 'SELL-X COMPUTERS INST 34/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-10-08', 'SELL-X COMPUTERS INST 35/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-11-08', 'SELL-X COMPUTERS INST 36/36', 2717.00, 'Other', 'NDB Credit Card'),

        # 1 PRO MART PVT LTD — NDB (22 remaining: 4/25–25/25, billing ~16th)
        (uid, '2026-04-16', '1 PRO MART PVT LTD INST 4/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-05-16', '1 PRO MART PVT LTD INST 5/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-06-16', '1 PRO MART PVT LTD INST 6/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-07-16', '1 PRO MART PVT LTD INST 7/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-08-16', '1 PRO MART PVT LTD INST 8/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-09-16', '1 PRO MART PVT LTD INST 9/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-10-16', '1 PRO MART PVT LTD INST 10/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-11-16', '1 PRO MART PVT LTD INST 11/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-12-16', '1 PRO MART PVT LTD INST 12/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-01-16', '1 PRO MART PVT LTD INST 13/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-02-16', '1 PRO MART PVT LTD INST 14/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-03-16', '1 PRO MART PVT LTD INST 15/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-04-16', '1 PRO MART PVT LTD INST 16/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-05-16', '1 PRO MART PVT LTD INST 17/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-06-16', '1 PRO MART PVT LTD INST 18/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-07-16', '1 PRO MART PVT LTD INST 19/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-08-16', '1 PRO MART PVT LTD INST 20/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-09-16', '1 PRO MART PVT LTD INST 21/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-10-16', '1 PRO MART PVT LTD INST 22/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-11-16', '1 PRO MART PVT LTD INST 23/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-12-16', '1 PRO MART PVT LTD INST 24/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-01-16', '1 PRO MART PVT LTD INST 25/25', 2248.00, 'Other', 'NDB Credit Card'),
    ]

    for e in entries:
        try:
            bind.execute(sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer)
                VALUES (:uid, :date, :desc, :amt, :cat, :acct, 0)
            """), {"uid": e[0], "date": e[1], "desc": e[2], "amt": e[3], "cat": e[4], "acct": e[5]})
        except Exception as ex:
            print(f"Skipping duplicate: {e[2]} {e[1]} — {ex}")

def downgrade():
    bind = op.get_bind()
    bind.execute(sa.text("""
        DELETE FROM expenses
        WHERE description LIKE 'LUXURY X%INST%'
           OR description LIKE 'UNITY SYSTEMS%INST%'
           OR description LIKE 'ABANS ELITE%INST%'
           OR description LIKE 'SELL-X COMPUTERS INST%'
           OR description LIKE '1 PRO MART%INST%'
    """))
```

---

## After Running — What Changes in Your Dashboard

| Metric | Before | After |
|--------|--------|-------|
| Future months' spending visibility | Only current month | Full schedule through Nov 2028 |
| Feb spending (ABANS double-count removed) | Rs 59,999 inflated | Correct |
| 6-month cash flow chart accuracy | Missing installment load | Accurate committed spend |
| Debt advisor projections | Understated outflows | Realistic payoff timeline |
| Monthly installment burden visible | Rs 0 in projections | **Rs 71,352/month** shown |

---

*Every date used matches the billing day observed in the existing DB entries. If any bank shifts the billing date by a day or two, update the affected rows via the app's expense edit screen.*
