from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.note import Note
from app.models.quiz import Quiz, QuizAttempt
from app.models.flashcard import Flashcard
from app.models.assignment import Assignment
from app.services.auth_service import decode_token

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_current_user_id(token: str) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


@router.get("/dashboard")
async def get_dashboard_stats(token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(token)

    # Count notes
    notes_result = await db.execute(
        select(func.count(Note.id)).where(Note.user_id == user_id)
    )
    notes_count = notes_result.scalar() or 0

    # Count quizzes taken
    attempts_result = await db.execute(
        select(func.count(QuizAttempt.id)).where(QuizAttempt.user_id == user_id)
    )
    quizzes_done = attempts_result.scalar() or 0

    # Average quiz score
    avg_score_result = await db.execute(
        select(func.avg(QuizAttempt.score)).where(QuizAttempt.user_id == user_id)
    )
    avg_score = avg_score_result.scalar() or 0
    exam_readiness = round(avg_score * 100) if avg_score else 0

    # Count flashcards
    flashcards_result = await db.execute(
        select(func.count(Flashcard.id)).where(Flashcard.user_id == user_id)
    )
    flashcards_count = flashcards_result.scalar() or 0

    # Pending tasks
    tasks_result = await db.execute(
        select(func.count(Assignment.id))
        .where(Assignment.user_id == user_id)
        .where(Assignment.status == "pending")
    )
    pending_tasks = tasks_result.scalar() or 0

    # Recent quiz attempts for chart
    recent_attempts = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == user_id)
        .order_by(QuizAttempt.attempted_at.desc())
        .limit(10)
    )
    attempts_list = recent_attempts.scalars().all()

    quiz_history = [
        {
            "date": a.attempted_at.strftime("%b %d"),
            "score": round(a.score * 100)
        }
        for a in reversed(attempts_list)
    ]

    return {
        "notes_count": notes_count,
        "quizzes_done": quizzes_done,
        "exam_readiness": exam_readiness,
        "flashcards_count": flashcards_count,
        "pending_tasks": pending_tasks,
        "study_hours_week": 0,
        "quiz_history": quiz_history
    }