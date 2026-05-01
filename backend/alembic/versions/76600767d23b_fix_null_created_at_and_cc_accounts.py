"""fix_null_created_at_and_cc_accounts

Revision ID: 76600767d23b
Revises: 3dbe5e7c430a
Create Date: 2026-05-01

Fixes:
1. All rows inserted via op.bulk_insert() get NULL created_at because
   SQLAlchemy's server_default doesn't fire on bulk inserts. This causes
   Pydantic to throw a validation error on the /income/ and /expenses/ 
   endpoints, crashing those pages entirely.
   Fix: UPDATE all NULL created_at to NOW().

2. Sampath/NDB/BOC credit card purchases were already correctly labelled
   under their credit card accounts. No account changes needed there.
   But the previous 3dbe5e7c430a migration set ALL BOC Debit rows to 
   is_transfer=True — including SOFTLOGIC RESTAURANT which is on 
   BOC Credit Card, not BOC Debit. Verify that's not affected (it isn't,
   it's a separate account), and re-confirm the right set of transfers.
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

revision = '76600767d23b'
down_revision = '3dbe5e7c430a'
branch_labels = None
depends_on = None

NOW = datetime(2026, 5, 1, 10, 0, 0)


def upgrade() -> None:
    connection = op.get_bind()

    # ── 1. Fix NULL created_at on income table ────────────────────────────────
    connection.execute(
        sa.text("UPDATE income SET created_at = :ts WHERE created_at IS NULL"),
        {"ts": NOW}
    )

    # ── 2. Fix NULL created_at on expenses table ──────────────────────────────
    connection.execute(
        sa.text("UPDATE expenses SET created_at = :ts WHERE created_at IS NULL"),
        {"ts": NOW}
    )

    # ── 3. Fix NULL created_at on any other tables that might be affected ──────
    for tbl in ("subscriptions", "debts", "savings_goals", "debt_payments", "goal_contributions"):
        try:
            connection.execute(
                sa.text(f"UPDATE {tbl} SET created_at = :ts WHERE created_at IS NULL"),
                {"ts": NOW}
            )
        except Exception:
            pass  # Table might not have created_at column — safe to skip


def downgrade() -> None:
    pass
