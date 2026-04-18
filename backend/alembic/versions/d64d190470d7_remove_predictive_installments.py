"""remove_predictive_installments

Revision ID: d64d190470d7
Revises: 463d7ea39667
Create Date: 2026-04-18 11:52:11.164033

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd64d190470d7'
down_revision: Union[str, Sequence[str], None] = '463d7ea39667'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        DELETE FROM expenses
        WHERE date > date('now')
        AND (
            description LIKE 'LUXURY X%INST%'
            OR description LIKE 'UNITY SYSTEMS%'
            OR description LIKE 'ABANS ELITE%'
            OR description LIKE 'SELL-X COMPUTERS%'
            OR description LIKE '1 PRO MART%'
        )
    """)


def downgrade() -> None:
    """Downgrade schema."""
    pass
