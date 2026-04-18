# Installment Plan Audit + SMS Inbox Plan
**Prepared:** 18 April 2026  
**Sources:** Bank Statements folder (BOC CC, NDB CC×2, Sampath CC, AMEX CSV) vs `finance_tracker.db`

---

## Part A — Installment Plan Issues Found

### Issue 1 🔴 — ABANS ELITE Double-Counted (Rs 59,999 phantom expense)

The full appliance purchase price AND the first installment are both in the database:

| ID | Date | Description | Amount |
|----|------|-------------|--------|
| 148 | 28 Feb | ABANS ELITE - 20M (appliance) | Rs 59,999.00 ← **DELETE THIS** |
| 241 | 1 Mar | ABANS ELITE - 20M INSTALLMENT 1/20 | Rs 2,999.95 ← keep |

The bank charged you Rs 2,999.95/month — it never charged the full Rs 59,999 as a lump sum. ID:148 is the original import label before the installment plan was identified. It's inflating your February spending by Rs 59,999.

**Fix:**
```sql
DELETE FROM expenses WHERE id = 148;
```

**What's missing:** Installments 2/20 through 20/20 (Rs 2,999.95 × 19 = Rs 56,999.05 remaining) are not tracked anywhere. Add to subscriptions or installment plan tracker.

---

### Issue 2 🟠 — LUXURY X: Three Separate Plans Across Two Cards

Cross-referencing statements against the DB reveals three active LUXURY X plans:

| Card | Installment | Monthly | Remaining | Remaining Amount |
|------|------------|---------|-----------|-----------------|
| Sampath CC | **23/24** | Rs 19,583.33 | **1 more** | ~Rs 19,583 |
| Sampath CC | **8/24** | Rs 19,028.50 | **16 more** | ~Rs 304,456 |
| NTB AMEX | **6/12** | Rs 14,333.33 | **6 more** | Rs 86,000 (confirmed from statement) |

The 23/24 plan on Sampath is almost done — **one payment left**, then it drops off. The 8/24 plan runs for another 16 months. The AMEX 6/12 runs 6 more months.

**Verify:** Confirm with your Sampath statement that these are genuinely two separate purchases and not a duplicate import. The amounts differ (Rs 19,583 vs Rs 19,028) which suggests they are different items.

---

### Issue 3 ✅ — POSTGRADUATE INSTITUTE: Completed

INST 12/12 appeared in March. This plan is **done** — no more payments. No action needed in the DB but the entry should be categorised as `Education` not left as `Other`.

```sql
UPDATE expenses SET category = 'Education' WHERE id = 253;
```

---

### Issue 4 🟠 — UNITY SYSTEMS SOLUTIONS: 7 Months Untracked

| What statement shows | What DB has |
|---------------------|-------------|
| INST 5/12, remaining Rs 66,091.65 | Only INST 5 recorded (Mar 28) |
| Rs 9,441.67/month for 7 more months | Months 6–12 not in DB |

**7 upcoming installments worth Rs 66,091.69 are invisible to budget projections.**

---

### Issue 5 🟠 — NDB Installments: Future Months Untracked

From NDB e-statement:

| Plan | Monthly | Remaining Months | Remaining Amount |
|------|---------|-----------------|-----------------|
| Sell-X Computers | Rs 2,717 | **31 months** | Rs 84,227 |
| 1 PRO MART PVT LTD | Rs 2,248 | **22 months** | Rs 49,456 |
| BARA AUTO | Rs 2,998 + Rs 360 fee | **unknown** | unknown |

Only one month's entry exists for each. Rs 133,683 of committed future spend is invisible.

---

### Issue 6 🟡 — Installment Plans Missing From Subscriptions Table

None of the active installment plans appear in the `subscriptions` table. This means:
- The debt advisor can't project their impact on cash flow
- The dashboard "subscription overhead" card doesn't include them
- Budget projections are understated by ~Rs 52,000/month in committed installments

**Total committed monthly installment load:**

| Plan | Card | Monthly |
|------|------|---------|
| LUXURY X (23/24) | Sampath | Rs 19,583 — ends next month |
| LUXURY X (8/24) | Sampath | Rs 19,029 — 16 months left |
| LUXURY X (6/12) | NTB AMEX | Rs 14,333 — 6 months left |
| UNITY SYSTEMS (5/12) | NTB AMEX | Rs 9,442 — 7 months left |
| SELL-X Computers | NDB | Rs 2,717 — 31 months left |
| 1 PRO MART | NDB | Rs 2,248 — 22 months left |
| BARA AUTO | NDB | Rs 3,358 — ? months left |
| ABANS ELITE (1/20) | Sampath | Rs 3,000 — 19 months left |
| **TOTAL** | | **Rs 73,710/month** |

