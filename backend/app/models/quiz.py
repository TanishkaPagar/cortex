import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(100), nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium")
    questions: Mapped[dict] = mapped_column(JSON, nullable=False)
    question_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    quiz_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_answers: Mapped[int] = mapped_column(Integer, nullable=False)
    time_taken: Mapped[int] = mapped_column(Integer, nullable=True)
    wrong_topics: Mapped[str] = mapped_column(Text, nullable=True)
    attempted_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )