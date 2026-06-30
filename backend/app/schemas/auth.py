# ============================================
# auth.py — Request and Response data shapes
# ============================================
# Pydantic schemas validate incoming data
# If wrong data is sent, it auto-rejects it

from pydantic import BaseModel, EmailStr
from typing import Optional


# ── What we need to REGISTER a new user ────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr        # automatically validates email format
    password: str


# ── What we need to LOGIN ───────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── What we RETURN after login/register ────
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ── User info we return to frontend ────────
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    xp: int
    level: str
    streak: int
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


# ── What we need to REFRESH token ──────────
class RefreshRequest(BaseModel):
    refresh_token: str