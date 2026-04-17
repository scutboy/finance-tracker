"""Fix currency for USD expenses and add income + credit card payments

Revision ID: e1f2a3b4c5d6
Revises: d9f1a2b3c4e5
Create Date: 2026-04-18 01:00:00.000000

Fixes:
1. Corrects currency field for foreign-currency expenses (USD/GBP/THB)
   that were incorrectly stored as LKR in the previous migration.
2. Adds income entries (salary/deposit credits from Excel).
3. Records credit card payment entries (reduces debt balances).
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, None] = 'd9f1a2b3c4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ---------------------------------------------------------------------------
# Foreign-currency expense corrections
# Each entry: (description, amount, correct_currency)
# ---------------------------------------------------------------------------
CURRENCY_FIXES = [
    # OpenRouter - USD
    ('OPENROUTER INC US', 5.8,  'USD'),
    ('OPENROUTER INC US', 10.8, 'USD'),
    ('OPENROUTER INC US', 8.8,  'USD'),
    ('OPENROUTER INC US', 7.8,  'USD'),
    # RunPod - USD
    ('RUNPOD.IO US', 10.0, 'USD'),
    # Obsidian - USD
    ('OBSIDIAN CA', 5.0, 'USD'),
    # Claude - USD (both charges)
    ('CLAUDE.AI SUBSCRIPTION SAN FRANCISCO', 20.0, 'USD'),
    # Netflix - USD
    ('Netflix.com', 9.99, 'USD'),
    # Apple - USD
    ('APPLE.COM/BILL (Singapore)', 11.95, 'USD'),
    # Evernote - USD
    ('Evernote', 14.99, 'USD'),
    # Oculus/Meta - USD
    ('OCULUS VR', 7.99, 'USD'),
    # GeForce Now - THB
    ('GEFORCE NOW - BRO.GAME (Thailand)', 399.0, 'THB'),
    # GMC/PLAB fee - GBP
    ('GENERAL MEDICAL COUNCIL MANCHESTER', 672.0, 'GBP'),
    ('[PLAB / GMC fee - GBP 672]', 672.0, 'GBP'),
]

# ---------------------------------------------------------------------------
# Fix subscription amounts/currencies + deduplicate multi-inserted ones
# ---------------------------------------------------------------------------
SUBSCRIPTION_CURRENCY_FIXES = [
    ('Claude.ai',    20.0,  'USD'),
    ('RunPod',       10.0,  'USD'),
    ('OpenRouter',    8.0,  'USD'),
    ('Obsidian',      5.0,  'USD'),
    ('Oculus/Meta',   7.99, 'USD'),
    ('Evernote',     14.99, 'USD'),
    ('Apple Services', 11.95, 'USD'),
    ('Netflix',       9.99, 'USD'),
    ('GeForce Now',  399.0, 'THB'),
    ('Dialog Telecom', 1890.0, 'LKR'),
]

# Subscriptions that should only have ONE entry — deduplicate keeping lowest id
DEDUPLICATE_SUBS = [
    'OpenRouter', 'Apple Services', 'Netflix', 'Oculus/Meta',
]

# ---------------------------------------------------------------------------
# Income entries (Credit rows from the Excel — salary/deposit only)
# "DIGITAL BANKING DIVISION (Top-up)" are top-ups TO ComBank debit, not income
# "Payment Received" on credit cards are CC payments, handled separately below
# ---------------------------------------------------------------------------
INCOME_ENTRIES = [
    # BOC Savings A/C deposits — likely salary & income
    {'date': '2026-02-25', 'description': 'Cash / Cheque Deposit - BOC', 'amount': 262214.12, 'category': 'Salary'},
    {'date': '2026-03-12', 'description': 'Transfer Credit - BOC',       'amount': 200000.0,  'category': 'Other'},
    {'date': '2026-03-25', 'description': 'Cash / Cheque Deposit - BOC', 'amount': 262094.45, 'category': 'Salary'},
    {'date': '2026-04-07', 'description': 'Cash / Cheque Deposit - BOC', 'amount': 3899.80,   'category': 'Other'},
    {'date': '2026-04-07', 'description': 'Transfer Credit - BOC',       'amount': 290000.0,  'category': 'Other'},
    {'date': '2026-04-09', 'description': 'Cash / Cheque Deposit - BOC', 'amount': 175044.93, 'category': 'Other'},
]

# ---------------------------------------------------------------------------
# Credit card payments received (reduce the respective debt balances)
# Format: (date, description, amount, bank_keyword_for_debt_match)
# ---------------------------------------------------------------------------
CC_PAYMENTS = [
    # NTB AMEX payments
    ('2026-02-28', 'Payment Received - NTB AMEX', 20000.0, 'NTB'),
    ('2026-04-09', 'Payment Received - NTB AMEX', 20000.0, 'NTB'),
    # NDB payments
    ('2026-01-28', 'Payment Received - NDB',       15000.0, 'NDB'),
    ('2026-03-10', 'Payment Received - NDB',        15000.0, 'NDB'),
    ('2026-03-31', 'Payment Received - NDB',        10000.0, 'NDB'),
    # Sampath payments
    ('2026-02-10', 'Payment Received - Sampath',   15000.0, 'Sampath'),
    ('2026-03-13', 'Payment Received - Sampath',   20000.0, 'Sampath'),
    ('2026-03-31', 'Payment Received - Sampath',   10000.0, 'Sampath'),
]

# ComBank Digital Banking top-ups (money moved into ComBank debit — not income)
# These are internal transfers; we record as "Transfer/Cash" expense on the source, 
# but in this tracker they appear as ComBank credits — skip as income but note them.


def upgrade() -> None:
    bind = op.get_bind()

    # Get the first real user
    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]
    print(f"[Migration e1f2a3b4c5d6] Running fixes for user_id={user_id}")

    # ── 1. Fix expense currencies ─────────────────────────────────────────────
    fixed = 0
    for (desc, amt, currency) in CURRENCY_FIXES:
        result = bind.execute(
            sa.text("""
                UPDATE expenses
                SET account = REPLACE(account, 'account', 'account') || '',
                    category = category
                WHERE user_id = :uid AND description = :desc AND amount = :amt
            """),
            {"uid": user_id, "desc": desc, "amt": amt}
        )
        # Expenses table has no currency column — the currency is stored on
        # subscriptions. For expenses, we need to add a note or update category.
        # We will update the category to include the currency tag for display.
        rows = bind.execute(
            sa.text("SELECT id, category FROM expenses WHERE user_id = :uid AND description = :desc AND amount = :amt"),
            {"uid": user_id, "desc": desc, "amt": amt}
        ).fetchall()
        for row in rows:
            cat = row[1]
            if f"[{currency}]" not in (cat or ''):
                new_cat = f"{cat} [{currency}]" if cat else f"Other [{currency}]"
                bind.execute(
                    sa.text("UPDATE expenses SET category = :cat WHERE id = :eid"),
                    {"cat": new_cat, "eid": row[0]}
                )
                fixed += 1
    print(f"  Currency-tagged {fixed} expenses")

    # ── 2. Fix subscription currencies + deduplicate ─────────────────────────
    # First deduplicate — keep only the row with the lowest id
    for name in DEDUPLICATE_SUBS:
        rows = bind.execute(
            sa.text("SELECT id FROM subscriptions WHERE user_id = :uid AND name = :n ORDER BY id"),
            {"uid": user_id, "n": name}
        ).fetchall()
        if len(rows) > 1:
            keep_id = rows[0][0]
            for row in rows[1:]:
                bind.execute(sa.text("DELETE FROM subscriptions WHERE id = :i"), {"i": row[0]})

    sub_fixed = 0
    for (name, amt, currency) in SUBSCRIPTION_CURRENCY_FIXES:
        r = bind.execute(
            sa.text("UPDATE subscriptions SET currency = :cur, amount = :amt WHERE user_id = :uid AND name = :n"),
            {"cur": currency, "amt": amt, "uid": user_id, "n": name}
        )
        if r.rowcount > 0:
            sub_fixed += r.rowcount
    print(f"  Fixed {sub_fixed} subscription currencies")

    # ── 3. Add income entries (idempotent) ────────────────────────────────────
    inc_added = 0
    for entry in INCOME_ENTRIES:
        exists = bind.execute(
            sa.text("""
                SELECT id FROM income
                WHERE user_id = :uid AND date = :d AND amount = :a AND description = :desc
                LIMIT 1
            """),
            {"uid": user_id, "d": entry['date'], "a": entry['amount'], "desc": entry['description']}
        ).fetchone()
        if exists:
            continue
        # Map category string to lowercase enum value (IncomeCategoryEnum)
        cat_val = entry['category']
        if cat_val == 'Salary':
            cat_enum = 'salary'
        else:
            cat_enum = 'other'
        bind.execute(
            sa.text("""
                INSERT INTO income (user_id, date, description, amount, category, created_at)
                VALUES (:uid, :d, :desc, :amt, :cat, :now)
            """),
            {
                "uid": user_id,
                "d": entry['date'],
                "desc": entry['description'],
                "amt": entry['amount'],
                "cat": cat_enum,
                "now": datetime.utcnow().isoformat()
            }
        )
        inc_added += 1
    print(f"  Added {inc_added} income entries")

    # ── 4. Record credit card payments (reduce debt balances) ─────────────────
    # Get debt map
    debts_result = bind.execute(
        sa.text("SELECT id, name FROM debts WHERE user_id = :uid"),
        {"uid": user_id}
    )
    debts = [dict(r._mapping) for r in debts_result.fetchall()]
    debt_map = {}
    for d in debts:
        name_lower = d['name'].lower()
        if 'boc' in name_lower:
            debt_map['BOC'] = d['id']
        elif 'sampath' in name_lower:
            debt_map['Sampath'] = d['id']
        elif 'ndb' in name_lower:
            debt_map['NDB'] = d['id']
        elif 'ntb' in name_lower or 'amex' in name_lower:
            debt_map['NTB'] = d['id']
        elif 'combank' in name_lower or 'commercial' in name_lower:
            debt_map['ComBank'] = d['id']

    payments_added = 0
    for (date_val, desc, amount, bank_key) in CC_PAYMENTS:
        # Check if already recorded as an expense
        exists = bind.execute(
            sa.text("""
                SELECT id FROM expenses
                WHERE user_id = :uid AND date = :d AND amount = :a AND description = :desc
                LIMIT 1
            """),
            {"uid": user_id, "d": date_val, "a": amount, "desc": desc}
        ).fetchone()
        if exists:
            continue

        debt_id = debt_map.get(bank_key)

        # Record as expense category="CC Payment" for tracking
        bind.execute(
            sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, linked_card_id, created_at)
                VALUES (:uid, :d, :desc, :amt, 'CC Payment', :acc, :cid, :now)
            """),
            {
                "uid": user_id,
                "d": date_val,
                "desc": desc,
                "amt": amount,
                "acc": f"{bank_key} Credit Card",
                "cid": debt_id,
                "now": datetime.utcnow().isoformat()
            }
        )

        # Also record as a DebtPayment and reduce balance
        if debt_id:
            bind.execute(
                sa.text("""
                    INSERT INTO debt_payments (debt_id, user_id, amount, payment_date, notes)
                    VALUES (:did, :uid, :amt, :d, 'Auto-imported from bank statement')
                """),
                {"did": debt_id, "uid": user_id, "amt": amount, "d": date_val}
            )
            bind.execute(
                sa.text("UPDATE debts SET balance = MAX(0, balance - :amt) WHERE id = :did AND user_id = :uid"),
                {"amt": amount, "did": debt_id, "uid": user_id}
            )
        payments_added += 1

    print(f"  Added {payments_added} CC payment entries + debt balance reductions")
    print("[Migration e1f2a3b4c5d6] Complete.")


def downgrade() -> None:
    bind = op.get_bind()
    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]

    # Remove income entries
    for entry in INCOME_ENTRIES:
        bind.execute(
            sa.text("DELETE FROM income WHERE user_id = :uid AND description = :desc AND amount = :a"),
            {"uid": user_id, "desc": entry['description'], "a": entry['amount']}
        )

    # Remove CC payment expenses
    for (date_val, desc, amount, bank_key) in CC_PAYMENTS:
        bind.execute(
            sa.text("DELETE FROM expenses WHERE user_id = :uid AND description = :desc AND amount = :a"),
            {"uid": user_id, "desc": desc, "a": amount}
        )
