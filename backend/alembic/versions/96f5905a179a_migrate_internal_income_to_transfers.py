"""migrate_internal_income_to_transfers

Revision ID: 96f5905a179a
Revises: 9d6968563db4
Create Date: 2026-04-18 11:12:08.775819

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '96f5905a179a'
down_revision: Union[str, Sequence[str], None] = '9d6968563db4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    bind.execute(sa.text("""
        INSERT INTO transfers (user_id, date, from_account, to_account, amount, description, created_at)
        SELECT user_id, date, 'BOC Current Account', 'ComBank Debit Card', amount, description, created_at
        FROM income 
        WHERE description LIKE '%BOC Transfer%'
           OR description LIKE '%Digital Banking Division%'
           OR description LIKE '%CEFT%'
           OR description LIKE '%personal CEFT%'
           OR description LIKE '%Personal transfer%'
    """))
    bind.execute(sa.text("""
        DELETE FROM income 
        WHERE description LIKE '%BOC Transfer%'
           OR description LIKE '%Digital Banking Division%'
           OR description LIKE '%CEFT%'
           OR description LIKE '%personal CEFT%'
           OR description LIKE '%Personal transfer%'
    """))


def downgrade() -> None:
    """Downgrade schema."""
    pass
