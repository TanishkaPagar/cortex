from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.quiz_service import (
    create_quiz_from_note,
    get_user_quizzes,
    get_quiz_by_id,
    save_quiz_attempt
)
from app.services.auth_service import decode_token
from pydantic import BaseModel

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)


def get_current_user_id(token: str) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


class GenerateQuizRequest(BaseModel):
    note_id: str
    num_questions: int = 10
    difficulty: str = "medium"


class SubmitAttemptRequest(BaseModel):
    score: float
    correct_answers: int
    total_questions: int
    time_taken: int


# Generate quiz from note
@router.post("/generate")
async def generate_quiz_endpoint(
    token: str,
    request: GenerateQuizRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    try:
        quiz = await create_quiz_from_note(
            note_id=request.note_id,
            user_id=user_id,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            db=db
        )
        return {
            "id": quiz.id,
            "title": quiz.title,
            "subject": quiz.subject,
            "difficulty": quiz.difficulty,
            "questions": quiz.questions,
            "question_count": quiz.question_count
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Get all quizzes
@router.get("/")
async def get_quizzes(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    quizzes = await get_user_quizzes(user_id, db)
    return [
        {
            "id": q.id,
            "title": q.title,
            "subject": q.subject,
            "difficulty": q.difficulty,
            "question_count": q.question_count,
            "created_at": q.created_at
        }
        for q in quizzes
    ]


# Get specific quiz
@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: str,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    quiz = await get_quiz_by_id(quiz_id, user_id, db)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {
        "id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "difficulty": quiz.difficulty,
        "questions": quiz.questions,
        "question_count": quiz.question_count,
        "created_at": quiz.created_at
    }


# Submit quiz attempt
@router.post("/{quiz_id}/attempt")
async def submit_attempt(
    quiz_id: str,
    token: str,
    request: SubmitAttemptRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    attempt = await save_quiz_attempt(
        quiz_id=quiz_id,
        user_id=user_id,
        score=request.score,
        correct_answers=request.correct_answers,
        total_questions=request.total_questions,
        time_taken=request.time_taken,
        db=db
    )
    return {
        "id": attempt.id,
        "score": attempt.score,
        "correct_answers": attempt.correct_answers,
        "total_questions": attempt.total_questions,
        "message": f"You scored {attempt.score:.0%}! 🎉"
    }