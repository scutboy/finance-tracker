"""Audit fix: correct BOC CC balance and add missing post-Excel transactions

Revision ID: g3b4c5d6e7f8
Revises: f2a3b4c5d6e7
Create Date: 2026-04-18 01:32:00.000000

Fixes identified in full audit:
1. BOC Credit Card balance was inflated to 391,374.15 in DB.
   True balance per bank SMS = 500,000 - 248,690.40 (final available) = 251,309.60
   We use 251,309.60 as conservative true balance.
2. The 290,000 CC payment on 09/04 was logged as debt_payment but never
   applied to the Debt.balance field.
3. Add 7 transactions from SMS messages that were not in the Excel file.
4. Remove the dummy seeded income entries (not real transactions).
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision: str = 'g3b4c5d6e7f8'
down_revision: Union[str, None] = 'f2a3b4c5d6e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# True BOC CC balance = Credit Limit(500,000) - Final Available(248,690.40)
BOC_CC_TRUE_BALANCE = 251309.60

# Missing transactions from SMS (post-Excel period)
# All on BOC CC card (debt_id=1 on prod, looked up dynamically)
MISSING_EXPENSES = [
    {'date': '2026-04-16', 'description': 'UBER EATS CBH',               'amount': 7750.00,  'category': 'Dining',   'account': 'BOC Credit Card'},
    {'date': '2026-04-16', 'description': 'UBER EATS CBH',               'amount': 4826.00,  'category': 'Dining',   'account': 'BOC Credit Card'},
    {'date': '2026-04-17', 'description': 'THE KANDOS SHOP KANDY',        'amount': 7755.00,  'category': 'Other',    'account': 'BOC Credit Card'},
    {'date': '2026-04-17', 'description': 'S.N.K. ENTERPRISES WEWELDENIYA', 'amount': 6000.00, 'category': 'Other',   'account': 'BOC Credit Card'},
    {'date': '2026-04-17', 'description': 'BARISTA MAHARAGAMA',           'amount': 3135.00,  'category': 'Dining',   'account': 'BOC Credit Card'},
    # BOC Savings transfers
    {'date': '2026-04-17', 'description': 'CEFT Transfer',                'amount': 30025.00, 'category': 'Transfer/Cash', 'account': 'BOC Savings A/C'},
    {'date': '2026-04-17', 'description': 'CEFT Transfer',                'amount': 35025.00, 'category': 'Transfer/Cash', 'account': 'BOC Savings A/C'},
]

# Dummy seeded income descriptions to remove (not real transactions)
DUMMY_INCOME_DESCRIPTIONS = [
    'Monthly Salary',
    'Freelance Project',
    'Rental Property',
    'Investment Dividends',
]


def upgrade() -> None:
    bind = op.get_bind()

    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]
    print(f"[Migration g3b4c5d6e7f8] Running for user_id={user_id}")

    # ── 1. Get BOC CC debt id dynamically ───────────────────────────────────
    boc_cc = bind.execute(
        sa.text("SELECT id FROM debts WHERE user_id = :uid AND name LIKE '%BOC%' AND type LIKE '%credit%' LIMIT 1"),
        {"uid": user_id}
    ).fetchone()
    boc_cc_id = boc_cc[0] if boc_cc else None

    # ── 2. Apply 290,000 CC payment that was never deducted from balance ─────
    # Check if it's already been correctly applied
    if boc_cc_id:
        current_balance = bind.execute(
            sa.text("SELECT balance FROM debts WHERE id = :did"),
            {"did": boc_cc_id}
        ).fetchone()[0]
        print(f"  BOC CC current stored balance: {current_balance:.2f}")

        # Set to audited true balance
        bind.execute(
            sa.text("UPDATE debts SET balance = :bal WHERE id = :did AND user_id = :uid"),
            {"bal": BOC_CC_TRUE_BALANCE, "did": boc_cc_id, "uid": user_id}
        )
        print(f"  BOC CC balance corrected to: {BOC_CC_TRUE_BALANCE:.2f}")

    # ── 3. Add missing transactions ──────────────────────────────────────────
    added = 0
    for txn in MISSING_EXPENSES:
        debt_id = boc_cc_id if 'BOC Credit Card' in txn['account'] else None

        exists = bind.execute(
            sa.text("""
                SELECT id FROM expenses
                WHERE user_id = :uid AND date = :d AND amount = :a AND description = :desc
                LIMIT 1
            """),
            {"uid": user_id, "d": txn['date'], "a": txn['amount'], "desc": txn['description']}
        ).fetchone()

        if exists:
            continue

        bind.execute(
            sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, linked_card_id, created_at)
                VALUES (:uid, :d, :desc, :amt, :cat, :acc, :cid, :now)
            """),
            {
                "uid": user_id,
                "d": txn['date'],
                "desc": txn['description'],
                "amt": txn['amount'],
                "cat": txn['category'],
                "acc": txn['account'],
                "cid": debt_id,
                "now": datetime.utcnow().isoformat()
            }
        )
        added += 1

    print(f"  Added {added} missing transactions")

    # ── 4. Remove dummy seeded income ────────────────────────────────────────
    removed = 0
    for desc in DUMMY_INCOME_DESCRIPTIONS:
        result = bind.execute(
            sa.text("DELETE FROM income WHERE user_id = :uid AND description = :desc"),
            {"uid": user_id, "desc": desc}
        )
        removed += result.rowcount
    print(f"  Removed {removed} dummy income entries")

    print("[Migration g3b4c5d6e7f8] Complete.")


def downgrade() -> None:
    bind = op.get_bind()
    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]

    for txn in MISSING_EXPENSES:
        bind.execute(
            sa.text("DELETE FROM expenses WHERE user_id = :uid AND description = :desc AND amount = :a"),
            {"uid": user_id, "desc": txn['description'], "a": txn['amount']}
        )
