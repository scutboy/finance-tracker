"""rollback_boc_statement_dupes

Revision ID: 856d09222804
Revises: 3cbbb6534e68
Create Date: 2026-04-18 13:58:44.074700

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '856d09222804'
down_revision: Union[str, Sequence[str], None] = '296389273945'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema and ROLLBACK duplicate data."""
    # Delete all BOC Current Account entries created today (April 18th, 2026)
    # This surgically reverts the failed PDF sync while keeping original data intact.
    op.execute("DELETE FROM expenses WHERE account = 'BOC Current Account' AND date(created_at) = '2026-04-18'")
    op.execute("DELETE FROM income WHERE account = 'BOC Current Account' AND date(created_at) = '2026-04-18'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
