from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import models
from app.schemas import schemas
from app.db.database import get_db
from app.api.deps import get_current_user
import copy

router = APIRouter()

@router.get("/", response_model=List[schemas.DebtResponse])
def get_debts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Debt).filter(models.Debt.user_id == current_user.id).all()

@router.get("/payoff")
def get_payoff_estimate(
    extra: float = 0.0,
    strategy: str = "avalanche", # avalanche or snowball
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    active_debts_db = db.query(models.Debt).filter(
        models.Debt.user_id == current_user.id,
        models.Debt.status != models.DebtStatusEnum.paid_off,
        models.Debt.balance > 0
    ).all()
    
    # create copies to simulate
    debts = [{"id": d.id, "name": d.name, "balance": d.balance, "rate": d.interest_rate, "min_payment": d.min_payment, "payoff_month": 0} for d in active_debts_db]
    
    if strategy == "avalanche":
        debts.sort(key=lambda x: x["rate"], reverse=True)
    elif strategy == "snowball":
        debts.sort(key=lambda x: x["balance"])
    
    months_passed = 0
    total_interest_paid = 0.0
    
    # payoff simulator
    # safety max _iterations to avoid infinite loop
    max_months = 1200 # 100 years max
    
    while any(d["balance"] > 0 for d in debts) and months_passed < max_months:
        months_passed += 1
        extra_left_this_month = extra
        
        # apply interest
        for d in debts:
            if d["balance"] > 0:
                monthly_interest = d["balance"] * (d["rate"] / 100 / 12)
                d["balance"] += monthly_interest
                total_interest_paid += monthly_interest
                
        # apply minimum payments
        for d in debts:
            if d["balance"] > 0:
                payment = min(d["min_payment"], d["balance"])
                d["balance"] -= payment
                if d["balance"] <= 0.01:
                    d["balance"] = 0
                    if d["payoff_month"] == 0:
                        d["payoff_month"] = months_passed
        
        # apply extra payments to priority debt
        for d in debts:
            if d["balance"] > 0 and extra_left_this_month > 0:
                payment = min(extra_left_this_month, d["balance"])
                d["balance"] -= payment
                extra_left_this_month -= payment
                if d["balance"] <= 0.01:
                    d["balance"] = 0
                    if d["payoff_month"] == 0:
                        d["payoff_month"] = months_passed
    
    # Catch any debts that didn't fully pay off
    for d in debts:
        if d["balance"] > 0 and d["payoff_month"] == 0:
            d["payoff_month"] = max_months

    payoff_order = [{"name": d["name"], "payoff_month": d["payoff_month"]} for d in debts]
    payoff_order.sort(key=lambda x: x["payoff_month"])

    return {
        "months_to_payoff": months_passed,
        "total_interest": round(total_interest_paid, 2),
        "payoff_order": payoff_order
    }

@router.post("/", response_model=schemas.DebtResponse)
def create_debt(
    debt_in: schemas.DebtCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_debt = models.Debt(**debt_in.dict(), user_id=current_user.id)
    db.add(new_debt)
    db.commit()
    db.refresh(new_debt)
    return new_debt

@router.put("/{debt_id}", response_model=schemas.DebtResponse)
def update_debt(
    debt_id: int,
    debt_in: schemas.DebtCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.user_id == current_user.id).first()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
        
    for var, value in debt_in.dict().items():
        setattr(debt, var, value)
        
    db.commit()
    db.refresh(debt)
    return debt

@router.delete("/{debt_id}")
def delete_debt(
    debt_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.user_id == current_user.id).first()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
        
    db.delete(debt)
    db.commit()
    return {"status": "success"}

@router.post("/{debt_id}/payment", response_model=schemas.DebtPaymentResponse)
def add_debt_payment(
    debt_id: int,
    payment_in: schemas.DebtPaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.user_id == current_user.id).first()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
        
    # deduct balance and create payment
    debt.balance -= payment_in.amount
    if debt.balance <= 0.01:
        debt.balance = 0
        debt.status = models.DebtStatusEnum.paid_off
        
    new_payment = models.DebtPayment(**payment_in.dict(), debt_id=debt.id, user_id=current_user.id)
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment


@router.get("/projection")
def get_debt_projection(
    extra: float = 0.0,
    strategy: str = "avalanche",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns month-by-month debt balance and interest projections for the Debt Advisor.
    Compares avalanche vs snowball strategies.
    """
    active_debts_db = db.query(models.Debt).filter(
        models.Debt.user_id == current_user.id,
        models.Debt.status != models.DebtStatusEnum.paid_off,
        models.Debt.balance > 0
    ).all()

    if not active_debts_db:
        return {"timeline": [], "avalanche_months": 0, "snowball_months": 0,
                "avalanche_interest": 0, "snowball_interest": 0, "insights": []}

    def simulate(debts_input, strat, extra_payment):
        import copy
        debts = [{"id": d["id"], "name": d["name"], "balance": d["balance"],
                  "rate": d["rate"], "min": d["min"], "paid_month": 0} for d in debts_input]
        if strat == "avalanche":
            debts.sort(key=lambda x: x["rate"], reverse=True)
        else:
            debts.sort(key=lambda x: x["balance"])

        months, total_interest = 0, 0.0
        monthly_totals = []
        max_months = 600

        while any(d["balance"] > 0 for d in debts) and months < max_months:
            months += 1
            extra_left = extra_payment
            month_interest = 0.0
            for d in debts:
                if d["balance"] > 0:
                    interest = d["balance"] * (d["rate"] / 100 / 12)
                    d["balance"] += interest
                    total_interest += interest
                    month_interest += interest
            for d in debts:
                if d["balance"] > 0:
                    pmt = min(d["min"], d["balance"])
                    d["balance"] = max(0, d["balance"] - pmt)
                    if d["balance"] <= 0.01:
                        d["balance"] = 0
                        if d["paid_month"] == 0:
                            d["paid_month"] = months
            for d in debts:
                if d["balance"] > 0 and extra_left > 0:
                    pmt = min(extra_left, d["balance"])
                    d["balance"] = max(0, d["balance"] - pmt)
                    extra_left -= pmt
                    if d["balance"] <= 0.01:
                        d["balance"] = 0
                        if d["paid_month"] == 0:
                            d["paid_month"] = months

            monthly_totals.append({
                "month": months,
                "total_balance": round(sum(d["balance"] for d in debts), 2),
                "interest_paid": round(month_interest, 2),
            })

        for d in debts:
            if d["balance"] > 0 and d["paid_month"] == 0:
                d["paid_month"] = max_months

        return months, round(total_interest, 2), monthly_totals, debts

    raw = [{"id": d.id, "name": d.name, "balance": d.balance,
            "rate": d.interest_rate, "min": d.min_payment} for d in active_debts_db]

    av_months, av_interest, av_timeline, av_debts = simulate(raw, "avalanche", extra)
    sw_months, sw_interest, sw_timeline, sw_debts = simulate(raw, "snowball", extra)

    # Build chart-friendly timeline (union of months)
    max_m = max(av_months, sw_months, 1)
    chart = []
    for m in range(1, min(max_m + 1, 121)):  # cap at 10 years for chart
        av_bal = next((x["total_balance"] for x in av_timeline if x["month"] == m), 0)
        sw_bal = next((x["total_balance"] for x in sw_timeline if x["month"] == m), 0)
        chart.append({"month": m, "avalanche": av_bal, "snowball": sw_bal})

    # Generate insights
    total_debt = sum(d.balance for d in active_debts_db)
    highest_rate = max(active_debts_db, key=lambda d: d.interest_rate)
    savings = sw_interest - av_interest
    months_saved = sw_months - av_months

    insights = []
    if savings > 0:
        insights.append(f"Avalanche strategy saves you {'+Rs {:,.0f}'.format(savings)} in interest vs Snowball.")
    if months_saved > 0:
        insights.append(f"Avalanche gets you debt-free {months_saved} months sooner than Snowball.")
    if extra == 0:
        extra_impact_months, extra_impact_int, _, _ = simulate(raw, "avalanche", 5000)
        m_diff = av_months - extra_impact_months
        i_diff = av_interest - extra_impact_int
        if m_diff > 0:
            insights.append(f"Paying just Rs 5,000 extra/month cuts {m_diff} months and saves Rs {i_diff:,.0f} in interest.")
    insights.append(f"Your highest-rate debt is {highest_rate.name} at {highest_rate.interest_rate}% APR — focus here first.")
    if total_debt > 0 and av_months > 0:
        insights.append(f"At minimum payments, you'll be debt-free in {av_months} months ({av_months/12:.1f} years).")

    # Per-debt payoff order
    av_order = sorted(av_debts, key=lambda d: d["paid_month"])

    return {
        "chart": chart,
        "avalanche_months": av_months,
        "avalanche_interest": av_interest,
        "snowball_months": sw_months,
        "snowball_interest": sw_interest,
        "savings_vs_snowball": round(sw_interest - av_interest, 2),
        "months_saved_vs_snowball": sw_months - av_months,
        "payoff_order": [{"name": d["name"], "paid_month": d["paid_month"]} for d in av_order],
        "insights": insights,
        "total_debt": round(total_debt, 2),
    }
