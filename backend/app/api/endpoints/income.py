from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.db import models
from app.schemas import schemas
from app.db.database import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.IncomeResponse])
def get_income(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Income).filter(models.Income.user_id == current_user.id)
    if month:
        try:
            year, m = month.split('-')
            query = query.filter(models.Income.date >= date(int(year), int(m), 1))
            if int(m) == 12:
                query = query.filter(models.Income.date < date(int(year) + 1, 1, 1))
            else:
                query = query.filter(models.Income.date < date(int(year), int(m) + 1, 1))
        except ValueError:
            pass
    return query.order_by(models.Income.date.desc()).all()

@router.post("/", response_model=schemas.IncomeResponse)
def create_income(
    income_in: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_income = models.Income(**income_in.dict(), user_id=current_user.id)
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income

@router.put("/{income_id}", response_model=schemas.IncomeResponse)
def update_income(
    income_id: int,
    income_in: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == current_user.id
    ).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income record not found")
    for var, value in income_in.dict().items():
        setattr(income, var, value)
    db.commit()
    db.refresh(income)
    return income

@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == current_user.id
    ).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income record not found")
    db.delete(income)
    db.commit()
    return {"status": "success"}
