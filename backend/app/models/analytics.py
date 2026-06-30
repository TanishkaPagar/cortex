import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

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
    topic: Mapped[str] = mapped_column(String(255), nullable=True)
    subject: Mapped[str] = mapped_column(String(100), nullable=True)
    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", ondelete="SET NULL"),
        nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    duration_mins: Mapped[int] = mapped_column(Integer, default=0)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)


class ExamReadiness(Base):
    __tablename__ = "exam_readiness"

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
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    weak_topics: Mapped[str] = mapped_column(Text, nullable=True)
    exam_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )