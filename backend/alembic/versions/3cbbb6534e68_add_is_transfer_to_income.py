"""add_is_transfer_to_income

Revision ID: 3cbbb6534e68
Revises: 496e72b31b97
Create Date: 2026-04-18 13:17:59.600379

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3cbbb6534e68'
down_revision: Union[str, Sequence[str], None] = '496e72b31b97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('income', sa.Column('is_transfer', sa.Boolean(), nullable=True, server_default=sa.text('0')))
    op.execute("UPDATE income SET is_transfer = 0 WHERE is_transfer IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    pass
