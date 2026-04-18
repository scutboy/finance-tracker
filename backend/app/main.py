from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.db.database import engine, Base
from app.db import models
from sqlalchemy import text

# Ensure all tables exist in the current persistence layer node
Base.metadata.create_all(bind=engine)



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
