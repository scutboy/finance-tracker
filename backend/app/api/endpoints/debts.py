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
    strategy: str = "avalanche",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    active_debts_db = db.query(models.Debt).filter(
        models.Debt.user_id == current_user.id,
        models.Debt.status != models.DebtStatusEnum.paid_off,
        models.Debt.balance > 0
    ).all()
    
    debts = [{"id": d.id, "name": d.name, "balance": d.balance, "rate": d.interest_rate, "min_payment": d.min_payment, "payoff_month": 0} for d in active_debts_db]
    if strategy == "avalanche": debts.sort(key=lambda x: x["rate"], reverse=True)
    elif strategy == "snowball": debts.sort(key=lambda x: x["balance"])
    
    months_passed, total_interest_paid = 0, 0.0
    max_months = 1200 
    
    while any(d["balance"] > 0 for d in debts) and months_passed < max_months:
        months_passed += 1
        extra_left_this_month = extra
        for d in debts:
            if d["balance"] > 0:
                interest = d["balance"] * (d["rate"] / 100 / 12)
                d["balance"] += interest
                total_interest_paid += interest
        for d in debts:
            if d["balance"] > 0:
                payment = min(d["min_payment"], d["balance"])
                d["balance"] -= payment
                if d["balance"] <= 0.01:
                    d["balance"] = 0
                    if d["payoff_month"] == 0: d["payoff_month"] = months_passed
        for d in debts:
            if d["balance"] > 0 and extra_left_this_month > 0:
                payment = min(extra_left_this_month, d["balance"])
                d["balance"] -= payment
                extra_left_this_month -= payment
                if d["balance"] <= 0.01:
                    d["balance"] = 0
                    if d["payoff_month"] == 0: d["payoff_month"] = months_passed
    
    for d in debts:
        if d["balance"] > 0 and d["payoff_month"] == 0: d["payoff_month"] = max_months

    return {
        "months_to_payoff": months_passed,
        "total_interest": round(total_interest_paid, 2),
        "payoff_order": [{"name": d["name"], "payoff_month": d["payoff_month"]} for d in sorted(debts, key=lambda x: x["payoff_month"])]
    }

