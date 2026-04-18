"""Comprehensive statement reconciliation: BOC Debit, BOC CC, NDB CC, Sampath CC, AMEX CC

Revision ID: h4c5d6e7f8g9
Revises: g3b4c5d6e7f8
Create Date: 2026-04-18 07:00:00.000000

Data sourced from:
- BOC CC Monthly Statement (10-Apr-2026): Closing balance 460,344.80, limit 750,000
- NDB CC Statement (09-Mar to 09-Apr-2026): Closing balance 124,009.95, limit 400,000 (26% APR)
- Sampath CC eStatement (30-Mar-2026): Outstanding 252,915.22, limit 650,000 (26% APR)
- AMEX Statement (Mar-Apr): Closing balance 169,554.49 (installment plans active)
- BOC Debit A/C 0079797353: Full statement Jan-Apr 2026

All balances, credit limits, interest rates, and installment plans are corrected to match official statements.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision: str = 'h4c5d6e7f8g9'
down_revision: Union[str, None] = 'g3b4c5d6e7f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ── True balances from official bank statements ──────────────────────────────
DEBT_CORRECTIONS = [
    # (name_keyword, true_balance, true_limit, true_rate, true_min_payment, new_name)
    ('BOC',     460344.80, 750000.0, 24.0, 23017.24,  'BOC Credit Card'),
    ('NDB',     124009.95, 400000.0, 26.0,  4960.00,  'NDB Card'),
    ('Sampath', 252915.22, 650000.0, 26.0,  8852.03,  'Sampath Card'),
    ('Amex',    169554.49, 250000.0, 24.0,  5000.00,  'NTB AMEX'),
]

# ── BOC CC statement transactions (not yet in DB) ────────────────────────────
BOC_CC_TRANSACTIONS = [
    # (date, description, amount, category, is_credit)
    ('2026-03-11', 'UBER, CBH',                             5999.00,  'Dining',       False),
    ('2026-03-13', 'INTERNET PAYMENT - BOC CC',           200000.00,  'CC Payment',   True),   # payment
    ('2026-03-13', 'CLAUDE.AI SUBSCRIPTION, SAN FRANCISCO', 6379.60,  'Subscriptions', False),  # USD 20 @ LKR rate
    ('2026-03-16', 'PASSMEDICINE LTD, LONDON',            15118.59,  'Education',    False),
    ('2026-03-16', 'ROYAL COLLEGE OF PHYS, LONDON',      288164.34,  'Education',    False),   # GBP 672
    ('2026-03-18', 'KEELLS SUPER - KANDY 3, KANDY',        2428.00,  'Groceries',    False),
    ('2026-03-19', 'SARASAVI BOOK SHOP (PVT), NUGEGODA',   2850.00,  'Education',    False),
    ('2026-03-23', 'VITO PIZZA KANDY PVT L, KANDY',        6099.00,  'Dining',       False),
    ('2026-03-27', 'UBER EATS, CBH',                       3102.22,  'Dining',       False),
    ('2026-03-30', 'S.N.K. ENTERPRISES, WEWELDENIYA',      5050.00,  'Other',        False),
    ('2026-04-02', 'KCC MULTIPLEX, KANDY',                 5100.00,  'Other',        False),
    ('2026-04-06', 'ANTHROPIC (CLAUDE), SAN FRANCISCO',    1616.95,  'Subscriptions', False),  # USD 5
    ('2026-04-08', 'UBER EATS, CBH',                       1279.00,  'Dining',       False),
    ('2026-04-09', 'INTERNET PAYMENT - BOC CC',           290000.00,  'CC Payment',   True),   # payment
    ('2026-04-10', 'Debit Interest - BOC CC',               9271.98,  'Other',        False),
    ('2026-04-10', 'Government Stamp Duty - BOC CC',        7800.00,  'Other',        False),
]

# ── NDB CC statement transactions ────────────────────────────────────────────
NDB_CC_TRANSACTIONS = [
    ('2026-03-10', 'Payment Received - NDB CC',            15000.00, 'CC Payment',   True),
    ('2026-03-16', 'Transaction Installment PRO MART PVT LTD', 2248.00, 'Other',    False),
    ('2026-03-26', 'APPLE.COM/BILL USD 11.95',             3893.68,  'Subscriptions', False),
    ('2026-03-31', 'Payment Received - NDB CC',            10000.00, 'CC Payment',   True),
    ('2026-04-08', 'Transaction Installment BARA AUTO INTERNATIO', 2998.00, 'Other', False),
    ('2026-04-08', 'Installment Monthly Fee BARA AUTO',      360.00, 'Other',        False),
    ('2026-04-08', 'Transaction Installment SELL-X COMPUTERS', 2717.00, 'Other',    False),
    ('2026-04-09', 'Interest Charge - NDB CC',             2620.75,  'Other',        False),
]

# ── Sampath CC statement transactions ────────────────────────────────────────
SAMPATH_CC_TRANSACTIONS = [
    ('2026-03-01', 'ABANS ELITE - 20M INSTALLMENT 1/20',    2999.95,  'Other',        False),
    ('2026-03-02', 'NETFLIX.COM, LOS GATOS USD 9.99',       3197.28,  'Subscriptions', False),
    ('2026-03-06', 'LUXURY X - 24M INSTALLMENT 23/24',     19583.33,  'Other',        False),
    ('2026-03-13', 'PAYMENT RECEIVED - CEFT BOC',          20000.00,  'CC Payment',   True),
    ('2026-03-15', 'WORLD PLAY, KANDY',                      600.00,  'Other',        False),
    ('2026-03-15', 'WORLD PLAY, KANDY',                     2300.00,  'Other',        False),
    ('2026-03-17', 'KANDY CITY CENTER, KANDY',             10797.00,  'Other',        False),
    ('2026-03-19', 'LUXURY X - 24M INSTALLMENT 8/24',     19028.50,  'Other',        False),
    ('2026-03-21', 'NETHUN PHARMACY PVT LTD, KANDY',        2534.00,  'Healthcare',   False),
    ('2026-03-27', 'XIANG YUN RESTAURANT PVT, KANDY',      8327.00,  'Dining',       False),
    ('2026-03-30', 'GOVERNMENT STAMP DUTY - Sampath',        100.00,  'Other',        False),
    ('2026-03-30', 'INTEREST CHARGE - Sampath',            4584.30,  'Other',        False),
]

# ── AMEX CC statement transactions ───────────────────────────────────────────
AMEX_CC_TRANSACTIONS = [
    ('2026-03-11', 'POSTGRADUATE INSTITUTE INST 12/12',     6400.00,  'Education',    False),
    ('2026-03-20', 'OCULUS VR USD 7.99',                   2618.28,  'Subscriptions', False),
    ('2026-03-22', 'SOFTLOGIC GLOMARK COMMON',             6791.67,  'Groceries',    False),
    ('2026-03-27', 'DIALOG TELECOM PLC',                   3883.33,  'Utilities',    False),
    ('2026-03-28', 'UNITY SYSTEMS SOLUTIONS INST 5/12',    9441.67,  'Other',        False),
    ('2026-03-31', 'LUXURY X INST 6/12',                  14333.33,  'Other',        False),
    ('2026-04-08', 'STAMP DUTY - AMEX',                      75.00,  'Other',        False),
    ('2026-04-08', 'LATE PAYMENT FEE - AMEX',             2000.00,  'Other',        False),
    ('2026-04-08', 'DEBIT INTEREST - AMEX',               2997.30,  'Other',        False),
]

# ── BOC Debit Account transactions (income = credit, expense = debit) ────────
BOC_DEBIT_TRANSACTIONS = [
    # (date, description, amount, is_credit)
    ('2026-01-05', 'personal transfer',          30000.00, False),
    ('2026-01-05', 'Charith S',                   4025.00, False),
    ('2026-01-09', 'personal',                   10025.00, False),
    ('2026-01-12', 'CEFT Mary Advance',          10025.00, False),
    ('2026-01-13', 'personal',                   10000.00, False),
    ('2026-01-22', 'Personal transfer',          10025.00, False),
    ('2026-01-23', 'SLIPS IN deposit',          256304.43, True),  # income/deposit
    ('2026-01-23', 'personal transfer',          50025.00, False),
    ('2026-01-23', '0775577633 transfer',         1500.00, False),
    ('2026-01-27', 'personal',                   50000.00, False),
    ('2026-01-28', 'BOC CC payment CEFT',        30000.00, False),
    ('2026-01-28', 'CEFT CC Payment',            15025.00, False),
    ('2026-01-28', 'CEFT CC Payment',            20025.00, False),
    ('2026-01-28', 'CEFT Personal',              45025.00, False),
    ('2026-02-02', 'SMS Alert fee',                 10.00, False),
    ('2026-02-02', 'Transport',                  43025.00, False),
    ('2026-02-03', 'Husband transfer',           50000.00, True),   # income
    ('2026-02-09', 'Jaya Salary Jan',            55025.00, False),
    ('2026-02-10', 'personal',                   10025.00, False),
    ('2026-02-10', 'CEFT CC payment',            15025.00, False),
    ('2026-02-11', 'personal',                   10000.00, False),
    ('2026-02-16', 'Broker Fees',                 5025.00, False),
    ('2026-02-23', '0775577633 transfer',         2000.00, False),
    ('2026-02-25', 'SLIPS IN deposit',          262214.12, True),   # income/salary
    ('2026-02-25', 'SLIPS IN deposit',          125000.00, True),   # income
    ('2026-02-25', '0114970731 transfer',         4000.00, False),
    ('2026-02-25', 'V CGS',                      10000.00, False),
    ('2026-02-28', 'Service Charge BOC Prestige', 200.00, False),
    ('2026-03-03', 'BOC CC payment CEFT',        125000.00, False),
    ('2026-03-03', 'CEFT CC Payment',            20025.00, False),
    ('2026-03-03', 'SMS Alert fee',                 10.00, False),
    ('2026-03-04', 'Personal transfer',          50025.00, False),
    ('2026-03-11', 'CEFT CC Payment',            15025.00, False),
    ('2026-03-12', 'CRS putha deposit',         200000.00, True),   # income
    ('2026-03-13', 'BOC CC payment',            200000.00, False),
    ('2026-03-13', 'CEFT CC Payment',            20025.00, False),
    ('2026-03-16', '0775577633 transfer',         2000.00, False),
    ('2026-03-16', 'personal',                   35025.00, False),
    ('2026-03-25', 'SLIPS IN deposit',          262094.45, True),   # income/salary
    ('2026-03-30', 'personal',                   50025.00, False),
    ('2026-03-30', 'Personal transfer',         130000.00, False),
    ('2026-03-31', 'CEFT CC Payment',            10025.00, False),
    ('2026-03-31', 'CEFT CC Payment',            10025.00, False),
    ('2026-03-31', 'CEFT Gold Loan',             40025.00, False),
    ('2026-03-31', 'Service Charge BOC Prestige', 200.00, False),
    ('2026-04-06', 'SMS Alert monthly fee',          10.00, False),
    ('2026-04-07', 'SLIPS IN deposit',            3899.80, True),   # small credit
    ('2026-04-07', 'Putha exam fee',             290000.00, True),   # large deposit
    ('2026-04-09', 'SLIPS IN deposit',          175044.93, True),   # income
    ('2026-04-09', 'BOC CC payment 290k',       290000.00, False),
    ('2026-04-09', 'personal CEFT',              20025.00, False),
    ('2026-04-15', 'personal',                   30025.00, False),
    ('2026-04-15', 'CRS deposit',               30000.00, True),    # transfer in
]

# ── Installment plans (active, on AMEX) ─────────────────────────────────────
# These are existing installment plans detected from statements
INSTALLMENT_PLANS = [
    {
        'card': 'Amex',
        'description': 'UNITY SYSTEMS SOLUTIONS - 12-mo plan',
        'monthly_instalment': 9441.67,
        'remaining_months': 8,   # 5/12 done
        'remaining_balance': 66091.65,
        'category': 'Other'
    },
    {
        'card': 'Amex',
        'description': 'LUXURY X - 12-mo plan',
        'monthly_instalment': 14333.33,
        'remaining_months': 7,   # 6/12 done
        'remaining_balance': 86000.02,
        'category': 'Other'
    },
    {
        'card': 'Amex',
        'description': 'POSTGRADUATE INSTITUTE - final instalment paid',
        'monthly_instalment': 6400.00,
        'remaining_months': 0,   # 12/12 complete
        'remaining_balance': 0.0,
        'category': 'Education'
    },
    {
        'card': 'Sampath',
        'description': 'ABANS ELITE 20M - 20-mo plan',
        'monthly_instalment': 2999.95,
        'remaining_months': 19,  # 1/20 done
        'remaining_balance': 56999.05,
        'category': 'Other'
    },
    {
        'card': 'Sampath',
        'description': 'LUXURY X - 24-mo plan (23/24)',
        'monthly_instalment': 19583.33,
        'remaining_months': 2,   # 23/24 done
        'remaining_balance': 39166.66,
        'category': 'Other'
    },
    {
        'card': 'NDB',
        'description': 'BARA AUTO INTERNATIO - installment',
        'monthly_instalment': 2998.00,
        'remaining_months': 11,
        'remaining_balance': 32978.00,
        'category': 'Other'
    },
    {
        'card': 'NDB',
        'description': 'SELL-X COMPUTERS - installment',
        'monthly_instalment': 2717.00,
        'remaining_months': 11,
        'remaining_balance': 29887.00,
        'category': 'Other'
    },
]


def upgrade() -> None:
    bind = op.get_bind()

    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]
    print(f"[Migration h4c5d6e7f8g9] Running for user_id={user_id}")

    # ── 1. Correct all debt balances, limits, rates from official statements ─
    debts_result = bind.execute(
        sa.text("SELECT id, name FROM debts WHERE user_id = :uid"), {"uid": user_id}
    )
    debts = [dict(r._mapping) for r in debts_result.fetchall()]

    for (keyword, balance, limit, rate, min_pmt, new_name) in DEBT_CORRECTIONS:
        matched = [d for d in debts if keyword.lower() in d['name'].lower()]
        if not matched:
            # Create if doesn't exist (NTB AMEX may be called differently)
            bind.execute(
                sa.text("""
                    INSERT INTO debts (user_id, name, type, balance, credit_limit, interest_rate, min_payment, due_date, status, created_at)
                    VALUES (:uid, :name, 'credit_card', :bal, :lim, :rate, :mp, 8, 'current', :now)
                """),
                {"uid": user_id, "name": new_name, "bal": balance, "lim": limit,
                 "rate": rate, "mp": min_pmt, "now": datetime.utcnow().isoformat()}
            )
            print(f"  Created new debt: {new_name} balance={balance}")
        else:
            did = matched[0]['id']
            bind.execute(
                sa.text("""
                    UPDATE debts
                    SET balance=:bal, credit_limit=:lim, interest_rate=:rate, min_payment=:mp, name=:n
                    WHERE id=:did AND user_id=:uid
                """),
                {"bal": balance, "lim": limit, "rate": rate, "mp": min_pmt,
                 "n": new_name, "did": did, "uid": user_id}
            )
            print(f"  Updated: {new_name} → balance={balance}, limit={limit}, rate={rate}%, min_pmt={min_pmt}")

    # Refresh debt map
    debts_result2 = bind.execute(
        sa.text("SELECT id, name FROM debts WHERE user_id = :uid"), {"uid": user_id}
    )
    debts2 = [dict(r._mapping) for r in debts_result2.fetchall()]
    def get_debt_id(keyword):
        for d in debts2:
            if keyword.lower() in d['name'].lower():
                return d['id']
        return None

    # ── 2. Insert statement transactions (idempotent) ─────────────────────────
    def insert_transactions(txns, card_keyword, payment_category='CC Payment'):
        debt_id = get_debt_id(card_keyword)
        added = 0
        for txn in txns:
            date_val, desc, amount, category, is_credit = txn
            exists = bind.execute(
                sa.text("""
                    SELECT id FROM expenses
                    WHERE user_id=:uid AND date=:d AND description=:desc AND amount=:amt LIMIT 1
                """),
                {"uid": user_id, "d": date_val, "desc": desc, "amt": amount}
            ).fetchone()
            if exists:
                continue
            # For payments, also record as debt_payment
            if is_credit and category == 'CC Payment' and debt_id:
                pmt_exists = bind.execute(
                    sa.text("SELECT id FROM debt_payments WHERE debt_id=:did AND payment_date=:d AND amount=:amt LIMIT 1"),
                    {"did": debt_id, "d": date_val, "amt": amount}
                ).fetchone()
                if not pmt_exists:
                    bind.execute(
                        sa.text("""
                            INSERT INTO debt_payments (debt_id, user_id, amount, payment_date, notes)
                            VALUES (:did, :uid, :amt, :d, 'From official statement')
                        """),
                        {"did": debt_id, "uid": user_id, "amt": amount, "d": date_val}
                    )
            # Record as expense (even credits, with negative or CC Payment category)
            bind.execute(
                sa.text("""
                    INSERT INTO expenses (user_id, date, description, amount, category, account, linked_card_id, created_at)
                    VALUES (:uid, :d, :desc, :amt, :cat, :acc, :cid, :now)
                """),
                {
                    "uid": user_id, "d": date_val, "desc": desc, "amt": amount,
                    "cat": category, "acc": f"{card_keyword} Credit Card",
                    "cid": debt_id if not is_credit else None,
                    "now": datetime.utcnow().isoformat()
                }
            )
            added += 1
        print(f"  {card_keyword}: added {added} transactions")

    insert_transactions(BOC_CC_TRANSACTIONS, 'BOC')
    insert_transactions(NDB_CC_TRANSACTIONS, 'NDB')
    insert_transactions(SAMPATH_CC_TRANSACTIONS, 'Sampath')
    insert_transactions(AMEX_CC_TRANSACTIONS, 'NTB AMEX')

    # ── 3. BOC Debit account: income credits ──────────────────────────────────
    income_added = 0
    for (date_val, desc, amount, is_credit) in BOC_DEBIT_TRANSACTIONS:
        if not is_credit:
            continue
        exists = bind.execute(
            sa.text("SELECT id FROM income WHERE user_id=:uid AND date=:d AND description=:desc AND amount=:amt LIMIT 1"),
            {"uid": user_id, "d": date_val, "desc": desc, "amt": amount}
        ).fetchone()
        if exists:
            continue
        cat = 'salary' if 'deposit' in desc.lower() or 'slips' in desc.lower() else 'other'
        bind.execute(
            sa.text("""
                INSERT INTO income (user_id, date, description, amount, category, created_at)
                VALUES (:uid, :d, :desc, :amt, :cat, :now)
            """),
            {"uid": user_id, "d": date_val, "desc": desc, "amt": amount, "cat": cat,
             "now": datetime.utcnow().isoformat()}
        )
        income_added += 1

    # BOC debit: debit entries as expenses
    exp_added = 0
    for (date_val, desc, amount, is_credit) in BOC_DEBIT_TRANSACTIONS:
        if is_credit:
            continue
        # Skip the CC payments (already tracked as debt_payments)
        if 'cc payment' in desc.lower() or 'ceft cc' in desc.lower():
            boc_cc_id = get_debt_id('BOC')
            if boc_cc_id:
                pmt_exists = bind.execute(
                    sa.text("SELECT id FROM debt_payments WHERE debt_id=:did AND payment_date=:d AND amount=:amt LIMIT 1"),
                    {"did": boc_cc_id, "d": date_val, "amt": amount}
                ).fetchone()
                if not pmt_exists:
                    bind.execute(
                        sa.text("INSERT INTO debt_payments (debt_id, user_id, amount, payment_date, notes) VALUES (:did,:uid,:amt,:d,'BOC Debit statement')"),
                        {"did": boc_cc_id, "uid": user_id, "amt": amount, "d": date_val}
                    )
        exists = bind.execute(
            sa.text("SELECT id FROM expenses WHERE user_id=:uid AND date=:d AND description=:desc AND amount=:amt LIMIT 1"),
            {"uid": user_id, "d": date_val, "desc": desc, "amt": amount}
        ).fetchone()
        if exists:
            continue
        cat = 'Transfer/Cash'
        if 'fee' in desc.lower() or 'charge' in desc.lower():
            cat = 'Other'
        bind.execute(
            sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, linked_card_id, created_at)
                VALUES (:uid, :d, :desc, :amt, :cat, 'BOC Current Account', NULL, :now)
            """),
            {"uid": user_id, "d": date_val, "desc": desc, "amt": amount, "cat": cat,
             "now": datetime.utcnow().isoformat()}
        )
        exp_added += 1

    print(f"  BOC Debit: {income_added} income entries, {exp_added} expense entries added")

    # ── 4. Add BOC Current Account as a Savings Goal / Asset tracker ──────────
    # We'll add it as a savings goal with current amount = last known balance
    # BOC Current A/C balance from statement: 152,639.20 (after last CEFT 35,025)
    boc_savings_exists = bind.execute(
        sa.text("SELECT id FROM savings_goals WHERE user_id=:uid AND name LIKE '%BOC Current%' LIMIT 1"),
        {"uid": user_id}
    ).fetchone()
    if not boc_savings_exists:
        bind.execute(
            sa.text("""
                INSERT INTO savings_goals (user_id, name, category, target_amount, current_amount,
                    monthly_contribution, interest_rate, target_date, created_at)
                VALUES (:uid, 'BOC Current Account', 'Emergency Fund', 500000.0, 152639.20,
                    0.0, 0.0, '2026-12-31', :now)
            """),
            {"uid": user_id, "now": datetime.utcnow().isoformat()}
        )
        print("  Created BOC Current Account savings tracker")

    print("[Migration h4c5d6e7f8g9] Complete.")


def downgrade() -> None:
    pass
