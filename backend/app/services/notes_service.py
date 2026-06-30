from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.note import Note
from app.ai.pdf_processor import extract_text_from_pdf
from app.ai.summarizer import summarize_text
import uuid
import os
import aiofiles


async def upload_note(
    user_id: str,
    title: str,
    subject: str,
    file_bytes: bytes,
    filename: str,
    db: AsyncSession
) -> Note:
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{uuid.uuid4()}_{filename}"

    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(file_bytes)

    raw_text = extract_text_from_pdf(file_bytes)
    summary = await summarize_text(raw_text)

    note = Note(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        subject=subject,
        file_url=file_path,
        file_type="pdf",
        raw_text=raw_text[:10000],
        summary=summary,
        is_processed=True
    )

    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


async def get_user_notes(
    user_id: str,
    db: AsyncSession
) -> list[Note]:
    result = await db.execute(
        select(Note)
        .where(Note.user_id == user_id)
        .order_by(Note.created_at.desc())
    )
    return result.scalars().all()


async def get_note_by_id(
    note_id: str,
    user_id: str,
    db: AsyncSession
) -> Note:
    result = await db.execute(
        select(Note)
        .where(Note.id == note_id)
        .where(Note.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def delete_note(
    note_id: str,
    user_id: str,
    db: AsyncSession
) -> bool:
    note = await get_note_by_id(note_id, user_id, db)
    if not note:
        return False
    await db.delete(note)
    await db.commit()
    return True