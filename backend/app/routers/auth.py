# ============================================
# routers/auth.py — Authentication endpoints
# ============================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    RefreshRequest
)
from app.services.auth_service import (
    register_user,
    login_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_by_id
)

# Create router
router = APIRouter(
    prefix="/auth",       # all routes start with /auth
    tags=["Authentication"]
)


# ── REGISTER endpoint ───────────────────────
# POST http://localhost:8000/auth/register
@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Create the user
        user = await register_user(
            name=request.name,
            email=request.email,
            password=request.password,
            db=db
        )

        # Create tokens
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                xp=user.xp,
                level=user.level,
                streak=user.streak,
                avatar_url=user.avatar_url
            )
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ── LOGIN endpoint ──────────────────────────
# POST http://localhost:8000/auth/login
@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Verify credentials
        user = await login_user(
            email=request.email,
            password=request.password,
            db=db
        )

        # Create tokens
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                xp=user.xp,
                level=user.level,
                streak=user.streak,
                avatar_url=user.avatar_url
            )
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


# ── GET CURRENT USER endpoint ───────────────
# GET http://localhost:8000/auth/me
@router.get("/me", response_model=UserResponse)
async def get_me(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    # Decode token to get user_id
    user_id = decode_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Get user from database
    user = await get_user_by_id(user_id, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        xp=user.xp,
        level=user.level,
        streak=user.streak,
        avatar_url=user.avatar_url
    )


# ── REFRESH TOKEN endpoint ──────────────────
# POST http://localhost:8000/auth/refresh
@router.post("/refresh")
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    # Decode refresh token
    user_id = decode_token(request.refresh_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # Create new access token
    new_access_token = create_access_token(user_id)

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }