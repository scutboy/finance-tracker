# SMS Inbox — Build Instructions
**Prepared:** 18 April 2026  
**Purpose:** Add a single page where you paste bank SMS messages and they get saved to the database

---

## What Gets Built

One new page — **SMS Inbox** — accessible from the sidebar. You paste any bank SMS messages (one or many, any mix of banks), hit Process, review the parsed transactions, and confirm. Done.

---

## Step 1 — Backend: New File

Create `backend/app/api/endpoints/sms_inbox.py`:

```python
import re
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import models
from app.db.database import get_db
from app.api.deps import get_current_user

router = APIRouter()

# ── Bank SMS patterns ────────────────────────────────────────────────────────

PATTERNS = [
    {
        "bank": "BOC",
        "account": "BOC Current Account",
        "type": "expense",
        "re": re.compile(
            r"Rs\.([\d,]+\.\d{2})\s+(?:has been )?debited.*?(\d{2}[-/]\w{3}[-/]\d{2,4}|\d{2}/\d{2}/\d{4}).*?(?:at|from)\s+(.+?)(?:\.|$)",
            re.IGNORECASE | re.DOTALL
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "BOC_CREDIT",
        "account": "BOC Current Account",
        "type": "income",
        "re": re.compile(
            r"Rs\.([\d,]+\.\d{2})\s+(?:has been )?credited.*?(\d{2}[-/]\w{3}[-/]\d{2,4}|\d{2}/\d{2}/\d{4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": None},
    },
    {
        "bank": "ComBank",
        "account": "ComBank Debit Card",
        "type": "expense",
        "re": re.compile(
            r"LKR\s*([\d,]+\.?\d*)\s+debited from A/C ending \d+ on (\d{2}/\d{2}/\d{4})\s+at\s+(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "ComBank_CREDIT",
        "account": "ComBank Debit Card",
        "type": "income",
        "re": re.compile(
            r"LKR\s*([\d,]+\.?\d*)\s+credited to A/C ending \d+ on (\d{2}/\d{2}/\d{4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": None},
    },
    {
        "bank": "Sampath",
        "account": "Sampath Credit Card",
        "type": "expense",
        "re": re.compile(
            r"Rs\.([\d,]+\.\d{2})\s+(?:has been )?debited from your Sampath.*?(\d{2}[-/]\w{3}[-/]\d{2,4}|\d{2}/\d{2}/\d{4}).*?(?:at|@)\s*(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "NDB",
        "account": "NDB Credit Card",
        "type": "expense",
        "re": re.compile(
            r"NDB.*?Rs\.?\s*([\d,]+\.\d{2}).*?(\d{2}/\d{2}/\d{4}).*?(?:at|@)\s*(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "NTB_AMEX",
        "account": "NTB AMEX Credit Card",
        "type": "expense",
        "re": re.compile(
            r"(?:NTB|AMEX).*?Rs\.?\s*([\d,]+\.\d{2}).*?(\d{2}/\d{2}/\d{4}).*?(?:at|@)\s*(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
]

TRANSFER_KEYWORDS = [
    'digital banking division', 'ceft', 'personal transfer',
    'boc transfer', 'online transfer', 'internet transfer',
    'fund transfer', 'interbank'
]

def parse_date(raw: str) -> str:
    """Normalise various date formats to YYYY-MM-DD."""
    raw = raw.strip()
    for fmt in ("%d/%m/%Y", "%d-%b-%Y", "%d-%b-%y", "%d/%m/%y"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return raw

def classify(description: str, base_type: str) -> str:
    desc_lower = (description or "").lower()
    if any(kw in desc_lower for kw in TRANSFER_KEYWORDS):
        return "transfer"
    return base_type


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/parse")
def parse_sms(
    payload: dict,
    current_user: models.User = Depends(get_current_user)
):
    """Parse raw SMS text and return classified transactions for preview."""
    raw = payload.get("raw_text", "")
    results = []
    seen = set()  # simple dedupe by (date, amount, description)

    for p in PATTERNS:
        for match in p["re"].finditer(raw):
            g = p["groups"]
            try:
                amount = float(match.group(g["amount"]).replace(",", ""))
                date_str = parse_date(match.group(g["date"]))
                description = (
                    match.group(g["description"]).strip()
                    if g["description"] and match.group(g["description"])
                    else p["bank"] + " transaction"
                )
            except Exception:
                continue

            key = (date_str, amount, description[:30])
            if key in seen:
                continue
            seen.add(key)

            txn_type = classify(description, p["type"])
            results.append({
                "bank": p["bank"],
                "account": p["account"],
                "type": txn_type,       # expense | income | transfer
                "date": date_str,
                "description": description[:100],
                "amount": amount,
                "category": "Other",
                "confidence": "high",
            })

    # Sort by date
    results.sort(key=lambda x: x["date"])
    return {"parsed": results, "count": len(results)}


@router.post("/confirm")
def confirm_sms(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Save confirmed transactions to the database."""
    saved, skipped = 0, 0

    for txn in payload.get("transactions", []):
        try:
            if txn["type"] == "expense":
                db.add(models.Expense(
                    user_id=current_user.id,
                    date=txn["date"],
                    description=txn["description"],
                    amount=txn["amount"],
                    category=txn.get("category", "Other"),
                    account=txn["account"],
                    is_transfer=False,
                ))
            elif txn["type"] == "income":
                db.add(models.Income(
                    user_id=current_user.id,
                    date=txn["date"],
                    description=txn["description"],
                    amount=txn["amount"],
                    category="other",
                    account=txn["account"],
                ))
            elif txn["type"] == "transfer":
                db.add(models.Transfer(
                    user_id=current_user.id,
                    date=txn["date"],
                    from_account=txn["account"],
                    to_account="Unknown",
                    amount=txn["amount"],
                    description=txn["description"],
                ))
            saved += 1
        except Exception:
            skipped += 1

    db.commit()
    return {"saved": saved, "skipped": skipped}
```