@router.post("/", response_model=schemas.DebtResponse)
def create_debt(debt_in: schemas.DebtCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_debt = models.Debt(**debt_in.dict(), user_id=current_user.id)
    db.add(new_debt)
    db.commit()
    db.refresh(new_debt)
    return new_debt

@router.put("/{debt_id}", response_model=schemas.DebtResponse)
def update_debt(debt_id: int, debt_in: schemas.DebtCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.user_id == current_user.id).first()
    if not debt: raise HTTPException(status_code=404, detail="Debt not found")
    for var, value in debt_in.dict().items(): setattr(debt, var, value)
    db.commit()
    db.refresh(debt)
    return debt

@router.delete("/{debt_id}")
def delete_debt(debt_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.user_id == current_user.id).first()
    if not debt: raise HTTPException(status_code=404, detail="Debt not found")
    db.delete(debt)
    db.commit()
    return {"status": "success"}

@router.post("/{debt_id}/payment", response_model=schemas.DebtPaymentResponse)
def add_debt_payment(debt_id: int, payment_in: schemas.DebtPaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.user_id == current_user.id).first()
    if not debt: raise HTTPException(status_code=404, detail="Debt not found")
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
def get_debt_projection(extra: float = 0.0, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    active_debts_db = db.query(models.Debt).filter(models.Debt.user_id == current_user.id, models.Debt.status != models.DebtStatusEnum.paid_off, models.Debt.balance > 0).all()
    if not active_debts_db: return {"chart": [], "avalanche_months": 0, "avalanche_interest": 0, "snowball_months": 0, "snowball_interest": 0, "payoff_order": [], "insights": [], "total_debt": 0}

    def simulate(debts_input, strat, extra_payment):
        # Create a deep copy to preserve original input
        sim_debts = [copy.deepcopy(d) for d in debts_input]
        if strat == "avalanche": sim_debts.sort(key=lambda x: x["rate"], reverse=True)
        else: sim_debts.sort(key=lambda x: x["balance"])
        
        months, total_interest, timeline = 0, 0.0, []
        max_months = 1200
        while any(d["balance"] > 0 for d in sim_debts) and months < max_months:
            months += 1
            cur_interest = 0.0
            for d in sim_debts:
                if d["balance"] > 0:
                    interest = d["balance"] * (d["rate"] / 100 / 12)
                    d["balance"] += interest
                    total_interest += interest
                    cur_interest += interest
            for d in sim_debts:
                if d["balance"] > 0:
                    pmt = min(d["min"], d["balance"])
                    d["balance"] = max(0, d["balance"] - pmt)
                    if d["balance"] <= 0.01:
                        d["balance"] = 0
                        if d["paid_month"] == 0: d["paid_month"] = months
            extra_left = extra_payment
            for d in sim_debts:
                if d["balance"] > 0 and extra_left > 0:
                    pmt = min(extra_left, d["balance"])
                    d["balance"] = max(0, d["balance"] - pmt)
                    extra_left -= pmt
                    if d["balance"] <= 0.01:
                        d["balance"] = 0
                        if d["paid_month"] == 0: d["paid_month"] = months
            timeline.append({"month": months, "balance": sum(d["balance"] for d in sim_debts), "interest": cur_interest})
        return months, total_interest, timeline, sim_debts

    raw = [{"id": d.id, "name": d.name, "balance": d.balance, "rate": d.interest_rate, "min": d.min_payment, "paid_month": 0} for d in active_debts_db]
    
    # Calculate Base (Extra 0) and Target (Current Extra)
    base_months, base_interest, _, _ = simulate(raw, "avalanche", 0)
    av_months, av_interest, av_timeline, av_debts = simulate(raw, "avalanche", extra)
    sw_months, sw_interest, sw_timeline, _ = simulate(raw, "snowball", extra)

    # Chart logic (Capped at 120 months)
    chart = []
    for m in range(1, min(max(av_months, sw_months) + 1, 121)):
        av_bal = next((x["balance"] for x in av_timeline if x["month"] == m), 0)
        sw_bal = next((x["balance"] for x in sw_timeline if x["month"] == m), 0)
        chart.append({"month": m, "avalanche": av_bal, "snowball": sw_bal})

    insights = []
    total_debt = sum(d.balance for d in active_debts_db)
    highest_rate = max(active_debts_db, key=lambda d: d.interest_rate)
    
    # Meaningful deltas for "Injection Scenario"
    months_saved_total = base_months - av_months
    interest_saved_total = base_interest - av_interest
    
    if extra > 0:
        if months_saved_total > 0:
            insights.append(f"CURRENT INJECTION: Reclaims {months_saved_total} months of your life vs minimum payments.")
        if interest_saved_total > 0:
            insights.append(f"CURRENT INJECTION: Avoids {formatCurrencyLite(interest_saved_total)} in interest leakage.")
    
    insights.append(f"PRIORITY: Neutralize {highest_rate.name} first ({highest_rate.interest_rate}% APR) to minimize flux.")
    if sw_interest - av_interest > 0:
        insights.append(f"STRATEGY: Avalanche is currently {formatCurrencyLite(sw_interest - av_interest)} more efficient than Snowball.")

    return {
        "chart": chart,
        "avalanche_months": av_months, "avalanche_interest": av_interest,
        "snowball_months": sw_months, "snowball_interest": sw_interest,
        "savings_vs_snowball": round(sw_interest - av_interest, 2),
        "months_saved_vs_snowball": sw_months - av_months,
        "months_saved_vs_baseline": months_saved_total,
        "interest_saved_vs_baseline": round(interest_saved_total, 2),
        "payoff_order": [{"name": d["name"], "paid_month": d["paid_month"]} for d in sorted(av_debts, key=lambda x: x["paid_month"])],
        "insights": insights,
        "total_debt": round(total_debt, 2),
    }

def formatCurrencyLite(val): return f"Rs {val:,.0f}"
