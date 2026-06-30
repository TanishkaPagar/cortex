from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

ENV_FILE = Path(__file__).parent.parent.parent / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    APP_NAME: str = "AI Study Companion"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"


settings = Settings()