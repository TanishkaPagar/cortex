from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.flashcard import Flashcard
from app.models.note import Note
from app.ai.flashcard_gen import generate_flashcards
import uuid


async def create_flashcards_from_note(
    note_id: str,
    user_id: str,
    num_cards: int,
    db: AsyncSession
) -> list:
    result = await db.execute(
        select(Note).where(Note.id == note_id).where(Note.user_id == user_id)
    )
    note = result.scalar_one_or_none()

    if not note or not note.raw_text:
        raise ValueError("Note not found or has no content")

    cards_data = await generate_flashcards(note.raw_text, num_cards)
    if not cards_data:
        raise ValueError("Could not generate flashcards")

    flashcards = []
    for card in cards_data:
        fc = Flashcard(
            id=str(uuid.uuid4()),
            user_id=user_id,
            note_id=note_id,
            front=card.get("front", ""),
            back=card.get("back", ""),
            subject=note.subject
        )
        db.add(fc)
        flashcards.append(fc)

    await db.commit()
    for fc in flashcards:
        await db.refresh(fc)

    return flashcards


async def get_user_flashcards(user_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.user_id == user_id)
        .order_by(Flashcard.created_at.desc())
    )
    return result.scalars().all()


async def get_flashcards_by_note(note_id: str, user_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.note_id == note_id)
        .where(Flashcard.user_id == user_id)
    )
    return result.scalars().all()