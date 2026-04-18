"""Fix P&L bugs, unify accounts, and add missing ComBank credits

Revision ID: m9h0i1j2k3l4
Revises: l8g9h0i1j2k3
Create Date: 2026-04-18 10:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'm9h0i1j2k3l4'
down_revision: Union[str, None] = 'l8g9h0i1j2k3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Add is_transfer to expenses
    op.add_column('expenses', sa.Column('is_transfer', sa.Boolean(), server_default='0', nullable=False))
    
    # 2. Add account to income
    op.add_column('income', sa.Column('account', sa.String(), nullable=True))

    # --- Data Operations ---
    
    # 3. Issue 1: Remove Income Duplicates
    bind.execute(sa.text("DELETE FROM income WHERE id IN (13, 14, 15, 16, 17, 18)"))
    print("[m9h0i1j2k3l4] Removed 6 duplicate income transactions")

    # 4. Issue 2: Flag transfers in expenses
    bind.execute(sa.text("""
        UPDATE expenses SET is_transfer = 1
        WHERE category = 'Transfer/Cash'
           OR description LIKE '%CEFT%'
           OR description LIKE '%CC payment%'
           OR description LIKE '%CC Payment%'
           OR description LIKE '%Personal transfer%'
    """))

    # Issue 2, Step A: Delete double-counted transfer sides
    # We remove the BOC Current Account copies that echo the exact amounts from Savings A/C
    bind.execute(sa.text("""
        DELETE FROM expenses WHERE account = 'BOC Current Account' AND (
            (date = '2026-02-10' AND amount = 10025.0) OR
            (date = '2026-02-10' AND amount = 15025.0) OR
            (date = '2026-02-11' AND amount = 10000.0) OR
            (date = '2026-02-23' AND amount = 2000.0) OR
            (date = '2026-02-25' AND amount = 4000.0) OR
            (date = '2026-03-04' AND amount = 50025.0) OR
            (date = '2026-03-11' AND amount = 15025.0) OR
            (date = '2026-03-13' AND amount = 200000.0) OR
            (date = '2026-03-13' AND amount = 20025.0) OR
            (date = '2026-03-31' AND amount = 10025.0) OR
            (date = '2026-03-31' AND amount = 40025.0) OR
            (date = '2026-04-09' AND amount = 20025.0) OR
            (date = '2026-04-09' AND amount = 290000.0)
        )
    """))

    # 5. Issue 3: Unify account tags
    bind.execute(sa.text("UPDATE expenses SET account = 'ComBank Debit Card' WHERE account = 'Debit Card'"))
    bind.execute(sa.text("UPDATE expenses SET account = 'Sampath Credit Card' WHERE account = 'Sampath Card'"))
    bind.execute(sa.text("UPDATE expenses SET account = 'NTB AMEX Credit Card' WHERE account = 'NTB Credit Card'"))

    bind.execute(sa.text("""
        UPDATE expenses SET account = 'BOC Credit Card'
        WHERE account = 'Credit Card'
          AND description IN (
            'GALLE ELECTRICAL AGENC KANDY', 'HAPPY FEET AND HANDS P COLOMBO 05',
            'DHL KEELLS PVT LTD COLOMBO 02', 'CAPTAIN TABLE KANDY',
            'CLAUDE.AI SUBSCRIPTION SAN FRANCISCO', 'SARASAVI BOOK SHOP NUGEGODA',
            'VITO PIZZA KANDY PVT LTD', 'S.N.K. ENTERPRISES WEWELDENIYA',
            'KCC MULTIPLEX KANDY'
          )
    """))

    bind.execute(sa.text("""
        UPDATE expenses SET account = 'Sampath Credit Card'
        WHERE account = 'Credit Card'
          AND description IN (
            'Netflix.com', 'GEFORCE NOW - BRO.GAME (Thailand)',
            'ABANS ELITE - 20M (appliance)', 'SARASAVI BOOKSHOP KANDY',
            'WORLD PLAY', 'KANDY CITY CENTER', 'NETHUN PHARMACY',
            'XIANG YUN RESTAURANT'
          )
    """))

    bind.execute(sa.text("UPDATE expenses SET account = 'NDB Credit Card' WHERE account = 'Credit Card' AND description = 'APPLE.COM/BILL (Singapore)'"))
    bind.execute(sa.text("""
        UPDATE expenses SET account = 'BOC Credit Card'
        WHERE account = 'Credit Card'
          AND description LIKE '%UBER EATS CBH%'
          AND date IN ('2026-02-15','2026-02-16','2026-02-25','2026-03-09','2026-03-23','2026-04-04')
    """))

    # 6. Set generic Income tags to BOC
    bind.execute(sa.text("""
        UPDATE income SET account = 'BOC Current Account'
        WHERE description LIKE '%BOC%' OR description LIKE '%SLIPS IN%'
           OR description LIKE '%CRS%' OR description LIKE '%putha%' OR description = 'Husband transfer'
    """))

    # 7. Issue 4: Insert missing ComBank income entries
    user_id_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if user_id_row:
        uid = user_id_row[0]
        missing_incomes = [
            ('2026-01-05', 30000.0, 'BOC Transfer (personal transfer)'),
            ('2026-01-22', 10000.0, 'BOC Transfer (Personal transfer)'),
            ('2026-01-23', 50000.0, 'BOC Transfer (personal transfer)'),
            ('2026-01-28', 45000.0, 'BOC Transfer (CEFT Personal)'),
            ('2026-03-04', 50000.0, 'BOC Transfer (Personal transfer)'),
            ('2026-03-30', 130000.0, 'BOC Transfer (Personal transfer)'),
            ('2026-04-09', 20000.0, 'BOC Transfer (personal CEFT)'),
            ('2026-04-17', 30000.0, 'BOC Transfer (CEFT Transfer)'),
            ('2026-04-17', 35000.0, 'BOC Transfer (CEFT Transfer)'),
            ('2026-02-28', 50000.0, 'Credit to 8004511560 - Digital Banking Division'),
            ('2026-03-14', 35000.0, 'Credit to 8004511560 - Digital Banking Division'),
            ('2026-03-26', 50000.0, 'Credit to 8004511560 - Digital Banking Division'),
            ('2026-04-12', 30000.0, 'Credit to 8004511560 - Digital Banking Division'),
            ('2026-04-16', 35000.0, 'Credit to 8004511560 - Digital Banking Division'),
        ]
        import datetime
        now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        for dt, amt, desc in missing_incomes:
            bind.execute(sa.text("""
                INSERT INTO income (user_id, date, amount, description, category, account, created_at)
                VALUES (:uid, :dt, :amt, :desc, 'other', 'ComBank Debit Card', :now)
            """), {
                "uid": uid,
                "dt": dt,
                "amt": amt,
                "desc": desc,
                "now": now
            })
        print("[m9h0i1j2k3l4] Inserted 14 missing ComBank incomes")

    # One last cleanup: some entries in Expenses with 'account' as NULL. That's fine for now.
    print("[m9h0i1j2k3l4] Full financial audit cleanup complete.")


def downgrade() -> None:
    pass
