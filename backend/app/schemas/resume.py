import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    file_name: str
    status: str
    created_at: datetime

class ResumeStatusOut(BaseModel):
    resume_id: uuid.UUID
    status: str
    error_message: str | None = None