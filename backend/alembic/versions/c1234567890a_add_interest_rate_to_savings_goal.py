"""Add interest_rate to SavingsGoal

Revision ID: c1234567890a
Revises: 2ea33be63d16
Create Date: 2026-04-03 13:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1234567890a'
down_revision: Union[str, Sequence[str], None] = '2ea33be63d16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch_op for sqlite compatibility
    with op.batch_alter_table('savings_goals', schema=None) as batch_op:
        batch_op.add_column(sa.Column('interest_rate', sa.Float(), nullable=True, server_default='0.0'))

def downgrade() -> None:
    with op.batch_alter_table('savings_goals', schema=None) as batch_op:
        batch_op.drop_column('interest_rate')
