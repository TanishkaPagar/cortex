from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.flashcard_service import (
    create_flashcards_from_note,
    get_user_flashcards
)
from app.services.auth_service import decode_token
from pydantic import BaseModel

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


def get_current_user_id(token: str) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


class GenerateFlashcardsRequest(BaseModel):
    note_id: str
    num_cards: int = 10


@router.post("/generate")
async def generate_flashcards_endpoint(
    token: str,
    request: GenerateFlashcardsRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    try:
        cards = await create_flashcards_from_note(
            note_id=request.note_id,
            user_id=user_id,
            num_cards=request.num_cards,
            db=db
        )
        return [
            {"id": c.id, "front": c.front, "back": c.back, "subject": c.subject}
            for c in cards
        ]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def get_flashcards(token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(token)
    cards = await get_user_flashcards(user_id, db)
    return [
        {
            "id": c.id,
            "front": c.front,
            "back": c.back,
            "subject": c.subject,
            "note_id": c.note_id,
            "created_at": c.created_at
        }
        for c in cards
    ]