from enum import Enum
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.llm_client import client
from app.services.retrieval_service import search_resume_chunks
from app.models.job_description import JobDescription
from app.models.interview_question import InterviewQuestion

class QuestionType(str, Enum):
    behavioral = "behavioral"
    resume_deep_dive = "resume_deep_dive"
    technical = "technical"
    system_design = "system_design"
    company_specific = "company_specific"

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class QuestionMetadata(BaseModel):
    type: QuestionType
    difficulty: Difficulty
    target_skills: list[str]
    reason: str

def build_context(db: Session, session_id, resume_id, job_description_id, user_id) -> str:
    job = db.get(JobDescription, job_description_id)
    query = f"{job.job_title} {job.description[:500]}"
    chunks = search_resume_chunks(db, user_id, resume_id, query, top_k=6)
    resume_context = "\n---\n".join(c.content for c in chunks) or "(no resume content found)"

    prev_questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session_id)
        .order_by(InterviewQuestion.sequence_number)
        .all()
    )
    history = "\n".join(f"Q{q.sequence_number}: {q.question}" for q in prev_questions) or "(none yet)"

    return (
        f"[Company/Role]\n{job.company_name} - {job.job_title}\n\n"
        f"[Job Description]\n{job.description}\n\n"
        f"[Relevant Resume Excerpts]\n{resume_context}\n\n"
        f"[Previously Asked Questions]\n{history}"
    )

def generate_question_stream(context: str, interview_type: str, difficulty: str):
    system_prompt = (
        f"You are conducting a {difficulty}-difficulty {interview_type} interview. "
        "Using the job description and resume excerpts, ask exactly ONE interview question. "
        "Output ONLY the question text, no preamble, no numbering, no explanation. "
        "Do not repeat a question already listed in 'Previously Asked Questions'."
    )
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.7,
        stream=True,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": context},
        ],
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta

def classify_question(question_text: str, context: str) -> QuestionMetadata:
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        temperature=0,
        messages=[
            {"role": "system", "content": "Classify the interview question below given the context. Only output the structured fields."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{question_text}"},
        ],
        response_format=QuestionMetadata,
    )
    return completion.choices[0].message.parsed