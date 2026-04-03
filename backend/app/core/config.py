import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Finance Tracker"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance_tracker.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-secret-key-for-dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Read as comma-separated string from env, fall back to local defaults
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    class Config:
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Allow ALLOWED_ORIGINS to be set as a comma-separated env var
        raw = os.getenv("ALLOWED_ORIGINS")
        if raw:
            self.ALLOWED_ORIGINS = [o.strip() for o in raw.split(",") if o.strip()]

settings = Settings()
