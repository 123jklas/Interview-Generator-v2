import uuid
from app.db import base
from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.resume import Resume
from app.models.resume_chunk import ResumeChunk
from app.services.resume_parser import extract_text, chunk_resume
from app.services.embedding_service import embed_texts

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def parse_and_embed_resume(self, resume_id: str):
    db = SessionLocal()
    try:
        resume = db.get(Resume, uuid.UUID(resume_id))
        if not resume:
            return
        resume.status = "PROCESSING"
        db.commit()

        text = extract_text(resume.file_path)
        chunks = chunk_resume(text)
        if not chunks:
            resume.status = "FAILED"
            resume.error_message = "No extractable text found in PDF"
            db.commit()
            return  # 잘못된 PDF는 재시도하지 않음

        resume.raw_text = text
        embeddings = embed_texts([c["content"] for c in chunks])

        db.query(ResumeChunk).filter(ResumeChunk.resume_id == resume.id).delete()
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
            db.add(ResumeChunk(
                resume_id=resume.id, user_id=resume.user_id, chunk_index=i,
                section=chunk["section"], content=chunk["content"], embedding=vector,
            ))
        resume.status = "READY"
        resume.error_message = None
        db.commit()
    except Exception as exc:
        db.rollback()
        resume = db.get(Resume, uuid.UUID(resume_id))
        if resume:
            resume.status = "FAILED"
            resume.error_message = str(exc)[:500]
            db.commit()
        raise self.retry(exc=exc, countdown=10)  # OpenAI rate limit/네트워크 오류는 재시도
    finally:
        db.close()