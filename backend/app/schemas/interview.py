import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class InterviewCreateRequest(BaseModel):
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    interview_type: str = "mixed"
    difficulty: str = "medium"

class InterviewSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    interview_type: str
    difficulty: str
    status: str
    created_at: datetime

class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    sequence_number: int
    question_type: str
    difficulty: str
    question: str
    target_skills: list[str]
    reason: str | None

class AnswerSubmitRequest(BaseModel):
    question_id: uuid.UUID
    answer_text: str

class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    question_id: uuid.UUID
    overall_score: int
    scores: dict[str, int]
    strengths: list[str]
    weaknesses: list[str]
    follow_up_question: str | None