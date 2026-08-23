import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeOut, ResumeStatusOut
from app.core.config import settings
from app.workers.tasks import parse_and_embed_resume

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])
MAX_SIZE = 10 * 1024 * 1024


def _validate_pdf(filename: str, content: bytes):
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    if content[:4] != b"%PDF":
        raise HTTPException(status_code=400, detail="File is not a valid PDF")


@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    _validate_pdf(file.filename, content)

    user_dir = Path(settings.upload_dir) / str(current_user.id) / "resumes"
    user_dir.mkdir(parents=True, exist_ok=True)
    resume_id = uuid.uuid4()
    dest = user_dir / f"{resume_id}.pdf"
    dest.write_bytes(content)

    resume = Resume(id=resume_id, user_id=current_user.id, file_name=file.filename, file_path=str(dest), status="UPLOADED")
    db.add(resume)
    db.commit()
    db.refresh(resume)
    parse_and_embed_resume.delay(str(resume.id))
    return resume


@router.get("", response_model=list[ResumeOut])
def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}/status", response_model=ResumeStatusOut)
def get_resume_status(resume_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeStatusOut(resume_id=resume.id, status=resume.status, error_message=resume.error_message)


@router.patch("/{resume_id}", response_model=ResumeOut)
async def update_resume(
    resume_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")

    content = await file.read()
    _validate_pdf(file.filename, content)

    Path(resume.file_path).write_bytes(content)

    resume.file_name = file.filename
    resume.status = "UPLOADED"
    resume.error_message = None
    resume.raw_text = None
    db.commit()
    db.refresh(resume)

    parse_and_embed_resume.delay(str(resume.id))
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    Path(resume.file_path).unlink(missing_ok=True)
    db.delete(resume)
    db.commit()