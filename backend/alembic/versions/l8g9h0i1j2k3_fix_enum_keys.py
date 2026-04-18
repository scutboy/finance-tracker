"""Fix Enum Keys formatting

Revision ID: l8g9h0i1j2k3
Revises: k7f8g9h0i1j2
Create Date: 2026-04-18 09:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'l8g9h0i1j2k3'
down_revision: Union[str, None] = 'k7f8g9h0i1j2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # Revert Income values back to Keys
    # We accidentally mapped them to values like "Salary" previously.
    # SQLAlchemy Enum expects the keys (like "salary").
    INCOME_MAP = {
        'Salary': 'salary',
        'Freelance': 'freelance',
        'Business': 'business',
        'Investment': 'investment',
        'Rental': 'rental',
        'Bonus': 'bonus',
        'Other': 'other'
    }

    # Revert SavingsGoal values back to Keys
    GOAL_MAP = {
        'Emergency Fund': 'emergency',
        'Child Education': 'education',
        'Retirement': 'retirement',
        'Property': 'property',
        'Vehicle': 'vehicle',
        'Travel': 'travel',
        'Investment': 'investment',
        'Other': 'other'
    }
    
    # ── 1. Fix income categories ────────────────────────────────────────────
    income_rows = bind.execute(sa.text("SELECT id, category FROM income")).fetchall()
    fixed_incomes = 0
    for row in income_rows:
        cat = row[1]
        if cat in INCOME_MAP:
            bind.execute(
                sa.text("UPDATE income SET category=:c WHERE id=:id"),
                {"c": INCOME_MAP[cat], "id": row[0]}
            )
            fixed_incomes += 1
            
    print(f"[l8g9h0i1j2k3] Converted {fixed_incomes} income categories back to enum keys")
    
    # ── 2. Fix savings goal categories ──────────────────────────────────────
    goal_rows = bind.execute(sa.text("SELECT id, category FROM savings_goals")).fetchall()
    fixed_goals = 0
    for row in goal_rows:
        cat = row[1]
        if cat in GOAL_MAP:
            bind.execute(
                sa.text("UPDATE savings_goals SET category=:c WHERE id=:id"),
                {"c": GOAL_MAP[cat], "id": row[0]}
            )
            fixed_goals += 1
            
    print(f"[l8g9h0i1j2k3] Converted {fixed_goals} savings goal categories back to enum keys")

    print("[l8g9h0i1j2k3] Important enum keys fix complete.")


def downgrade() -> None:
    pass
