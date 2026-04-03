from fastapi import APIRouter

api_router = APIRouter()

from app.api.endpoints import auth, expenses, debts, goals, budget, dashboard, income

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(debts.router, prefix="/debts", tags=["Debts"])
api_router.include_router(goals.router, prefix="/goals", tags=["Goals"])
api_router.include_router(budget.router, prefix="/budget", tags=["Budget"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(income.router, prefix="/income", tags=["Income"])
