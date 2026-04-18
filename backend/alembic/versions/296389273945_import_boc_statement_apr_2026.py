"""import_boc_statement_apr_2026

Revision ID: 296389273945
Revises: 3cbbb6534e68
Create Date: 2026-04-18 13:27:24.561911

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision: str = '296389273945'
down_revision: Union[str, Sequence[str], None] = '3cbbb6534e68'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # --- EXPENSES ---
    expenses_data = [
        {
                "user_id": 1,
                "date": "2026-02-02",
                "description": "SMS Alert fee",
                "amount": 10.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-16",
                "description": "Broker Fees",
                "amount": 5025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-28",
                "description": "Service Charge BOC Prestige",
                "amount": 200.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-03",
                "description": "SMS Alert fee",
                "amount": 10.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-31",
                "description": "Service Charge BOC Prestige",
                "amount": 200.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-06",
                "description": "SMS Alert monthly fee",
                "amount": 10.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-15",
                "description": "personal",
                "amount": 30025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-04-09",
                "description": "",
                "amount": 290000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-09",
                "description": "",
                "amount": 20025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-06",
                "description": "",
                "amount": 10.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-31",
                "description": "Charge-BO",
                "amount": 200.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-31",
                "description": "",
                "amount": 40025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-31",
                "description": "",
                "amount": 10025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-30",
                "description": "Personal",
                "amount": 130000.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-03-30",
                "description": "personal",
                "amount": 50025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-03-16",
                "description": "personal",
                "amount": 35025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-03-16",
                "description": "0775577633",
                "amount": 2000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-13",
                "description": "",
                "amount": 20025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-13",
                "description": "",
                "amount": 200000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-11",
                "description": "",
                "amount": 15025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-04",
                "description": "Personal",
                "amount": 50025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-03-03",
                "description": "Personal",
                "amount": 100000.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-03-03",
                "description": "",
                "amount": 10.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-03",
                "description": "",
                "amount": 20025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-03",
                "description": "",
                "amount": 125000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-27",
                "description": "Charge-BO",
                "amount": 200.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-25",
                "description": "",
                "amount": 10000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-25",
                "description": "0114970731",
                "amount": 4000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-23",
                "description": "0775577633",
                "amount": 2000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-11",
                "description": "personal",
                "amount": 10000.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-02-10",
                "description": "",
                "amount": 15025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-10",
                "description": "personal",
                "amount": 10025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-02-09",
                "description": "",
                "amount": 55025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-02",
                "description": "",
                "amount": 10.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-02",
                "description": "Transport",
                "amount": 43025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-28",
                "description": "",
                "amount": 15025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-28",
                "description": "",
                "amount": 20025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-28",
                "description": "",
                "amount": 30000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-28",
                "description": "",
                "amount": 45025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-27",
                "description": "personal",
                "amount": 50000.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-01-23",
                "description": "Personal",
                "amount": 50025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-01-23",
                "description": "0775577633",
                "amount": 1500.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-22",
                "description": "Personal",
                "amount": 10025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-01-13",
                "description": "personal",
                "amount": 10000.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-01-12",
                "description": "Mary",
                "amount": 10025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-09",
                "description": "personal",
                "amount": 10025.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-01-05",
                "description": "",
                "amount": 50.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-05",
                "description": "Charith S",
                "amount": 4025.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-05",
                "description": "personal",
                "amount": 30000.0,
                "category": "Transfer",
                "account": "BOC Current Account",
                "is_transfer": true
        }
]
    
    # Standardize dates and add created_at
    now = datetime.utcnow()
    for e in expenses_data:
        e['date'] = datetime.strptime(e['date'], '%Y-%m-%d').date()
        e['created_at'] = now

    # --- INCOME ---
    income_data = [
        {
                "user_id": 1,
                "date": "2026-01-23",
                "description": "SLIPS IN deposit",
                "amount": 256304.43,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-03",
                "description": "Husband transfer",
                "amount": 50000.0,
                "category": "other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-25",
                "description": "SLIPS IN deposit",
                "amount": 262214.12,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-25",
                "description": "SLIPS IN deposit",
                "amount": 125000.0,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-12",
                "description": "CRS putha deposit",
                "amount": 200000.0,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-25",
                "description": "SLIPS IN deposit",
                "amount": 262094.45,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-07",
                "description": "SLIPS IN deposit",
                "amount": 3899.8,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-07",
                "description": "Putha exam fee",
                "amount": 290000.0,
                "category": "other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-09",
                "description": "SLIPS IN deposit",
                "amount": 175044.93,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-15",
                "description": "CRS deposit",
                "amount": 30000.0,
                "category": "salary",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-15",
                "description": "CRS",
                "amount": 30000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-04-09",
                "description": "",
                "amount": 175044.93,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-07",
                "description": "",
                "amount": 290000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-04-07",
                "description": "2026I20008",
                "amount": 3899.8,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-25",
                "description": "",
                "amount": 262094.45,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-03-12",
                "description": "CRS putha",
                "amount": 200000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": true
        },
        {
                "user_id": 1,
                "date": "2026-02-25",
                "description": "",
                "amount": 125000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-25",
                "description": "",
                "amount": 262214.12,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-02-03",
                "description": "Husband",
                "amount": 50000.0,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        },
        {
                "user_id": 1,
                "date": "2026-01-23",
                "description": "",
                "amount": 256304.43,
                "category": "Other",
                "account": "BOC Current Account",
                "is_transfer": false
        }
]
    for i in income_data:
        i['date'] = datetime.strptime(i['date'], '%Y-%m-%d').date()
        i['created_at'] = now

    # Get metadata for tables
    bind = op.get_bind()
    meta = sa.MetaData()
    
    expense_table = sa.Table(
        'expenses', meta,
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer),
        sa.Column('date', sa.Date),
        sa.Column('description', sa.String),
        sa.Column('amount', sa.Float),
        sa.Column('category', sa.String),
        sa.Column('account', sa.String),
        sa.Column('is_transfer', sa.Boolean),
        sa.Column('created_at', sa.DateTime)
    )

    income_table = sa.Table(
        'income', meta,
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer),
        sa.Column('date', sa.Date),
        sa.Column('description', sa.String),
        sa.Column('amount', sa.Float),
        sa.Column('category', sa.String),
        sa.Column('account', sa.String),
        sa.Column('is_transfer', sa.Boolean),
        sa.Column('created_at', sa.DateTime)
    )

    # Dedup and Insert Expenses
    for e in expenses_data:
        exists = bind.execute(sa.text("""
            SELECT 1 FROM expenses 
            WHERE user_id = :u AND date = :d AND amount = :a AND description = :desc
        """), {"u": e['user_id'], "d": e['date'], "a": e['amount'], "desc": e['description']}).fetchone()
        
        if not exists:
            op.bulk_insert(expense_table, [e])

    # Dedup and Insert Income
    for i in income_data:
        exists = bind.execute(sa.text("""
            SELECT 1 FROM income 
            WHERE user_id = :u AND date = :d AND amount = :a AND description = :desc
        """), {"u": i['user_id'], "d": i['date'], "a": i['amount'], "desc": i['description']}).fetchone()
        
        if not exists:
            op.bulk_insert(income_table, [i])

def downgrade() -> None:
    pass
"""
