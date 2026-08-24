import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db, SessionLocal
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.interview_session import InterviewSession
from app.models.interview_question import InterviewQuestion
from app.models.interview_answer import InterviewAnswer
from app.schemas.interview import (
    InterviewCreateRequest, InterviewSessionOut, QuestionOut, AnswerSubmitRequest, AnswerOut,
)
from app.services.interview_service import build_context, generate_question_stream, classify_question
from app.services.feedback_service import evaluate_answer

router = APIRouter(prefix="/api/v1/interviews", tags=["interviews"])

def _session_to_out(db: Session, session: InterviewSession) -> InterviewSessionOut:
    job = db.get(JobDescription, session.job_description_id)
    return InterviewSessionOut(
        id=session.id, resume_id=session.resume_id, job_description_id=session.job_description_id,
        interview_type=session.interview_type, difficulty=session.difficulty, status=session.status,
        created_at=session.created_at,
        company_name=job.company_name if job else "Unknown",
        job_title=job.job_title if job else "Unknown",
    )

def _session_to_out(db: Session, session: InterviewSession) -> InterviewSessionOut:
    job = db.get(JobDescription, session.job_description_id)
    return InterviewSessionOut(
        id=session.id, resume_id=session.resume_id, job_description_id=session.job_description_id,
        interview_type=session.interview_type, difficulty=session.difficulty, status=session.status,
        created_at=session.created_at,
        company_name=job.company_name if job else "Unknown",
        job_title=job.job_title if job else "Unknown",
    )


@router.post("", response_model=InterviewSessionOut, status_code=status.HTTP_201_CREATED)
def create_interview(payload: InterviewCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.get(Resume, payload.resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.status != "READY":
        raise HTTPException(status_code=400, detail=f"Resume is not ready yet (status={resume.status})")

    job = db.get(JobDescription, payload.job_description_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job description not found")

    session = InterviewSession(
        user_id=current_user.id, resume_id=resume.id, job_description_id=job.id,
        interview_type=payload.interview_type, difficulty=payload.difficulty,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _session_to_out(db, session)


@router.get("", response_model=list[InterviewSessionOut])
def list_interviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc()).all()
    return [_session_to_out(db, s) for s in sessions]

@router.get("/{interview_id}", response_model=InterviewSessionOut)
def get_interview(interview_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.get(InterviewSession, interview_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return _session_to_out(db, session)

@router.get("/{interview_id}/questions", response_model=list[QuestionOut])
def list_questions(interview_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.get(InterviewSession, interview_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session.id)
        .order_by(InterviewQuestion.sequence_number)
        .all()
    )


@router.get("/{interview_id}/questions/stream")
def stream_next_question(interview_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.get(InterviewSession, interview_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session_id, resume_id, job_description_id, user_id = session.id, session.resume_id, session.job_description_id, current_user.id
    interview_type, difficulty = session.interview_type, session.difficulty

    def event_generator():
        worker_db = SessionLocal()
        try:
            context = build_context(worker_db, session_id, resume_id, job_description_id, user_id)
            collected = ""
            for token in generate_question_stream(context, interview_type, difficulty):
                collected += token
                yield f"data: {json.dumps({'token': token})}\n\n"

            metadata = classify_question(collected, context)
            seq = worker_db.query(func.count(InterviewQuestion.id)).filter(InterviewQuestion.session_id == session_id).scalar() or 0

            question = InterviewQuestion(
                session_id=session_id, sequence_number=seq + 1,
                question_type=metadata.type.value, difficulty=metadata.difficulty.value,
                question=collected.strip(), target_skills=metadata.target_skills, reason=metadata.reason,
            )
            worker_db.add(question)
            worker_db.commit()
            worker_db.refresh(question)

            yield "event: done\n" + f"data: {json.dumps({'question_id': str(question.id), 'type': metadata.type.value, 'difficulty': metadata.difficulty.value, 'target_skills': metadata.target_skills, 'reason': metadata.reason})}\n\n"
        finally:
            worker_db.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/{interview_id}/answers", response_model=AnswerOut, status_code=status.HTTP_201_CREATED)
def submit_answer(interview_id: uuid.UUID, payload: AnswerSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.get(InterviewSession, interview_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview session not found")

    question = db.get(InterviewQuestion, payload.question_id)
    if not question or question.session_id != session.id:
        raise HTTPException(status_code=404, detail="Question not found in this session")

    if db.query(InterviewAnswer).filter(InterviewAnswer.question_id == question.id).first():
        raise HTTPException(status_code=409, detail="This question already has an answer")

    context = build_context(db, session.id, session.resume_id, session.job_description_id, current_user.id)
    feedback = evaluate_answer(question.question, payload.answer_text, context)

    answer = InterviewAnswer(
        question_id=question.id, answer_text=payload.answer_text,
        overall_score=feedback.overall_score, scores=feedback.scores,
        strengths=feedback.strengths, weaknesses=feedback.weaknesses,
        follow_up_question=feedback.follow_up_question,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


@router.get("/{interview_id}/feedback")
def get_session_feedback(interview_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.get(InterviewSession, interview_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview session not found")

    answers = (
        db.query(InterviewAnswer)
        .join(InterviewQuestion, InterviewAnswer.question_id == InterviewQuestion.id)
        .filter(InterviewQuestion.session_id == session.id)
        .all()
    )
    if not answers:
        return {"session_id": str(session.id), "answered_count": 0, "average_score": None, "weaknesses": []}

    avg = sum(a.overall_score for a in answers) / len(answers)
    weaknesses = [w for a in answers for w in (a.weaknesses or [])]
    return {"session_id": str(session.id), "answered_count": len(answers), "average_score": round(avg, 1), "weaknesses": weaknesses}