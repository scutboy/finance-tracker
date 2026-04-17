from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.db.database import engine, Base
from app.db import models
from sqlalchemy import text

# Ensure all tables exist in the current persistence layer node
Base.metadata.create_all(bind=engine)

# Auto-Repair Transactional Block: Direct Schema Migrations for SQLite
def run_migration(sql_stmt):
    with engine.connect() as conn:
        try:
            conn.execute(text(sql_stmt))
            conn.commit()
        except Exception:
            # We catch exceptions to prevent startup crashes if column exists
            pass

# Execute tactical repairs on startup
run_migration("ALTER TABLE expenses ADD COLUMN linked_card_id INTEGER REFERENCES debts(id)")
run_migration("ALTER TABLE subscriptions ADD COLUMN currency TEXT DEFAULT 'LKR'")
run_migration("ALTER TABLE debts ADD COLUMN credit_limit FLOAT")
run_migration("ALTER TABLE savings_goals ADD COLUMN category TEXT DEFAULT 'Emergency Fund'")
run_migration("ALTER TABLE savings_goals ADD COLUMN target_date DATE")
run_migration("ALTER TABLE savings_goals ADD COLUMN monthly_contribution FLOAT DEFAULT 0.0")

# --- Automated Ledger Sync on Application Boot ---
import os
import subprocess
try:
    if not os.path.exists(".import_done"):
        print("Running automated expense & subscription ingestion for production...")
        subprocess.run(["python", "import_expenses.py"], cwd=".")
        # Re-date the dummy data so it does not block dashboard recent transactions
        with engine.connect() as conn:
            conn.execute(text("UPDATE income SET date = date('now', '-5 days') WHERE date > date('now')"))
            conn.commit()
        with open(".import_done", "w") as f:
            f.write("done")
except Exception as e:
    print(f"Ingestion Sync failed: {e}")

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
    return {"status": "operational", "version": "v4.3.11", "signature": "Charith's Vantage Command"}
