import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.resume_chunk import ResumeChunk
from app.services.embedding_service import embed_text

def search_resume_chunks(db: Session, user_id: uuid.UUID, resume_id: uuid.UUID, query: str, top_k: int = 6) -> list[ResumeChunk]:
    query_vector = embed_text(query)
    stmt = (
        select(ResumeChunk)
        .where(ResumeChunk.user_id == user_id, ResumeChunk.resume_id == resume_id)
        .order_by(ResumeChunk.embedding.cosine_distance(query_vector))
        .limit(top_k)
    )
    return db.execute(stmt).scalars().all()