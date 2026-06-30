# ============================================
# auth_service.py — All authentication logic
# ============================================

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.config import settings
import uuid

# ── Password hashing setup ──────────────────
# bcrypt is a secure hashing algorithm
# It turns "mypassword123" into a long random string
# You CANNOT reverse it back to original password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Hash a plain password ───────────────────
def hash_password(password: str) -> str:
    # bcrypt only supports max 72 bytes
    password = password[:72]
    return pwd_context.hash(password)

# ── Check if password matches hash ─────────
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt only supports max 72 bytes
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

# ── Create ACCESS token (short lived 15 min) 
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": user_id,      # subject = user id
        "exp": expire,       # expiry time
        "type": "access"
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


# ── Create REFRESH token (long lived 7 days) 
def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {
        "sub": user_id,
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


# ── Decode and verify a token ───────────────
def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload.get("sub")  # returns user_id
    except JWTError:
        return None


# ── Register new user ───────────────────────
async def register_user(
    name: str,
    email: str,
    password: str,
    db: AsyncSession
) -> User:
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise ValueError("Email already registered")

    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        password_hash=hash_password(password),
        provider="email",
        xp=0,
        level="Learner",
        streak=0
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


# ── Login user ──────────────────────────────
async def login_user(
    email: str,
    password: str,
    db: AsyncSession
) -> User:
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    # Check user exists
    if not user:
        raise ValueError("Invalid email or password")

    # Check password matches
    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    # Update last active
    user.last_active = datetime.utcnow()
    await db.commit()

    return user


# ── Get user by ID ──────────────────────────
async def get_user_by_id(
    user_id: str,
    db: AsyncSession
) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()