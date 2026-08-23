import uuid
from sqlalchemy import ForeignKey, Text, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base, TimestampMixin

class InterviewAnswer(Base, TimestampMixin):
    __tablename__ = "interview_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    scores: Mapped[dict] = mapped_column(JSON, default=dict)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    weaknesses: Mapped[list] = mapped_column(JSON, default=list)
    follow_up_question: Mapped[str | None] = mapped_column(Text, nullable=True)