"""Fix subscription data: cancel Evernote, Oculus (discontinued), 
Dialog Telecom (not a subscription, it's a utility bill),
and mark OpenRouter + RunPod as pay-as-you-go (cancelled from monthly aggregate)

Revision ID: k7f8g9h0i1j2
Revises: j6e7f8g9h0i1
Create Date: 2026-04-18 08:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'k7f8g9h0i1j2'
down_revision: Union[str, None] = 'j6e7f8g9h0i1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # Cancel discontinued services - removed from monthly aggregate
    # Evernote: discontinued by user
    bind.execute(sa.text(
        "UPDATE subscriptions SET status='cancelled' WHERE name='Evernote'"
    ))
    print("[k7f8g9h0i1j2] Cancelled Evernote (discontinued)")

    # Oculus/Meta: discontinued by user
    bind.execute(sa.text(
        "UPDATE subscriptions SET status='cancelled' WHERE name LIKE '%Oculus%' OR name LIKE '%Meta%'"
    ))
    print("[k7f8g9h0i1j2] Cancelled Oculus/Meta (discontinued)")

    # Dialog Telecom: this is a utility payment, not a subscription
    bind.execute(sa.text(
        "UPDATE subscriptions SET status='cancelled' WHERE name LIKE '%Dialog%'"
    ))
    print("[k7f8g9h0i1j2] Cancelled Dialog Telecom (not a subscription - is a utility bill)")

    # OpenRouter: pay-as-you-go, not a fixed monthly subscription
    bind.execute(sa.text(
        "UPDATE subscriptions SET status='cancelled', category='Pay-as-you-go' WHERE name='OpenRouter'"
    ))
    print("[k7f8g9h0i1j2] Cancelled OpenRouter (pay-as-you-go, not monthly fixed)")

    # RunPod: pay-as-you-go, not a fixed monthly subscription
    bind.execute(sa.text(
        "UPDATE subscriptions SET status='cancelled', category='Pay-as-you-go' WHERE name='RunPod'"
    ))
    print("[k7f8g9h0i1j2] Cancelled RunPod (pay-as-you-go, not monthly fixed)")

    # Verify remaining active subs
    remaining = bind.execute(sa.text(
        "SELECT name, amount, currency FROM subscriptions WHERE status='active'"
    )).fetchall()
    print(f"[k7f8g9h0i1j2] Remaining active subscriptions ({len(remaining)}):")
    for r in remaining:
        print(f"  - {r[0]}: {r[1]} {r[2]}")

    print("[k7f8g9h0i1j2] Complete.")


def downgrade() -> None:
    pass
