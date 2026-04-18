from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean, Enum as SQLAlchemyEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

class IncomeCategoryEnum(str, enum.Enum):
    salary = "Salary"
    freelance = "Freelance"
    business = "Business"
    investment = "Investment"
    rental = "Rental"
    bonus = "Bonus"
    other = "Other"

class DebtTypeEnum(str, enum.Enum):
    credit_card = "Credit Card"
    personal_loan = "Personal Loan"
    mortgage = "Mortgage"
    vehicle_loan = "Vehicle Loan"
    other = "Other"

class DebtStatusEnum(str, enum.Enum):
    current = "Current"
    overdue = "Overdue"
    paid_off = "Paid Off"

class GoalCategoryEnum(str, enum.Enum):
    emergency = "Emergency Fund"
    education = "Child Education"
    retirement = "Retirement"
    property = "Property"
    vehicle = "Vehicle"
    travel = "Travel"
    investment = "Investment"
    other = "Other"

class BudgetCategoryTypeEnum(str, enum.Enum):
    essential = "Essential"
    discretionary = "Discretionary"
    savings = "Savings"
    debt = "Debt"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False, default="other")
    account = Column(String, nullable=True)
    is_transfer = Column(Boolean, default=False)
    linked_card_id = Column(Integer, ForeignKey("debts.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    linked_card = relationship("Debt")

class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False, default="salary")
    account = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'date', 'amount', 'description', name='uq_income_entry'),
    )

    owner = relationship("User")

class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(SQLAlchemyEnum(DebtTypeEnum), nullable=False)
    balance = Column(Float, nullable=False)
    credit_limit = Column(Float)
    interest_rate = Column(Float, nullable=False)
    min_payment = Column(Float, nullable=False)
    due_date = Column(Integer) # day of the month
    status = Column(SQLAlchemyEnum(DebtStatusEnum), default=DebtStatusEnum.current)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    payments = relationship("DebtPayment", back_populates="debt", cascade="all, delete")

class DebtPayment(Base):
    __tablename__ = "debt_payments"

    id = Column(Integer, primary_key=True, index=True)
    debt_id = Column(Integer, ForeignKey("debts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=False)
    notes = Column(String)

    debt = relationship("Debt", back_populates="payments")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(SQLAlchemyEnum(GoalCategoryEnum), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    monthly_contribution = Column(Float, nullable=False)
    interest_rate = Column(Float, default=0.0) # Annual interest rate
    target_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    contributions = relationship("GoalContribution", back_populates="goal", cascade="all, delete")

class GoalContribution(Base):
    __tablename__ = "goal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("savings_goals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    contribution_date = Column(Date, nullable=False)
    notes = Column(String)

    goal = relationship("SavingsGoal", back_populates="contributions")

class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    monthly_budget = Column(Float, nullable=False)
    type = Column(SQLAlchemyEnum(BudgetCategoryTypeEnum), nullable=False)

    owner = relationship("User")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    billing_day = Column(Integer, nullable=False) # day of the month
    category = Column(String)
    linked_card_id = Column(Integer, ForeignKey("debts.id"), nullable=True)
    status = Column(String, default="active") # active, cancelled, paused
    currency = Column(String, default="LKR")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    linked_card = relationship("Debt")
