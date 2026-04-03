from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from app.db.models import DebtTypeEnum, DebtStatusEnum, GoalCategoryEnum, BudgetCategoryTypeEnum, IncomeCategoryEnum

class IncomeBase(BaseModel):
    date: date
    description: str
    amount: float
    category: IncomeCategoryEnum = IncomeCategoryEnum.salary

class IncomeCreate(IncomeBase):
    pass

class IncomeResponse(IncomeBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    date: date
    description: str
    amount: float
    category: str
    account: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class DebtPaymentBase(BaseModel):
    amount: float
    payment_date: date
    notes: Optional[str] = None

class DebtPaymentCreate(DebtPaymentBase):
    pass

class DebtPaymentResponse(DebtPaymentBase):
    id: int
    debt_id: int
    class Config:
        from_attributes = True

class DebtBase(BaseModel):
    name: str
    type: DebtTypeEnum
    balance: float
    credit_limit: Optional[float] = None
    interest_rate: float
    min_payment: float
    due_date: Optional[int] = None
    status: DebtStatusEnum = DebtStatusEnum.current

class DebtCreate(DebtBase):
    pass

class DebtResponse(DebtBase):
    id: int
    user_id: int
    created_at: datetime
    payments: List[DebtPaymentResponse] = []
    class Config:
        from_attributes = True

class ContributionBase(BaseModel):
    amount: float
    contribution_date: date
    notes: Optional[str] = None

class ContributionCreate(ContributionBase):
    pass

class ContributionResponse(ContributionBase):
    id: int
    goal_id: int
    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    name: str
    category: GoalCategoryEnum
    target_amount: float
    current_amount: float = 0.0
    monthly_contribution: float
    interest_rate: float = 0.0
    target_date: date

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    contributions: List[ContributionResponse] = []
    class Config:
        from_attributes = True

class BudgetCategoryBase(BaseModel):
    name: str
    monthly_budget: float
    type: BudgetCategoryTypeEnum

class BudgetCategoryCreate(BudgetCategoryBase):
    pass

class BudgetCategoryResponse(BudgetCategoryBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True
