"""fix_apply_may_transactions_prod

Revision ID: 7c7e4af449fa
Revises: 6ae1810ebf44
Create Date: 2026-05-01

Re-applies all May 2026 transactions targeting the FIRST user in the DB
(not test@test.com which only exists locally). Safe to re-run — all inserts
are guarded by existence checks.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Float, Integer, Date, Boolean
from datetime import date

revision = '7c7e4af449fa'
down_revision = '6ae1810ebf44'
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

    # ── 1. Update Credit Card Balances ───────────────────────────────────────
    debts = table('debts',
        column('user_id', Integer),
        column('name', String),
        column('balance', Float),
        column('min_payment', Float)
    )
    connection.execute(
        debts.update().where(
            (debts.c.user_id == user_id) & (debts.c.name.ilike('%sampath%'))
        ).values(balance=295054.67, min_payment=10326.91)
    )
    connection.execute(
        debts.update().where(
            (debts.c.user_id == user_id) & (debts.c.name.ilike('%ndb%'))
        ).values(balance=124009.95, min_payment=4960.00)
    )

    # ── 2. BOC Current Account income deposit ───────────────────────────────
    incomes = table('income',
        column('user_id', Integer),
        column('date', Date),
        column('description', String),
        column('amount', Float),
        column('category', String),
        column('account', String),
        column('is_transfer', Boolean)
    )
    income_data = [
        {"user_id": user_id, "date": date(2026, 4, 16), "description": "Current A/C Deposit",
         "amount": 87054.84, "category": "Salary", "account": "BOC Debit", "is_transfer": False}
    ]
    for row in income_data:
        exists = connection.execute(
            sa.select(incomes.c.user_id).where(
                (incomes.c.user_id == user_id) &
                (incomes.c.date == row['date']) &
                (incomes.c.amount == row['amount']) &
                (incomes.c.description == row['description'])
            )
        ).first()
        if not exists:
            op.bulk_insert(incomes, [row])

    # ── 3. Expenses ──────────────────────────────────────────────────────────
    expenses = table('expenses',
        column('user_id', Integer),
        column('date', Date),
        column('description', String),
        column('amount', Float),
        column('category', String),
        column('account', String),
        column('is_transfer', Boolean),
        column('linked_card_id', Integer)
    )
    expense_data = [
        # BOC Debit transfers
        {"user_id": user_id, "date": date(2026, 4, 15), "description": "Online Transfer Debit", "amount": 3000.00, "category": "Other", "account": "BOC Debit", "is_transfer": True, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 16), "description": "Online Transfer Debit", "amount": 7000.00, "category": "Other", "account": "BOC Debit", "is_transfer": True, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 18), "description": "Online Transfer Debit", "amount": 100000.00, "category": "Other", "account": "BOC Debit", "is_transfer": True, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 20), "description": "Transfer Debit", "amount": 50025.00, "category": "Other", "account": "BOC Debit", "is_transfer": True, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 26), "description": "CEFT Transfer Debit", "amount": 30025.00, "category": "Other", "account": "BOC Debit", "is_transfer": True, "linked_card_id": None},
        # BOC Credit Card
        {"user_id": user_id, "date": date(2026, 4, 17), "description": "SOFTLOGIC RESTAURANT", "amount": 4070.00, "category": "Dining & Entertainment", "account": "BOC Credit Card", "is_transfer": False, "linked_card_id": None},
        # Combank Debit — Dining
        {"user_id": user_id, "date": date(2026, 4, 17), "description": "KFC - NAWINNA", "amount": 2800.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 17), "description": "UBER EATS", "amount": 2765.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 18), "description": "FOOD STUDIO", "amount": 3370.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 20), "description": "NELUM KOLE", "amount": 1070.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 21), "description": "NELUM KOLE", "amount": 870.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 21), "description": "UBER EATS", "amount": 1711.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 23), "description": "NELUM KOLE", "amount": 870.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 23), "description": "NELUM KOLE (2nd)", "amount": 870.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 24), "description": "BARISTA", "amount": 1870.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 27), "description": "NELUM KOLE", "amount": 1050.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 28), "description": "NELUM KOLE", "amount": 1130.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 30), "description": "NELUM KOLE", "amount": 870.00, "category": "Dining & Entertainment", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        # Combank Debit — Healthcare
        {"user_id": user_id, "date": date(2026, 4, 18), "description": "REVITALISE CEYLON", "amount": 4800.00, "category": "Healthcare", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 20), "description": "KOCO WELLNESS", "amount": 7000.00, "category": "Healthcare", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        # Combank Debit — Groceries
        {"user_id": user_id, "date": date(2026, 4, 18), "description": "CARGILLS FOODCITY", "amount": 960.00, "category": "Groceries", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 29), "description": "KEELLS EMBULDENIYA", "amount": 2550.00, "category": "Groceries", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        # Combank Debit — Other
        {"user_id": user_id, "date": date(2026, 4, 18), "description": "HAVELOCK CITY", "amount": 450.00, "category": "Other", "account": "Combank Debit", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 29), "description": "ATM Withdrawal", "amount": 3000.00, "category": "Other", "account": "Combank Debit", "is_transfer": True, "linked_card_id": None},
        # Sampath Credit Card
        {"user_id": user_id, "date": date(2026, 4, 1),  "description": "NETFLIX.COM (USD 9.99)", "amount": 3000.00, "category": "Software/Media", "account": "Sampath Credit Card", "is_transfer": False, "linked_card_id": None},
        {"user_id": user_id, "date": date(2026, 4, 26), "description": "SEN SAAL", "amount": 890.00, "category": "Dining & Entertainment", "account": "Sampath Credit Card", "is_transfer": False, "linked_card_id": None},
        # NDB Credit Card
        {"user_id": user_id, "date": date(2026, 4, 24), "description": "APPLE.COM/BILL (USD 11.95)", "amount": 3600.00, "category": "Software/Media", "account": "NDB Credit Card", "is_transfer": False, "linked_card_id": None},
    ]
    for row in expense_data:
        exists = connection.execute(
            sa.select(expenses.c.user_id).where(
                (expenses.c.user_id == user_id) &
                (expenses.c.date == row['date']) &
                (expenses.c.amount == row['amount']) &
                (expenses.c.description == row['description'])
            )
        ).first()
        if not exists:
            op.bulk_insert(expenses, [row])

    # ── 4. BOC account balance (as_of_date snapshot after deposit) ───────────
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
            ).values(opening_balance=229694.04, as_of_date=date(2026, 5, 1))
        )
    else:
        op.bulk_insert(account_balances, [{
            "user_id": user_id,
            "account_name": "BOC Debit",
            "opening_balance": 229694.04,
            "as_of_date": date(2026, 5, 1)
        }])

    # ── 5. Sync BOC Current Account savings goal ─────────────────────────────
    savings_goals = table('savings_goals',
        column('user_id', Integer),
        column('name', String),
        column('current_amount', Float)
    )
    connection.execute(
        savings_goals.update().where(
            (savings_goals.c.user_id == user_id) &
            (savings_goals.c.name == 'BOC Current Account')
        ).values(current_amount=229694.04)
    )


def downgrade() -> None:
    pass
