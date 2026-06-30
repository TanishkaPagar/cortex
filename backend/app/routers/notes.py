from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.notes_service import (
    upload_note,
    get_user_notes,
    get_note_by_id,
    delete_note
)
from app.services.auth_service import decode_token

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


def get_current_user_id(token: str) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


@router.post("/upload")
async def upload_note_endpoint(
    token: str,
    title: str = Form(...),
    subject: str = Form(default="General"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    note = await upload_note(
        user_id=user_id,
        title=title,
        subject=subject,
        file_bytes=file_bytes,
        filename=file.filename,
        db=db
    )
    return {
        "id": note.id,
        "title": note.title,
        "subject": note.subject,
        "summary": note.summary,
        "is_processed": note.is_processed,
        "created_at": note.created_at,
        "message": "Note uploaded and summarized successfully!"
    }


@router.get("/")
async def get_notes(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    notes = await get_user_notes(user_id, db)
    return [
        {
            "id": note.id,
            "title": note.title,
            "subject": note.subject,
            "summary": note.summary,
            "is_processed": note.is_processed,
            "created_at": note.created_at
        }
        for note in notes
    ]


@router.get("/{note_id}")
async def get_note(
    note_id: str,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    note = await get_note_by_id(note_id, user_id, db)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {
        "id": note.id,
        "title": note.title,
        "subject": note.subject,
        "raw_text": note.raw_text,
        "summary": note.summary,
        "is_processed": note.is_processed,
        "created_at": note.created_at
    }


@router.delete("/{note_id}")
async def delete_note_endpoint(
    note_id: str,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    success = await delete_note(note_id, user_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}