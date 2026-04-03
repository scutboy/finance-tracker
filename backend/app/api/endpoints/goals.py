from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import models
from app.schemas import schemas
from app.db.database import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.SavingsGoal).filter(models.SavingsGoal.user_id == current_user.id).all()

@router.post("/", response_model=schemas.GoalResponse)
def create_goal(
    goal_in: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_goal = models.SavingsGoal(**goal_in.dict(), user_id=current_user.id)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.put("/{goal_id}", response_model=schemas.GoalResponse)
def update_goal(
    goal_id: int,
    goal_in: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    goal = db.query(models.SavingsGoal).filter(models.SavingsGoal.id == goal_id, models.SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    for var, value in goal_in.dict().items():
        setattr(goal, var, value)
        
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    goal = db.query(models.SavingsGoal).filter(models.SavingsGoal.id == goal_id, models.SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    db.delete(goal)
    db.commit()
    return {"status": "success"}

@router.post("/{goal_id}/contribution", response_model=schemas.ContributionResponse)
def add_goal_contribution(
    goal_id: int,
    contribution_in: schemas.ContributionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    goal = db.query(models.SavingsGoal).filter(models.SavingsGoal.id == goal_id, models.SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    goal.current_amount += contribution_in.amount
        
    new_contrib = models.GoalContribution(**contribution_in.dict(), goal_id=goal.id, user_id=current_user.id)
    db.add(new_contrib)
    db.commit()
    db.refresh(new_contrib)
    return new_contrib
