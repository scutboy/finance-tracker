"""fix_subscription_duplicates

Revision ID: b2452660315a
Revises: 76600767d23b
Create Date: 2026-05-01

Fixes:
1. Subscription charges (Netflix, Claude.ai, Apple, GeForce Now, Obsidian)
   exist as REAL expense records from bank statement imports AND are also
   counted virtually by the dashboard via the subscriptions table.
   This causes double-counting in the expense log and dashboard totals.
   Fix: Mark all subscription-type expense records as is_transfer=True so
   they are excluded from expense totals and the expense log — the
   subscriptions table remains the single source of truth.

2. GeForce Now subscription is marked active but user cancelled it.
   Fix: Set status = 'cancelled'.

3. Consolidate duplicate subscription entries:
   - Remove 'anthropic claude' duplicate (Claude.ai is already tracked).
   - Keep 'Apple Services' as the single Apple subscription entry.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Float, Integer, Boolean

revision = 'b2452660315a'
down_revision = '76600767d23b'
branch_labels = None
depends_on = None

# Subscription-related expense descriptions to mark as transfers
# (so they don't double-count with the subscriptions table)
SUB_DESCRIPTION_PATTERNS = [
    'netflix',
    'claude.ai',
    'anthropic',
    'apple.com/bill',
    'obsidian',
    'geforce',
    'bro.game',
    'apple one',
    'apple services',
]


def upgrade() -> None:
    connection = op.get_bind()

    # ── Get user ─────────────────────────────────────────────────────────────
    users = table('users', column('id', Integer), column('email', String))
    user_res = connection.execute(sa.select(users.c.id).order_by(users.c.id)).first()
    if not user_res:
        return
    user_id = user_res[0]

    # ── 1. Mark all subscription expense records as is_transfer=True ──────────
    # These are real bank charges already tracked in the subscriptions table.
    # Marking them as transfers excludes them from the expenses log and totals.
    for pattern in SUB_DESCRIPTION_PATTERNS:
        connection.execute(
            sa.text(
                "UPDATE expenses SET is_transfer = :flag "
                "WHERE user_id = :uid AND LOWER(description) LIKE :pat"
            ).bindparams(flag=True, uid=user_id, pat=f'%{pattern}%')
        )

    # ── 2. Cancel GeForce Now (user cancelled, not resubscribed) ─────────────
    connection.execute(
        sa.text(
            "UPDATE subscriptions SET status = 'cancelled' "
            "WHERE user_id = :uid AND LOWER(name) LIKE '%geforce%'"
        ).bindparams(uid=user_id)
    )

    # ── 3. Remove duplicate 'anthropic claude' subscription if it exists ─────
    # 'Claude.ai' (id=1) is already the canonical entry. Any row named
    # 'anthropic claude' is a duplicate.
    connection.execute(
        sa.text(
            "DELETE FROM subscriptions "
            "WHERE user_id = :uid AND LOWER(name) LIKE '%anthropic claude%'"
        ).bindparams(uid=user_id)
    )

    # ── 4. Fix NETFLIX expense record added by me (id=411) ───────────────────
    # Already handled by pattern matching above, but ensure the duplicate
    # we added (Apr 2026) is also excluded.
    connection.execute(
        sa.text(
            "UPDATE expenses SET is_transfer = :flag "
            "WHERE user_id = :uid AND description = 'NETFLIX.COM (USD 9.99)'"
        ).bindparams(flag=True, uid=user_id)
    )

    # ── 5. Fix APPLE expense record added by me (id=413) ─────────────────────
    connection.execute(
        sa.text(
            "UPDATE expenses SET is_transfer = :flag "
            "WHERE user_id = :uid AND description = 'APPLE.COM/BILL (USD 11.95)'"
        ).bindparams(flag=True, uid=user_id)
    )


def downgrade() -> None:
    pass
