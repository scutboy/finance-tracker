import os
from pydantic_settings import BaseSettings
from typing import List, Any

class Settings(BaseSettings):
    PROJECT_NAME: str = "Finance Tracker"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance_tracker.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-secret-key-for-dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Vercel deployment URL and localhost
    ALLOWED_ORIGINS: Any = ["https://finance-tracker-gamma-black.vercel.app", "http://localhost:5173", "http://localhost:3000"]

    class Config:
        case_sensitive = True

    def __init__(self, **kwargs):
        # We handle ALLOWED_ORIGINS manually to avoid Pydantic parsing errors from env
        env_val = os.getenv("ALLOWED_ORIGINS")
        if env_val:
            # If it looks like a JSON list, try to parse it
            if env_val.startswith("["):
                import json
                try:
                    kwargs["ALLOWED_ORIGINS"] = json.loads(env_val)
                except:
                    kwargs["ALLOWED_ORIGINS"] = [o.strip() for o in env_val.split(",") if o.strip()]
            else:
                kwargs["ALLOWED_ORIGINS"] = [o.strip() for o in env_val.split(",") if o.strip()]
        
        super().__init__(**kwargs)

settings = Settings()
