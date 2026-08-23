import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.job_description import JobDescription
from app.schemas.job import JobDescriptionCreate, JobDescriptionOut

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])

@router.post("", response_model=JobDescriptionOut, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobDescriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = JobDescription(user_id=current_user.id, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("", response_model=list[JobDescriptionOut])
def list_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(JobDescription).filter(JobDescription.user_id == current_user.id).order_by(JobDescription.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobDescriptionOut)
def get_job(job_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.get(JobDescription, job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job