"""fix_may_data_correct_balances_and_flags

Revision ID: 3dbe5e7c430a
Revises: 7c7e4af449fa
Create Date: 2026-05-01

Fixes:
1. All BOC Debit transfer entries had is_transfer=False, making them count as
   real expenses and distorting the dashboard spending totals. Mark them True.
2. CEFT Transfer Debit (Apr 26) also was not marked as transfer.
3. ATM Withdrawal on Combank was also not marked as transfer.
4. BOC final balance is Rs 49,644.04 (after ALL outgoing transfers), not
   Rs 229,694.04 (which was mid-statement after deposit only).
5. Move the BOC deposit income to Apr 25 so it falls within the current
   billing cycle (Apr 25 – May 24) and shows on the dashboard.
6. Re-insert the income entry with the corrected date if the old one exists.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Float, Integer, Date, Boolean
from datetime import date

revision = '3dbe5e7c430a'
down_revision = '7c7e4af449fa'
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()

    # ── Get the real production user (first user by ID) ──────────────────────
    users = table('users', column('id', Integer), column('email', String))
    user_res = connection.execute(sa.select(users.c.id).order_by(users.c.id)).first()
    if not user_res:
        return
    user_id = user_res[0]

    # ── 1. Mark ALL BOC Debit transfer entries as is_transfer=True ────────────
    # These are internal fund movements, not real expenses.
    # They should never count towards spending totals.
    expenses = table('expenses',
        column('user_id', Integer),
        column('account', String),
        column('description', String),
        column('is_transfer', Boolean)
    )
    
    # Mark all BOC Debit account entries as transfers (they are all internal)
    connection.execute(
        expenses.update().where(
            (expenses.c.user_id == user_id) &
            (expenses.c.account == 'BOC Debit')
        ).values(is_transfer=True)
    )

    # Also mark ATM Withdrawal as transfer
    connection.execute(
        expenses.update().where(
            (expenses.c.user_id == user_id) &
            (expenses.c.description == 'ATM Withdrawal')
        ).values(is_transfer=True)
    )

    # ── 2. Fix BOC final balance: Rs 49,644.04 ────────────────────────────────
    # The correct final balance per SMS: after CEFT transfer the balance
    # available was Rs 49,644.04 (not 229,694.04 which was post-deposit only).
    account_balances = table('account_balances',
        column('user_id', Integer),
        column('account_name', String),
        column('opening_balance', Float),
        column('as_of_date', Date)
    )
    ab_exists = connection.execute(
        sa.select(account_balances.c.user_id).where(
            (account_balances.c.user_id == user_id) &
            (account_balances.c.account_name == 'BOC Debit')
        )
    ).first()
    if ab_exists:
        connection.execute(
            account_balances.update().where(
                (account_balances.c.user_id == user_id) &
                (account_balances.c.account_name == 'BOC Debit')
            ).values(opening_balance=49644.04, as_of_date=date(2026, 4, 30))
        )
    else:
        op.bulk_insert(account_balances, [{
            "user_id": user_id,
            "account_name": "BOC Debit",
            "opening_balance": 49644.04,
            "as_of_date": date(2026, 4, 30)
        }])

    # ── 3. Fix BOC Current Account savings goal balance ───────────────────────
    savings_goals = table('savings_goals',
        column('user_id', Integer),
        column('name', String),
        column('current_amount', Float)
    )
    connection.execute(
        savings_goals.update().where(
            (savings_goals.c.user_id == user_id) &
            (savings_goals.c.name == 'BOC Current Account')
        ).values(current_amount=49644.04)
    )

    # ── 4. Fix the income deposit date to fall in current cycle ──────────────
    # Current cycle: Apr 25 – May 24. The deposit of Rs 87,054.84 was
    # dated Apr 16 (previous cycle). Move it to Apr 25 (cycle start)
    # so it correctly appears on the dashboard income panel.
    incomes = table('income',
        column('user_id', Integer),
        column('date', Date),
        column('description', String),
        column('amount', Float),
        column('category', String),
        column('account', String),
        column('is_transfer', Boolean)
    )
    # Delete old entry with wrong date
    connection.execute(
        sa.text(
            "DELETE FROM income WHERE user_id = :uid AND description = 'Current A/C Deposit' AND amount = 87054.84"
        ).bindparams(uid=user_id)
    )
    # Re-insert with the cycle-start date so it shows on dashboard
    exists = connection.execute(
        sa.select(incomes.c.user_id).where(
            (incomes.c.user_id == user_id) &
            (incomes.c.date == date(2026, 4, 25)) &
            (incomes.c.amount == 87054.84)
        )
    ).first()
    if not exists:
        op.bulk_insert(incomes, [{
            "user_id": user_id,
            "date": date(2026, 4, 25),
            "description": "BOC Salary / Deposit (Apr)",
            "amount": 87054.84,
            "category": "Salary",
            "account": "BOC Debit",
            "is_transfer": False
        }])


def downgrade() -> None:
    pass
