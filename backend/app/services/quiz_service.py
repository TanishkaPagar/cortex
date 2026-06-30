from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.quiz import Quiz, QuizAttempt
from app.models.note import Note
from app.ai.quiz_generator import generate_quiz
import uuid


async def create_quiz_from_note(
    note_id: str,
    user_id: str,
    num_questions: int,
    difficulty: str,
    db: AsyncSession
) -> Quiz:
    # Get the note
    result = await db.execute(
        select(Note)
        .where(Note.id == note_id)
        .where(Note.user_id == user_id)
    )
    note = result.scalar_one_or_none()

    if not note:
        raise ValueError("Note not found")

    if not note.raw_text:
        raise ValueError("Note has no text content")

    # Generate questions using AI
    questions = await generate_quiz(
        text=note.raw_text,
        num_questions=num_questions,
        difficulty=difficulty
    )

    if not questions:
        raise ValueError("Could not generate quiz questions")

    # Save quiz to database
    quiz = Quiz(
        id=str(uuid.uuid4()),
        user_id=user_id,
        note_id=note_id,
        title=f"Quiz: {note.title}",
        subject=note.subject,
        difficulty=difficulty,
        questions=questions,
        question_count=len(questions)
    )

    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return quiz


async def get_user_quizzes(
    user_id: str,
    db: AsyncSession
) -> list:
    result = await db.execute(
        select(Quiz)
        .where(Quiz.user_id == user_id)
        .order_by(Quiz.created_at.desc())
    )
    return result.scalars().all()


async def get_quiz_by_id(
    quiz_id: str,
    user_id: str,
    db: AsyncSession
) -> Quiz:
    result = await db.execute(
        select(Quiz)
        .where(Quiz.id == quiz_id)
        .where(Quiz.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def save_quiz_attempt(
    quiz_id: str,
    user_id: str,
    score: float,
    correct_answers: int,
    total_questions: int,
    time_taken: int,
    db: AsyncSession
) -> QuizAttempt:
    attempt = QuizAttempt(
        id=str(uuid.uuid4()),
        quiz_id=quiz_id,
        user_id=user_id,
        score=score,
        correct_answers=correct_answers,
        total_questions=total_questions,
        time_taken=time_taken
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt