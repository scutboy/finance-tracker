"""mask_individual_installments_as_transfers

Revision ID: 496e72b31b97
Revises: d64d190470d7
Create Date: 2026-04-18 11:56:03.538247

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '496e72b31b97'
down_revision: Union[str, Sequence[str], None] = 'd64d190470d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        UPDATE expenses 
        SET is_transfer = 1 
        WHERE description LIKE 'LUXURY X%'
           OR description LIKE 'UNITY SYSTEMS%'
           OR description LIKE 'ABANS ELITE%'
           OR description LIKE 'SELL-X COMPUTERS%'
           OR description LIKE '1 PRO MART%'
    """)


def downgrade() -> None:
    """Downgrade schema."""
    pass
