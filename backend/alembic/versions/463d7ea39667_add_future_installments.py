"""add_future_installments

Revision ID: 463d7ea39667
Revises: 970cd4c853e2
Create Date: 2026-04-18 11:36:38.078196

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '463d7ea39667'
down_revision: Union[str, Sequence[str], None] = '970cd4c853e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    # Get user ID
    row = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
    if not row:
        return
    uid = row[0]

    # Remove ABANS ELITE double-count
    bind.execute(sa.text("DELETE FROM expenses WHERE id = 148"))

    # All future installments
    entries = [
        # LUXURY X Plan A — Sampath (1 remaining)
        (uid, '2026-04-06', 'LUXURY X - 24M INSTALLMENT 24/24', 19583.33, 'Other', 'Sampath Credit Card'),

        # LUXURY X Plan B — Sampath (16 remaining)
        (uid, '2026-04-19', 'LUXURY X - 24M INSTALLMENT 9/24',  19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-05-19', 'LUXURY X - 24M INSTALLMENT 10/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-06-19', 'LUXURY X - 24M INSTALLMENT 11/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-07-19', 'LUXURY X - 24M INSTALLMENT 12/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-08-19', 'LUXURY X - 24M INSTALLMENT 13/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-09-19', 'LUXURY X - 24M INSTALLMENT 14/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-10-19', 'LUXURY X - 24M INSTALLMENT 15/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-11-19', 'LUXURY X - 24M INSTALLMENT 16/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2026-12-19', 'LUXURY X - 24M INSTALLMENT 17/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-01-19', 'LUXURY X - 24M INSTALLMENT 18/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-02-19', 'LUXURY X - 24M INSTALLMENT 19/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-03-19', 'LUXURY X - 24M INSTALLMENT 20/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-04-19', 'LUXURY X - 24M INSTALLMENT 21/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-05-19', 'LUXURY X - 24M INSTALLMENT 22/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-06-19', 'LUXURY X - 24M INSTALLMENT 23/24', 19028.50, 'Other', 'Sampath Credit Card'),
        (uid, '2027-07-19', 'LUXURY X - 24M INSTALLMENT 24/24', 19028.50, 'Other', 'Sampath Credit Card'),

        # LUXURY X Plan C — NTB AMEX (6 remaining)
        (uid, '2026-04-30', 'LUXURY X INST 7/12',  14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-05-31', 'LUXURY X INST 8/12',  14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-06-30', 'LUXURY X INST 9/12',  14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-07-31', 'LUXURY X INST 10/12', 14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-08-31', 'LUXURY X INST 11/12', 14333.33, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-09-30', 'LUXURY X INST 12/12', 14333.33, 'Other', 'NTB AMEX Credit Card'),

        # UNITY SYSTEMS — NTB AMEX (7 remaining)
        (uid, '2026-04-28', 'UNITY SYSTEMS SOLUTIONS INST 6/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-05-28', 'UNITY SYSTEMS SOLUTIONS INST 7/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-06-28', 'UNITY SYSTEMS SOLUTIONS INST 8/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-07-28', 'UNITY SYSTEMS SOLUTIONS INST 9/12',  9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-08-28', 'UNITY SYSTEMS SOLUTIONS INST 10/12', 9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-09-28', 'UNITY SYSTEMS SOLUTIONS INST 11/12', 9441.67, 'Other', 'NTB AMEX Credit Card'),
        (uid, '2026-10-28', 'UNITY SYSTEMS SOLUTIONS INST 12/12', 9441.67, 'Other', 'NTB AMEX Credit Card'),

        # ABANS ELITE — Sampath (19 remaining: 2/20–20/20)
        (uid, '2026-04-01', 'ABANS ELITE - 20M INSTALLMENT 2/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-05-01', 'ABANS ELITE - 20M INSTALLMENT 3/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-06-01', 'ABANS ELITE - 20M INSTALLMENT 4/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-07-01', 'ABANS ELITE - 20M INSTALLMENT 5/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-08-01', 'ABANS ELITE - 20M INSTALLMENT 6/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-09-01', 'ABANS ELITE - 20M INSTALLMENT 7/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-10-01', 'ABANS ELITE - 20M INSTALLMENT 8/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-11-01', 'ABANS ELITE - 20M INSTALLMENT 9/20',  2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2026-12-01', 'ABANS ELITE - 20M INSTALLMENT 10/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-01-01', 'ABANS ELITE - 20M INSTALLMENT 11/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-02-01', 'ABANS ELITE - 20M INSTALLMENT 12/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-03-01', 'ABANS ELITE - 20M INSTALLMENT 13/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-04-01', 'ABANS ELITE - 20M INSTALLMENT 14/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-05-01', 'ABANS ELITE - 20M INSTALLMENT 15/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-06-01', 'ABANS ELITE - 20M INSTALLMENT 16/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-07-01', 'ABANS ELITE - 20M INSTALLMENT 17/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-08-01', 'ABANS ELITE - 20M INSTALLMENT 18/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-09-01', 'ABANS ELITE - 20M INSTALLMENT 19/20', 2999.95, 'Other', 'Sampath Credit Card'),
        (uid, '2027-10-01', 'ABANS ELITE - 20M INSTALLMENT 20/20', 2999.95, 'Other', 'Sampath Credit Card'),

        # SELL-X COMPUTERS — NDB (31 remaining: 6/36–36/36, billing ~8th)
        (uid, '2026-05-08', 'SELL-X COMPUTERS INST 6/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-06-08', 'SELL-X COMPUTERS INST 7/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-07-08', 'SELL-X COMPUTERS INST 8/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-08-08', 'SELL-X COMPUTERS INST 9/36',  2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-09-08', 'SELL-X COMPUTERS INST 10/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-10-08', 'SELL-X COMPUTERS INST 11/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-11-08', 'SELL-X COMPUTERS INST 12/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-12-08', 'SELL-X COMPUTERS INST 13/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-01-08', 'SELL-X COMPUTERS INST 14/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-02-08', 'SELL-X COMPUTERS INST 15/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-03-08', 'SELL-X COMPUTERS INST 16/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-04-08', 'SELL-X COMPUTERS INST 17/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-05-08', 'SELL-X COMPUTERS INST 18/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-06-08', 'SELL-X COMPUTERS INST 19/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-07-08', 'SELL-X COMPUTERS INST 20/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-08-08', 'SELL-X COMPUTERS INST 21/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-09-08', 'SELL-X COMPUTERS INST 22/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-10-08', 'SELL-X COMPUTERS INST 23/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-11-08', 'SELL-X COMPUTERS INST 24/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-12-08', 'SELL-X COMPUTERS INST 25/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-01-08', 'SELL-X COMPUTERS INST 26/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-02-08', 'SELL-X COMPUTERS INST 27/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-03-08', 'SELL-X COMPUTERS INST 28/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-04-08', 'SELL-X COMPUTERS INST 29/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-05-08', 'SELL-X COMPUTERS INST 30/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-06-08', 'SELL-X COMPUTERS INST 31/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-07-08', 'SELL-X COMPUTERS INST 32/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-08-08', 'SELL-X COMPUTERS INST 33/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-09-08', 'SELL-X COMPUTERS INST 34/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-10-08', 'SELL-X COMPUTERS INST 35/36', 2717.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-11-08', 'SELL-X COMPUTERS INST 36/36', 2717.00, 'Other', 'NDB Credit Card'),

        # 1 PRO MART PVT LTD — NDB (22 remaining: 4/25–25/25, billing ~16th)
        (uid, '2026-04-16', '1 PRO MART PVT LTD INST 4/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-05-16', '1 PRO MART PVT LTD INST 5/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-06-16', '1 PRO MART PVT LTD INST 6/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-07-16', '1 PRO MART PVT LTD INST 7/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-08-16', '1 PRO MART PVT LTD INST 8/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-09-16', '1 PRO MART PVT LTD INST 9/25',  2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-10-16', '1 PRO MART PVT LTD INST 10/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-11-16', '1 PRO MART PVT LTD INST 11/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2026-12-16', '1 PRO MART PVT LTD INST 12/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-01-16', '1 PRO MART PVT LTD INST 13/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-02-16', '1 PRO MART PVT LTD INST 14/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-03-16', '1 PRO MART PVT LTD INST 15/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-04-16', '1 PRO MART PVT LTD INST 16/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-05-16', '1 PRO MART PVT LTD INST 17/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-06-16', '1 PRO MART PVT LTD INST 18/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-07-16', '1 PRO MART PVT LTD INST 19/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-08-16', '1 PRO MART PVT LTD INST 20/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-09-16', '1 PRO MART PVT LTD INST 21/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-10-16', '1 PRO MART PVT LTD INST 22/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-11-16', '1 PRO MART PVT LTD INST 23/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2027-12-16', '1 PRO MART PVT LTD INST 24/25', 2248.00, 'Other', 'NDB Credit Card'),
        (uid, '2028-01-16', '1 PRO MART PVT LTD INST 25/25', 2248.00, 'Other', 'NDB Credit Card'),
    ]

    for e in entries:
        try:
            bind.execute(sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer, created_at)
                VALUES (:uid, :date, :desc, :amt, :cat, :acct, 0, CURRENT_TIMESTAMP)
            """), {"uid": e[0], "date": e[1], "desc": e[2], "amt": e[3], "cat": e[4], "acct": e[5]})
        except Exception as ex:
            print(f"Skipping duplicate: {e[2]} {e[1]} — {ex}")


def downgrade() -> None:
    """Downgrade schema."""
    pass
