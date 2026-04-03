import sys
import os
import random
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

# Add app folder to sys path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__))))

from app.db.database import SessionLocal, engine
from app.db import models
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # 1. User
    user = db.query(models.User).filter_by(email="test@test.com").first()
    if not user:
        user = models.User(
            email="test@test.com",
            name="Test User",
            password_hash=get_password_hash("test1234")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Clean existing data to avoid duplicates on re-run
    db.query(models.Expense).delete()
    db.query(models.Debt).delete()
    db.query(models.SavingsGoal).delete()
    db.query(models.BudgetCategory).delete()
    db.commit()

    # 2. Debts
    debts = [
        models.Debt(user_id=user.id, name="BOC Credit Card", type=models.DebtTypeEnum.credit_card, balance=180000, credit_limit=500000, interest_rate=24, min_payment=5000, due_date=15),
        models.Debt(user_id=user.id, name="NDB Card", type=models.DebtTypeEnum.credit_card, balance=95000, credit_limit=200000, interest_rate=22, min_payment=3000, due_date=20),
        models.Debt(user_id=user.id, name="Sampath Card", type=models.DebtTypeEnum.credit_card, balance=120000, credit_limit=300000, interest_rate=21, min_payment=4000, due_date=5),
        models.Debt(user_id=user.id, name="Amex", type=models.DebtTypeEnum.credit_card, balance=85000, credit_limit=250000, interest_rate=20, min_payment=3000, due_date=10)
    ]
    db.add_all(debts)

    # 3. Savings Goals
    now = datetime.utcnow().date()
    goals = [
        models.SavingsGoal(user_id=user.id, name="Emergency Fund", category=models.GoalCategoryEnum.emergency, target_amount=1800000, current_amount=420000, monthly_contribution=25000, target_date=now + relativedelta(months=12)),
        models.SavingsGoal(user_id=user.id, name="Son's Education Fund", category=models.GoalCategoryEnum.education, target_amount=5000000, current_amount=340000, monthly_contribution=50000, target_date=now + relativedelta(years=5)),
        models.SavingsGoal(user_id=user.id, name="Retirement", category=models.GoalCategoryEnum.retirement, target_amount=15000000, current_amount=800000, monthly_contribution=75000, target_date=now + relativedelta(years=20)),
        models.SavingsGoal(user_id=user.id, name="Property Down Payment", category=models.GoalCategoryEnum.property, target_amount=4000000, current_amount=150000, monthly_contribution=40000, target_date=now + relativedelta(years=3))
    ]
    db.add_all(goals)

    # 4. Budget Categories (8)
    categories = [
        models.BudgetCategory(user_id=user.id, name="Emergency Fund", type=models.BudgetCategoryTypeEnum.savings, monthly_budget=25000),
        models.BudgetCategory(user_id=user.id, name="Education Fund", type=models.BudgetCategoryTypeEnum.savings, monthly_budget=50000),
        models.BudgetCategory(user_id=user.id, name="Retirement", type=models.BudgetCategoryTypeEnum.savings, monthly_budget=75000),
        models.BudgetCategory(user_id=user.id, name="Property", type=models.BudgetCategoryTypeEnum.savings, monthly_budget=40000),
        models.BudgetCategory(user_id=user.id, name="Groceries", type=models.BudgetCategoryTypeEnum.essential, monthly_budget=80000),
        models.BudgetCategory(user_id=user.id, name="Utilities", type=models.BudgetCategoryTypeEnum.essential, monthly_budget=30000),
        models.BudgetCategory(user_id=user.id, name="Transport", type=models.BudgetCategoryTypeEnum.essential, monthly_budget=20000),
        models.BudgetCategory(user_id=user.id, name="Dining & Entertainment", type=models.BudgetCategoryTypeEnum.discretionary, monthly_budget=40000)
    ]
    db.add_all(categories)

    # 5. 20 Realistic Expenses over last 3 months
    expense_desc = [
        ("Keells Super", "Groceries", 15000), ("Cargills Food City", "Groceries", 12000), ("CEB Bill", "Utilities", 8500), 
        ("Water Board", "Utilities", 2500), ("SLT Fiber", "Utilities", 5000), ("Uber/PickMe", "Transport", 3500), 
        ("Fuel (IOC)", "Transport", 10000), ("Dutch Burgher Union", "Dining & Entertainment", 14000),
        ("Majestic Cinema", "Dining & Entertainment", 4000), ("Cafe Kumbuk", "Dining & Entertainment", 6500)
    ]

    for i in range(20):
        desc, cat, base_amount = random.choice(expense_desc)
        days_ago = random.randint(0, 90)
        expense_date = now - timedelta(days=days_ago)
        # Randomize amount slightly
        amount = base_amount + random.randint(-500, 1500)
        
        expense = models.Expense(
            user_id=user.id,
            date=expense_date,
            description=desc,
            amount=amount,
            category=cat,
            account=random.choice(["BOC Credit Card", "Cash", "Sampath Card"])
        )
        db.add(expense)

    db.commit()
    print("Database seeded successfully with dummy data.")
    db.close()

if __name__ == "__main__":
    seed_db()
