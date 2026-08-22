import uuid
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin

class Resume(Base, TimestampMixin):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="UPLOADED")
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    owner = relationship("User", back_populates="resumes")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    chunks = relationship(
        "ResumeChunk",
        back_populates="resume",
        cascade="all, delete-orphan",
    )