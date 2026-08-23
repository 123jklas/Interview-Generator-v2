import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class JobDescriptionCreate(BaseModel):
    company_name: str
    job_title: str
    description: str
    source_url: str | None = None

class JobDescriptionOut(JobDescriptionCreate):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime