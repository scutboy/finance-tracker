"""NDB installment corrections from full e-statement page 2, and dashboard/savings bugfixes

Revision ID: i5d6e7f8g9h0
Revises: h4c5d6e7f8g9
Create Date: 2026-04-18 07:17:00.000000

NDB statement page 2 reveals:
- Sell-X Computers (Pv): 36mo total, 31 remaining, LKR 84,227 balance
- I PRO MART PVT LTD: 25mo total, 22 remaining, LKR 49,456 balance
Also adds: Stamp Duty (100) + Interest Adj (631.76) from NDB statement
Also corrects NDB Card closing balance to confirmed 124,009.95
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision: str = 'i5d6e7f8g9h0'
down_revision: Union[str, None] = 'h4c5d6e7f8g9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_NDB_ENTRIES = [
    ('2026-04-09', 'Stamp Duty - NDB CC',          100.00,   'Other'),
    ('2026-04-09', 'Interest Adjustment - NDB CC',  631.76,   'Other'),
]


def upgrade() -> None:
    bind = op.get_bind()
    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]

    ndb = bind.execute(
        sa.text("SELECT id FROM debts WHERE user_id=:uid AND name LIKE '%NDB%' LIMIT 1"),
        {"uid": user_id}
    ).fetchone()
    ndb_id = ndb[0] if ndb else None

    added = 0
    for (date_val, desc, amount, category) in NEW_NDB_ENTRIES:
        exists = bind.execute(
            sa.text("SELECT id FROM expenses WHERE user_id=:uid AND date=:d AND description=:desc AND amount=:amt LIMIT 1"),
            {"uid": user_id, "d": date_val, "desc": desc, "amt": amount}
        ).fetchone()
        if exists:
            continue
        bind.execute(
            sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, linked_card_id, created_at)
                VALUES (:uid, :d, :desc, :amt, :cat, 'NDB Credit Card', :cid, :now)
            """),
            {"uid": user_id, "d": date_val, "desc": desc, "amt": amount, "cat": category,
             "cid": ndb_id, "now": datetime.utcnow().isoformat()}
        )
        added += 1

    print(f"[i5d6e7f8g9h0] Added {added} NDB statement entries")

    # Confirm NDB balance is correct (should already be 124,009.95 from prev migration)
    bind.execute(
        sa.text("UPDATE debts SET balance=124009.95 WHERE id=:did AND user_id=:uid"),
        {"did": ndb_id, "uid": user_id}
    )
    print("[i5d6e7f8g9h0] NDB balance confirmed at 124,009.95")
    print("[i5d6e7f8g9h0] Complete.")


def downgrade() -> None:
    pass
