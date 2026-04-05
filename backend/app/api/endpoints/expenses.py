from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app.db import models
from app.schemas import schemas
from app.db.database import get_db
from app.api.deps import get_current_user
from app.services import statement_parser

router = APIRouter()

@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    month: Optional[str] = None, # format YYYY-MM
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Expense).filter(models.Expense.user_id == current_user.id)
    
    if month:
        try:
            year, m = month.split('-')
            query = query.filter(models.Expense.date >= date(int(year), int(m), 1))
            if int(m) == 12:
                query = query.filter(models.Expense.date < date(int(year) + 1, 1, 1))
            else:
                query = query.filter(models.Expense.date < date(int(year), int(m) + 1, 1))
        except ValueError:
            pass
            
    if category:
        query = query.filter(models.Expense.category == category)
        
    if search:
        query = query.filter(models.Expense.description.ilike(f"%{search}%"))
        
    return query.order_by(models.Expense.date.desc()).all()

@router.post("/", response_model=schemas.ExpenseResponse)
def create_expense(
    expense_in: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_expense = models.Expense(**expense_in.dict(), user_id=current_user.id)
    
    # Automated Flux: If linked to a credit card/debt node, increase the balance
    if expense_in.linked_card_id:
        debt = db.query(models.Debt).filter(
            models.Debt.id == expense_in.linked_card_id,
            models.Debt.user_id == current_user.id
        ).first()
        if debt:
            debt.balance += expense_in.amount
            
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.put("/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_in: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    for var, value in expense_in.dict().items():
        setattr(expense, var, value)
        
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return {"status": "success"}

@router.post("/import", response_model=List[schemas.ExpenseResponse])
def import_expenses(
    expenses_in: List[schemas.ExpenseCreate],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_expenses = []
    for exp in expenses_in:
        new_expense = models.Expense(**exp.dict(), user_id=current_user.id)
        db.add(new_expense)
        new_expenses.append(new_expense)
        
    db.commit()
    for exp in new_expenses:
        db.refresh(exp)
        
    return new_expenses


@router.post("/upload-statement")
async def upload_statement(
    file: UploadFile = File(...),
    account_name: str = Form(default="Imported"),
    current_user: models.User = Depends(get_current_user)
):
    """
    Parse a PDF or CSV bank/credit card statement.
    Returns parsed transactions for frontend preview — nothing is saved to the DB.
    The client then calls POST /expenses/import with the confirmed transactions.
    """
    allowed_types = {"application/pdf", "text/csv", "text/plain", "application/vnd.ms-excel",
                     "application/octet-stream"}
    
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ("pdf", "csv"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Please upload a PDF or CSV file."
        )

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:  # 20 MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20 MB.")

    try:
        transactions = statement_parser.parse_file(filename, content, account_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse statement: {str(e)}"
        )

    return {
        "filename": filename,
        "account_name": account_name,
        "count": len(transactions),
        "transactions": transactions,
    }
