"""Convert foreign-currency expense amounts to LKR

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-04-18 01:25:00.000000

The previous migration stored USD/GBP/THB amounts in raw foreign units.
This migration multiplies each foreign-currency expense amount by its
conversion rate to produce the correct LKR amount for display.

Conversion rates used (April 2026 actuals):
  USD → LKR : 300.0
  GBP → LKR : 380.0
  THB → LKR : 8.7
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f2a3b4c5d6e7'
down_revision: Union[str, None] = 'e1f2a3b4c5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

USD_TO_LKR = 300.0
GBP_TO_LKR = 380.0
THB_TO_LKR = 8.7


def upgrade() -> None:
    bind = op.get_bind()

    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return
    user_id = user_row[0]

    # Fetch all foreign-currency tagged expenses
    rows = bind.execute(
        sa.text("""
            SELECT id, description, amount, category FROM expenses
            WHERE user_id = :uid
              AND (category LIKE '%[USD]%' OR category LIKE '%[GBP]%' OR category LIKE '%[THB]%')
        """),
        {"uid": user_id}
    ).fetchall()

    converted = 0
    for row in rows:
        exp_id, desc, amount, category = row[0], row[1], row[2], row[3]

        if '[USD]' in (category or ''):
            lkr_amount = round(amount * USD_TO_LKR, 2)
            # Clean category tag
            new_cat = category.replace(' [USD]', '').replace('[USD]', '').strip()
        elif '[GBP]' in (category or ''):
            lkr_amount = round(amount * GBP_TO_LKR, 2)
            new_cat = category.replace(' [GBP]', '').replace('[GBP]', '').strip()
        elif '[THB]' in (category or ''):
            lkr_amount = round(amount * THB_TO_LKR, 2)
            new_cat = category.replace(' [THB]', '').replace('[THB]', '').strip()
        else:
            continue

        bind.execute(
            sa.text("UPDATE expenses SET amount = :amt, category = :cat WHERE id = :eid"),
            {"amt": lkr_amount, "cat": new_cat, "eid": exp_id}
        )
        print(f"  Converted: {desc[:40]:40s}  {amount:>8.2f} → LKR {lkr_amount:>10.2f}")
        converted += 1

    print(f"[Migration f2a3b4c5d6e7] Converted {converted} expenses to LKR.")


def downgrade() -> None:
    # Reversing currency conversion is destructive without storing originals.
    # We intentionally skip the reverse — re-run upgrade migrations from scratch if needed.
    pass
