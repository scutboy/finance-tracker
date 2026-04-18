"""Fix enum mismatches: income categories + savings goal categories + dashboard JSON serialization

Revision ID: j6e7f8g9h0i1
Revises: i5d6e7f8g9h0
Create Date: 2026-04-18 07:40:00.000000

Root causes identified:
1. Income.category stored as lowercase ('salary','other') but enum expects title case ('Salary','Other')
2. SavingsGoal.category stored as 'Emergency Fund' (title case) but enum expects same - actually DB
   had 'emergency','education' etc stored from old migrations. Need to normalise to match enum values.
3. Dashboard endpoint put i.category enum object directly in dict - causes JSON serialization failure
   (fixed separately in the endpoint, this migration only fixes the raw DB values)
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision: str = 'j6e7f8g9h0i1'
down_revision: Union[str, None] = 'i5d6e7f8g9h0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Map stored raw strings → correct enum values (as defined in GoalCategoryEnum)
GOAL_CATEGORY_MAP = {
    'emergency':         'Emergency Fund',
    'emergency fund':    'Emergency Fund',
    'child education':   'Child Education',
    'education':         'Child Education',
    'retirement':        'Retirement',
    'property':          'Property',
    'vehicle':           'Vehicle',
    'travel':            'Travel',
    'investment':        'Investment',
    'other':             'Other',
}

# Map stored raw strings → correct enum values (as defined in IncomeCategoryEnum)
INCOME_CATEGORY_MAP = {
    'salary':     'Salary',
    'freelance':  'Freelance',
    'business':   'Business',
    'investment': 'Investment',
    'rental':     'Rental',
    'bonus':      'Bonus',
    'other':      'Other',
    # already-correct ones (idempotent)
    'Salary':     'Salary',
    'Freelance':  'Freelance',
    'Business':   'Business',
    'Investment': 'Investment',
    'Rental':     'Rental',
    'Bonus':      'Bonus',
    'Other':      'Other',
}


def upgrade() -> None:
    bind = op.get_bind()
    user_row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not user_row:
        return

    # ── 1. Fix income categories ────────────────────────────────────────────
    income_rows = bind.execute(sa.text("SELECT id, category FROM income")).fetchall()
    fixed_income = 0
    for row in income_rows:
        raw = (row[1] or '').strip()
        corrected = INCOME_CATEGORY_MAP.get(raw) or INCOME_CATEGORY_MAP.get(raw.lower())
        if corrected and corrected != raw:
            bind.execute(
                sa.text("UPDATE income SET category=:c WHERE id=:id"),
                {"c": corrected, "id": row[0]}
            )
            fixed_income += 1
    print(f"[j6e7f8g9h0i1] Fixed {fixed_income} income category values")

    # ── 2. Fix savings goal categories ──────────────────────────────────────
    goal_rows = bind.execute(sa.text("SELECT id, category FROM savings_goals")).fetchall()
    fixed_goals = 0
    for row in goal_rows:
        raw = (row[1] or '').strip()
        corrected = GOAL_CATEGORY_MAP.get(raw) or GOAL_CATEGORY_MAP.get(raw.lower())
        if corrected and corrected != raw:
            bind.execute(
                sa.text("UPDATE savings_goals SET category=:c WHERE id=:id"),
                {"c": corrected, "id": row[0]}
            )
            fixed_goals += 1
    print(f"[j6e7f8g9h0i1] Fixed {fixed_goals} savings goal category values")

    # ── 3. Ensure BOC Current Account goal exists with correct category ──────
    boc = bind.execute(
        sa.text("SELECT id, current_amount FROM savings_goals WHERE name LIKE '%BOC%' AND name LIKE '%Current%' LIMIT 1")
    ).fetchone()
    if not boc:
        uid = user_row[0]
        bind.execute(
            sa.text("""
                INSERT INTO savings_goals (user_id, name, category, target_amount, current_amount,
                    monthly_contribution, interest_rate, target_date, created_at)
                VALUES (:uid, 'BOC Current Account', 'Other', 500000.0, 152639.20,
                    0.0, 0.0, '2026-12-31', :now)
            """),
            {"uid": uid, "now": datetime.utcnow().isoformat()}
        )
        print("[j6e7f8g9h0i1] Created BOC Current Account savings goal")
    else:
        print(f"[j6e7f8g9h0i1] BOC Current Account already exists id={boc[0]} balance={boc[1]}")

    print("[j6e7f8g9h0i1] Complete.")


def downgrade() -> None:
    pass
