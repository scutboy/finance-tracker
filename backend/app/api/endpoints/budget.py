from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import models
from app.schemas import schemas
from app.db.database import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.BudgetCategoryResponse])
def get_budget_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.BudgetCategory).filter(models.BudgetCategory.user_id == current_user.id).all()

@router.post("/categories", response_model=schemas.BudgetCategoryResponse)
def create_category(
    category_in: schemas.BudgetCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_cat = models.BudgetCategory(**category_in.dict(), user_id=current_user.id)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.put("/categories/{category_id}", response_model=schemas.BudgetCategoryResponse)
def update_category(
    category_id: int,
    category_in: schemas.BudgetCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cat = db.query(models.BudgetCategory).filter(models.BudgetCategory.id == category_id, models.BudgetCategory.user_id == current_user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    for var, value in category_in.dict().items():
        setattr(cat, var, value)
        
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cat = db.query(models.BudgetCategory).filter(models.BudgetCategory.id == category_id, models.BudgetCategory.user_id == current_user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    db.delete(cat)
    db.commit()
    return {"status": "success"}
