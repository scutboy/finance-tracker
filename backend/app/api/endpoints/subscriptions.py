from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models
from app.schemas import schemas
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.SubscriptionResponse)
def create_subscription(
    sub: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_sub = models.Subscription(**sub.dict(), user_id=current_user.id)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.get("/", response_model=List[schemas.SubscriptionResponse])
def get_subscriptions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).all()

@router.put("/{sub_id}", response_model=schemas.SubscriptionResponse)
def update_subscription(
    sub_id: int,
    sub: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_sub = db.query(models.Subscription).filter(
        models.Subscription.id == sub_id, 
        models.Subscription.user_id == current_user.id
    ).first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    for key, value in sub.dict().items():
        setattr(db_sub, key, value)
    
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.delete("/{sub_id}")
def delete_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_sub = db.query(models.Subscription).filter(
        models.Subscription.id == sub_id, 
        models.Subscription.user_id == current_user.id
    ).first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(db_sub)
    db.commit()
    return {"message": "Subscription deleted"}
