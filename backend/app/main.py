from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.db.database import engine, Base
from app.db import models

# Ensure all tables exist in the current persistence layer node
Base.metadata.create_all(bind=engine)

# Auto-Repair: Direct Schema Migrations for SQLite without Alembic
from sqlalchemy import text
with engine.connect() as conn:
    try: conn.execute(text("ALTER TABLE expenses ADD COLUMN linked_card_id INTEGER REFERENCES debts(id)"))
    except Exception: pass
    try: conn.execute(text("ALTER TABLE subscriptions ADD COLUMN currency TEXT DEFAULT 'LKR'"))
    except Exception: pass
    try: conn.execute(text("ALTER TABLE debts ADD COLUMN credit_limit FLOAT"))
    except Exception: pass
    try: conn.execute(text("ALTER TABLE savings_goals ADD COLUMN category TEXT DEFAULT 'Emergency Fund'"))
    except Exception: pass
    try: conn.execute(text("ALTER TABLE savings_goals ADD COLUMN target_date DATE"))
    except Exception: pass
    try: conn.execute(text("ALTER TABLE savings_goals ADD COLUMN monthly_contribution FLOAT DEFAULT 0.0"))
    except Exception: pass
    conn.commit()

print("--- VANTAGE COMMAND SYSTEM INITIALIZED ---")
app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Vantage Strategy Finance API"}

@app.get("/api/health")
def health_check():
    return {"status": "operational", "version": "v4.3.8", "signature": "Charith's Finance Tracker"}
