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
    
    # ── Pay-Cycle Calculation ────────────────────────────────────────────────
    # The financial month starts on the 25th and ends on the 24th of the next month.
    if now.day >= 25:
        # We are past the 25th, so the cycle started this month
        cycle_start = datetime(now.year, now.month, 25).date()
    else:
        # We are before the 25th, so the cycle started last month
        if now.month == 1:
            cycle_start = datetime(now.year - 1, 12, 25).date()
        else:
            cycle_start = datetime(now.year, now.month - 1, 25).date()

    # ── Debt ──────────────────────────────────────────────────────────────────
    active_debts = db.query(models.Debt).filter(
        models.Debt.user_id == current_user.id,
        models.Debt.status != models.DebtStatusEnum.paid_off
    ).all()
    total_debt = sum(d.balance for d in active_debts)
    debt_breakdown = [{"name": d.name, "balance": d.balance} for d in active_debts]
    
    # Target Debt (Snowball default - lowest balance)
    target_debt = None
    if active_debts:
        sorted_debts = sorted(active_debts, key=lambda d: d.balance)
        target_debt = {
            "id": sorted_debts[0].id,
            "name": sorted_debts[0].name,
            "balance": sorted_debts[0].balance,
            "interest_rate": sorted_debts[0].interest_rate
        }

    # ── Savings ───────────────────────────────────────────────────────────────
    try:
        goals = db.query(models.SavingsGoal).filter(
            models.SavingsGoal.user_id == current_user.id
        ).all()
    except Exception:
        goals = []
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
        models.Expense.date >= cycle_start
    ).scalar() or 0.0

    current_month_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= cycle_start
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

    # Calculate Hourly interest leakage (simplified average APR)
    total_hourly_leakage = 0.0
    for d in active_debts:
        # monthly rate = apr/100/12, hourly = monthly/30/24
        hourly_rate = (d.interest_rate / 100) / 365 / 24
        total_hourly_leakage += d.balance * hourly_rate

    # ── Subscriptions ────────────────────────────────────────────────────────
    subs = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id,
        models.Subscription.status == 'active'
    ).all()
    
    total_sub_monthly = 0.0
    USD_TO_LKR_RATE = 300.0  # Constant as requested
    
    for s in subs:
        amt = s.amount
        if s.currency == 'USD':
            amt *= USD_TO_LKR_RATE
        total_sub_monthly += amt

    # Add subscription costs to current month expenses for a more accurate "Leakage" view
    current_month_expenses += total_sub_monthly

    # ── Recent Income entries (last 5) ────────────────────────────────────────
    recent_income = db.query(models.Income).filter(
        models.Income.user_id == current_user.id
    ).order_by(models.Income.date.desc()).limit(5).all()

    # Get recent transactions (both income and expenses) for the Flux Trace
    recent_txns = []
    
    # Get last 4 expenses
    recent_expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).order_by(models.Expense.date.desc()).limit(4).all()
    
    for e in recent_expenses:
        try:
            cat = e.category.value if hasattr(e.category, 'value') else str(e.category or 'Other')
        except Exception:
            cat = 'Other'
        recent_txns.append({
            "type": "expense",
            "description": e.description,
            "amount": e.amount,
            "category": cat,
            "date": str(e.date)
        })
        
    for i in recent_income:
        recent_txns.append({
            "type": "income",
            "description": i.description,
            "amount": i.amount,
            "category": i.category.value if hasattr(i.category, 'value') else str(i.category or 'Other'),
            "date": str(i.date)
        })
        
    # Sort and slice safely
    try:
        recent_txns = sorted(recent_txns, key=lambda x: str(x.get('date', '0000-01-01')), reverse=True)[:4]
    except Exception:
        recent_txns = recent_txns[:4]

    return {
        "net_worth": round(net_worth, 2),
        "total_debt": round(total_debt, 2),
        "total_saved": round(total_saved, 2),
        "total_expenses": round(current_month_expenses, 2),
        "total_income": round(current_month_income, 2),
        "monthly_expenses": round(current_month_expenses, 2), # Legacy key fallback
        "monthly_income": round(current_month_income, 2),   # Legacy key fallback
        "net_cash_flow": round(net_cash_flow, 2),
        "hourly_leakage": round(total_hourly_leakage, 4),
        "cash_flow": cash_flow,
        "savings_progress": savings_progress,
        "debt_breakdown": debt_breakdown,
        "target_debt": target_debt,
        "recent_transactions": recent_txns,
        "total_subscriptions": round(total_sub_monthly, 2)
    }
