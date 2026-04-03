from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.db import models
from app.db.database import get_db
from app.api.deps import get_current_user
from dateutil.relativedelta import relativedelta

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1).date()

    # ── Debt ──────────────────────────────────────────────────────────────────
    active_debts = db.query(models.Debt).filter(
        models.Debt.user_id == current_user.id,
        models.Debt.status != models.DebtStatusEnum.paid_off
    ).all()
    total_debt = sum(d.balance for d in active_debts)
    debt_breakdown = [{"name": d.name, "balance": d.balance} for d in active_debts]

    # ── Savings ───────────────────────────────────────────────────────────────
    goals = db.query(models.SavingsGoal).filter(
        models.SavingsGoal.user_id == current_user.id
    ).all()
    total_saved = sum(g.current_amount for g in goals)
    savings_progress = [
        {
            "name": g.name,
            "target": g.target_amount,
            "current": g.current_amount,
            "percentage": min((g.current_amount / g.target_amount * 100), 100) if g.target_amount > 0 else 0
        } for g in goals
    ]

    # ── Net Worth (savings - debt) ────────────────────────────────────────────
    net_worth = total_saved - total_debt

    # ── This Month's Expenses & Income ───────────────────────────────────────
    current_month_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= month_start
    ).scalar() or 0.0

    current_month_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= month_start
    ).scalar() or 0.0

    net_cash_flow = current_month_income - current_month_expenses

    # ── 6-Month Cash Flow (income vs expenses) ────────────────────────────────
    cash_flow = []
    for i in range(5, -1, -1):
        target_month = now - relativedelta(months=i)
        start_date = datetime(target_month.year, target_month.month, 1).date()
        end_date = start_date + relativedelta(months=1)

        month_expense = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.user_id == current_user.id,
            models.Expense.date >= start_date,
            models.Expense.date < end_date
        ).scalar() or 0.0

        month_income = db.query(func.sum(models.Income.amount)).filter(
            models.Income.user_id == current_user.id,
            models.Income.date >= start_date,
            models.Income.date < end_date
        ).scalar() or 0.0

        cash_flow.append({
            "month": start_date.strftime("%b %Y"),
            "spent": round(month_expense, 2),
            "income": round(month_income, 2),
            "net": round(month_income - month_expense, 2),
        })

    # ── Recent Income entries (last 5) ────────────────────────────────────────
    recent_income = db.query(models.Income).filter(
        models.Income.user_id == current_user.id
    ).order_by(models.Income.date.desc()).limit(5).all()

    return {
        "net_worth": round(net_worth, 2),
        "total_debt": round(total_debt, 2),
        "total_saved": round(total_saved, 2),
        "monthly_expenses": round(current_month_expenses, 2),
        "monthly_income": round(current_month_income, 2),
        "net_cash_flow": round(net_cash_flow, 2),
        "cash_flow": cash_flow,
        "savings_progress": savings_progress,
        "debt_breakdown": debt_breakdown,
        "recent_income": [
            {"description": i.description, "amount": i.amount, "category": i.category, "date": str(i.date)}
            for i in recent_income
        ],
    }
