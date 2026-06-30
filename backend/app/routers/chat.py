from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.ai.chat_tutor import chat_with_tutor
from app.models.note import Note
from app.services.auth_service import decode_token
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/chat",
    tags=["Chat Tutor"]
)


def get_current_user_id(token: str) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


class ChatRequest(BaseModel):
    question: str
    note_id: Optional[str] = None
    chat_history: list = []


@router.post("/ask")
async def ask_tutor(
    token: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)

    # Get context from note if provided
    context = ""
    if request.note_id:
        result = await db.execute(
            select(Note)
            .where(Note.id == request.note_id)
            .where(Note.user_id == user_id)
        )
        note = result.scalar_one_or_none()
        if note and note.raw_text:
            # Use first 2000 words as context
            words = note.raw_text.split()[:2000]
            context = ' '.join(words)

    # Get AI response
    answer = await chat_with_tutor(
        question=request.question,
        context=context,
        chat_history=request.chat_history
    )

    return {
        "question": request.question,
        "answer": answer
    }