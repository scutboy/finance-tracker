"""flag_gold_loan_as_transfer

Revision ID: 970cd4c853e2
Revises: 96f5905a179a
Create Date: 2026-04-18 11:34:38.088537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '970cd4c853e2'
down_revision: Union[str, Sequence[str], None] = '96f5905a179a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("UPDATE expenses SET is_transfer = 1 WHERE description LIKE '%Gold Loan%'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