---

## Part A — SQL Fix Script

```sql
-- Run with backup first:
-- sqlite3 finance_tracker.db ".backup finance_tracker_backup_installments.db"

-- Fix 1: Remove ABANS ELITE double-count
DELETE FROM expenses WHERE id = 148;

-- Fix 2: Fix POSTGRADUATE INSTITUTE category
UPDATE expenses SET category = 'Education' WHERE id = 253;

-- Fix 3: Add UNITY SYSTEMS remaining installments (months 6–12)
-- Replace user_id = 1 with your actual user ID
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer)
VALUES
  (1, '2026-04-28', 'UNITY SYSTEMS SOLUTIONS INST 6/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-05-28', 'UNITY SYSTEMS SOLUTIONS INST 7/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-06-28', 'UNITY SYSTEMS SOLUTIONS INST 8/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-07-28', 'UNITY SYSTEMS SOLUTIONS INST 9/12',  9441.67, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-08-28', 'UNITY SYSTEMS SOLUTIONS INST 10/12', 9441.67, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-09-28', 'UNITY SYSTEMS SOLUTIONS INST 11/12', 9441.67, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-10-28', 'UNITY SYSTEMS SOLUTIONS INST 12/12', 9441.67, 'Other', 'NTB AMEX Credit Card', 0);

-- Fix 4: Add LUXURY X AMEX remaining installments (months 7–12)
INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer)
VALUES
  (1, '2026-04-30', 'LUXURY X INST 7/12',  14333.33, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-05-31', 'LUXURY X INST 8/12',  14333.33, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-06-30', 'LUXURY X INST 9/12',  14333.33, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-07-31', 'LUXURY X INST 10/12', 14333.33, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-08-31', 'LUXURY X INST 11/12', 14333.33, 'Other', 'NTB AMEX Credit Card', 0),
  (1, '2026-09-30', 'LUXURY X INST 12/12', 14333.33, 'Other', 'NTB AMEX Credit Card', 0);
```

> **Note:** Before inserting the NDB future installments (Sell-X, PRO MART, BARA AUTO), confirm the exact billing date each month from your NDB statement — insert once you have the day number.

---

## Part B — SMS Inbox (Manual Feed Point)

A single page in the app where you paste any SMS messages — one or many, any bank — and the system processes them all at once.

### How It Works

```
Paste raw SMS text (any mix of banks)
           ↓
POST /api/sms/parse-and-preview
           ↓
Returns: classified transactions with confidence score
           ↓
You review, fix any wrong classifications
           ↓
POST /api/sms/confirm  →  saved to DB
```

### Backend — Two Endpoints

**1. `POST /api/sms/parse-and-preview`**
```python
# New file: backend/app/api/endpoints/sms_inbox.py

import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user

router = APIRouter()

BANK_PATTERNS = [
    {
        "bank": "BOC",
        "account": "BOC Current Account",
        "type": "expense",
        "pattern": re.compile(
            r"Rs\.([\d,]+\.\d{2}) debited.*?(\d{2}/\d{2}/\d{4}).*?at (.+?)(?:\n|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3}
    },
    {
        "bank": "BOC_CREDIT",
        "account": "BOC Current Account",
        "type": "income",
        "pattern": re.compile(
            r"Rs\.([\d,]+\.\d{2}) credited.*?(\d{2}/\d{2}/\d{4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": None}
    },
    {
        "bank": "ComBank",
        "account": "ComBank Debit Card",
        "type": "expense",
        "pattern": re.compile(
            r"LKR ([\d,]+\.?\d*) debited from A/C ending (\d{4}) on (\d{2}/\d{2}/\d{4}) at (.+)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 3, "description": 4}
    },
    {
        "bank": "ComBank_CREDIT",
        "account": "ComBank Debit Card",
        "type": "income",
        "pattern": re.compile(
            r"LKR ([\d,]+\.?\d*) credited to A/C ending (\d{4}) on (\d{2}/\d{2}/\d{4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 3, "description": None}
    },
    {
        "bank": "Sampath",
        "account": "Sampath Credit Card",
        "type": "expense",
        "pattern": re.compile(
            r"Rs\.([\d,]+\.\d{2}) has been debited from your Sampath.*?(\d{2}-\w{3}-\d{4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": None}
    },
    {
        "bank": "NDB",
        "account": "NDB Credit Card",
        "type": "expense",
        "pattern": re.compile(
            r"NDB.*?Rs\.([\d,]+\.\d{2}).*?(\d{2}/\d{2}/\d{4}).*?at (.+?)(?:\n|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3}
    },
]

TRANSFER_KEYWORDS = [
    'digital banking division', 'ceft', 'personal transfer',
    'boc transfer', 'online transfer', 'internet transfer'
]

def classify_type(description: str, base_type: str) -> str:
    desc_lower = description.lower()
    if any(kw in desc_lower for kw in TRANSFER_KEYWORDS):
        return "transfer"
    return base_type

@router.post("/parse-and-preview")
def parse_sms_preview(payload: dict, current_user=Depends(get_current_user)):
    raw = payload.get("raw_text", "")
    results = []
    lines = [l.strip() for l in raw.splitlines() if l.strip()]
    full_text = " ".join(lines)

    for p in BANK_PATTERNS:
        for match in p["pattern"].finditer(full_text):
            g = p["groups"]
            amount_str = match.group(g["amount"]).replace(",", "")
            amount = float(amount_str)
            date_str = match.group(g["date"])
            description = match.group(g["description"]).strip() if g["description"] else p["bank"] + " transaction"
            txn_type = classify_type(description, p["type"])
            results.append({
                "bank": p["bank"],
                "account": p["account"],
                "type": txn_type,
                "date": date_str,
                "description": description,
                "amount": amount,
                "confidence": "high",
                "raw": match.group(0)[:80]
            })

    return {"parsed": results, "count": len(results)}
```