---

## Step 2 — Register the Router

In `backend/app/api/__init__.py` add two lines:

```python
# existing imports...
from app.api.endpoints import sms_inbox                          # ← add

api_router.include_router(sms_inbox.router, prefix="/sms", tags=["SMS Inbox"])  # ← add
```

---

## Step 3 — Frontend Page

Create `frontend/src/pages/SMSInbox.jsx`:

```jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { MessageSquare, ArrowDownRight, ArrowUpRight, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const TYPE_STYLES = {
  expense:  { bg: 'bg-rose-50',   text: 'text-rose-600',   label: 'Expense',  icon: ArrowDownRight },
  income:   { bg: 'bg-emerald-50',text: 'text-emerald-600',label: 'Income',   icon: ArrowUpRight },
  transfer: { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Transfer', icon: RefreshCw },
};

export default function SMSInbox() {
  const [raw, setRaw]           = useState('');
  const [parsed, setParsed]     = useState(null);
  const [selected, setSelected] = useState([]);
  const [saved, setSaved]       = useState(null);

  const parseMutation = useMutation({
    mutationFn: (text) => api.post('/sms/parse', { raw_text: text }).then(r => r.data),
    onSuccess: (data) => {
      setParsed(data.parsed);
      setSelected(data.parsed.map((_, i) => i));   // all ticked by default
      setSaved(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (txns) => api.post('/sms/confirm', { transactions: txns }).then(r => r.data),
    onSuccess: (data) => {
      setSaved(data.saved);
      setParsed(null);
      setRaw('');
    },
  });

  const toggle = (i) =>
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleConfirm = () => {
    const toSave = parsed.filter((_, i) => selected.includes(i));
    confirmMutation.mutate(toSave);
  };

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare size={22} className="text-slate-700" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900">SMS Inbox</h1>
        </div>
        <p className="text-sm text-slate-400 font-medium ml-9">
          Paste bank messages below — any bank, any mix. Review and save in one shot.
        </p>
      </div>

      {/* Success banner */}
      {saved !== null && (
        <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700">
          <CheckCircle2 size={20} />
          <span className="font-bold">{saved} transaction{saved !== 1 ? 's' : ''} saved successfully.</span>
        </div>
      )}

      {/* Input */}
      {!parsed && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <textarea
            className="w-full h-56 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder={`Paste your SMS messages here, e.g.\n\nRs.5,200.00 has been debited from your BOC account on 18/04/2026 at KEELLS SUPER\n\nLKR 262,094 credited to A/C ending 3146 on 25/03/2026 - SLIPS IN`}
            value={raw}
            onChange={e => setRaw(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              Supports: BOC · ComBank · Sampath · NDB · NTB AMEX
            </p>
            <button
              onClick={() => parseMutation.mutate(raw)}
              disabled={!raw.trim() || parseMutation.isPending}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-40"
            >
              {parseMutation.isPending ? 'Processing...' : 'Process →'}
            </button>
          </div>
          {parseMutation.isError && (
            <p className="text-rose-500 text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} /> Failed to parse. Check your connection and try again.
            </p>
          )}
        </div>
      )}

      {/* Preview table */}
      {parsed && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
            <p className="font-bold text-slate-800">
              Found <span className="text-blue-600">{parsed.length}</span> transactions
              &nbsp;·&nbsp;
              <span className="text-slate-400">{selected.length} selected</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setParsed(null); setSaved(null); }}
                className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={selected.length === 0 || confirmMutation.isPending}
                className="px-8 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-40"
              >
                {confirmMutation.isPending ? 'Saving...' : `Save ${selected.length} selected`}
              </button>
            </div>
          </div>

          {parsed.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium text-sm">
              No transactions recognised. Check the SMS format or add the pattern to the backend.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {parsed.map((txn, i) => {
                const style = TYPE_STYLES[txn.type] || TYPE_STYLES.expense;
                const Icon  = style.icon;
                const isOn  = selected.includes(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggle(i)}
                    className={`flex items-center gap-5 px-8 py-4 cursor-pointer transition-all ${isOn ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/60 opacity-50'}`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isOn ? 'bg-slate-900 border-slate-900' : 'border-slate-200'}`}>
                      {isOn && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>

                    {/* Icon */}
                    <div className={`p-2 rounded-xl ${style.bg} flex-shrink-0`}>
                      <Icon size={16} className={style.text} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{txn.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{txn.date} · {txn.account}</p>
                    </div>

                    {/* Type badge */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${style.bg} ${style.text} flex-shrink-0`}>
                      {style.label}
                    </span>

                    {/* Amount */}
                    <p className={`font-black text-base tracking-tight flex-shrink-0 ${style.text}`}>
                      {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}
                      {formatCurrency(txn.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Step 4 — Wire Into App

**`frontend/src/App.jsx`** — add two lines:

```jsx
import SMSInbox from './pages/SMSInbox';          // ← add

// inside <Route path="/" element={<Layout />}>:
<Route path="/sms-inbox" element={<SMSInbox />} />  // ← add
```

**`frontend/src/components/Sidebar.jsx`** — add to `navItems`:

```jsx
import { MessageSquare } from 'lucide-react';   // ← add to imports

// inside navItems array, after Expense Trace:
{ name: 'SMS Inbox', path: '/sms-inbox', icon: MessageSquare },
```

---

## How to Use It

1. Open **SMS Inbox** from the sidebar
2. Paste any bank SMS messages — one or fifty, any mix of banks
3. Hit **Process →**
4. Review the table — transfers are auto-flagged blue, income green, expenses red
5. Untick anything you don't want saved
6. Hit **Save X selected**

That's it. Every confirmed transaction goes straight into the correct table (expenses, income, or transfers).

---

## Adding a New Bank Pattern Later

All patterns live in `sms_inbox.py` in the `PATTERNS` list. To add a new bank, append one entry:

```python
{
    "bank": "HNB",
    "account": "HNB Account",
    "type": "expense",
    "re": re.compile(r"your pattern here", re.IGNORECASE),
    "groups": {"amount": 1, "date": 2, "description": 3},
},
```

No other changes needed — the frontend handles it automatically.