**2. `POST /api/sms/confirm`**
```python
@router.post("/confirm")
def confirm_sms_transactions(
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    saved = 0
    for txn in payload.get("transactions", []):
        if txn["type"] == "expense":
            db.add(models.Expense(
                user_id=current_user.id,
                date=txn["date"],
                description=txn["description"],
                amount=txn["amount"],
                account=txn["account"],
                category="Other",
                is_transfer=False
            ))
        elif txn["type"] == "income":
            db.add(models.Income(
                user_id=current_user.id,
                date=txn["date"],
                description=txn["description"],
                amount=txn["amount"],
                account=txn["account"],
                category="other"
            ))
        elif txn["type"] == "transfer":
            db.add(models.Transfer(
                user_id=current_user.id,
                date=txn["date"],
                from_account=txn["account"],
                to_account="Unknown",
                amount=txn["amount"],
                description=txn["description"]
            ))
        saved += 1
    db.commit()
    return {"saved": saved}
```

### Frontend — New "SMS Inbox" Page

Add to navigation alongside Expenses and Income. The page is simple:

```
┌──────────────────────────────────────────────────────────┐
│  SMS INBOX                                               │
│  Paste your bank messages — any bank, any mix            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │  Paste SMS here...                               │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                              [Process Messages →]        │
└──────────────────────────────────────────────────────────┘

After processing:
┌──────┬────────────┬──────────────────┬──────────┬────────┐
│  ✓   │  Date      │  Description     │  Amount  │  Type  │
├──────┼────────────┼──────────────────┼──────────┼────────┤
│  ✓   │  18 Apr    │  KEELLS SUPER    │  7,116   │ Expense│
│  ✓   │  18 Apr    │  Digital Banking │  35,000  │Transfer│
│  ⚠   │  17 Apr    │  [Unrecognised]  │   ???    │   ?    │
└──────┴────────────┴──────────────────┴──────────┴────────┘
                              [Save 2 confirmed]
```

### Wire Up

Add to `backend/app/api/__init__.py`:
```python
from app.api.endpoints import sms_inbox
api_router.include_router(sms_inbox.router, prefix="/sms", tags=["SMS Inbox"])
```

Add to `frontend/src/App.jsx`:
```jsx
<Route path="/sms-inbox" element={<SMSInbox />} />
```

Add to `frontend/src/components/Sidebar.jsx`:
```jsx
{ path: '/sms-inbox', label: 'SMS Inbox', icon: MessageSquare }
```

---

## Summary — What to Build/Fix

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Delete ABANS ELITE ID:148 (Rs 59,999 double-count) | 1 SQL line | Removes Rs 59,999 phantom expense |
| 2 | Fix POSTGRADUATE category to Education | 1 SQL line | Data hygiene |
| 3 | Insert UNITY SYSTEMS future installments (7 rows) | SQL above | Makes Rs 66k visible in projections |
| 4 | Insert LUXURY X AMEX future installments (6 rows) | SQL above | Makes Rs 86k visible |
| 5 | Verify LUXURY X Sampath dual-plan vs duplicate | Manual check | Potentially removes Rs 19,583 duplicate |
| 6 | Confirm BARA AUTO + NDB future installment dates | Check statement | Makes Rs 130k+ visible |
| 7 | Build SMS Inbox (2 endpoints + 1 frontend page) | ~1 day | Replaces manual entry permanently |
