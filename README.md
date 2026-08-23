# Ready2Interview

Ready2Interview is an AI-powered interview preparation platform that generates personalized interview questions and feedback based on a user's resume and target job description.

The platform uses Retrieval-Augmented Generation (RAG) to retrieve relevant resume experience and combine it with job requirements, allowing the AI interviewer to generate context-aware questions and evaluate candidate responses.

## Features

- JWT-based user authentication
- Resume PDF upload and text extraction
- Asynchronous resume processing with Celery
- Resume chunking and vector embeddings
- Semantic search using PostgreSQL + pgvector
- Job description management
- Personalized AI interview sessions
- Real-time streaming interview questions
- Structured question classification
- AI-powered answer evaluation
- Rubric-based scoring and feedback
- User-isolated resume and interview data

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic

### Database
- PostgreSQL
- pgvector

### AI / RAG
- OpenAI API
- OpenAI Embeddings
- Retrieval-Augmented Generation (RAG)
- Vector similarity search

### Background Processing
- Celery
- RabbitMQ
- Redis

### Infrastructure
- Docker
- Docker Compose

## Architecture

The application follows a service-oriented backend architecture:

```text
Client
  │
  ▼
FastAPI
  │
  ├── Authentication
  ├── Resume API
  ├── Job Description API
  └── Interview API
          │
          ▼
      Service Layer
          │
          ├── Resume Parser
          ├── Embedding Service
          ├── Retrieval Service
          ├── Interview Service
          └── Feedback Service
          │
          ▼
      OpenAI API

Resume Upload
  │
  ▼
RabbitMQ
  │
  ▼
Celery Worker
  │
  ├── PDF Text Extraction
  ├── Resume Chunking
  └── OpenAI Embeddings
          │
          ▼
PostgreSQL + pgvector
```

## RAG Pipeline

When a resume is uploaded:

1. The resume PDF is stored by the backend.
2. A background processing task is sent to RabbitMQ.
3. A Celery worker extracts text from the PDF.
4. The extracted text is divided into smaller chunks.
5. Each chunk is converted into an embedding using the OpenAI Embeddings API.
6. Embeddings are stored in PostgreSQL using pgvector.
7. Relevant resume chunks are retrieved using cosine similarity when generating interview questions.

This allows interview questions to be grounded in both the candidate's resume and the target job description.

## AI Interview Flow

```text
Resume + Job Description
          │
          ▼
   RAG Retrieval
          │
          ▼
Relevant Resume Context
          │
          ▼
   OpenAI Interviewer
          │
          ▼
Streaming Interview Question
          │
          ▼
     User Answer
          │
          ▼
   AI Evaluation
          │
          ▼
Score + Strengths + Weaknesses
+ Follow-up Question
```

Interview questions are streamed to the client in real time using Server-Sent Events (SSE).

After each response, the system evaluates the answer using a structured rubric including:

- Technical accuracy
- Clarity
- Specificity
- Impact

## Project Structure

```text
backend/
└── app/
    ├── api/
    │   └── v1/
    │       ├── auth.py
    │       ├── resumes.py
    │       ├── jobs.py
    │       └── interviews.py
    │
    ├── core/
    │   └── config.py
    │
    ├── db/
    │   ├── base.py
    │   └── session.py
    │
    ├── models/
    │   ├── user.py
    │   ├── resume.py
    │   ├── resume_chunk.py
    │   ├── job_description.py
    │   ├── interview_session.py
    │   ├── interview_question.py
    │   └── interview_answer.py
    │
    ├── schemas/
    │   ├── resume.py
    │   └── interview.py
    │
    ├── services/
    │   ├── resume_parser.py
    │   ├── embedding_service.py
    │   ├── retrieval_service.py
    │   ├── llm_client.py
    │   ├── interview_service.py
    │   └── feedback_service.py
    │
    ├── workers/
    │   ├── celery_app.py
    │   └── tasks.py
    │
    └── main.py
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/123jklas/Interview-Generator-v2.git
cd Interview-Generator-v2
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file based on `.env.example`.

```env
OPENAI_API_KEY=your-openai-api-key
CELERY_BROKER_URL=amqp://guest:guest@localhost:5672//
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

Additional database and authentication environment variables should also be configured according to `.env.example`.

### 5. Start infrastructure

```bash
docker compose up -d
```

This starts:

- PostgreSQL with pgvector
- RabbitMQ
- Redis

### 6. Run database migrations

```bash
cd backend
alembic upgrade head
```

### 7. Start the API server

```bash
uvicorn app.main:app --reload
```

### 8. Start the Celery worker

In another terminal:

```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info --pool=solo
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

## Development Status

Ready2Interview v2 is currently under active development.

Completed backend components include:

- Authentication and database infrastructure
- Resume ingestion pipeline
- Asynchronous document processing
- Vector embeddings and semantic retrieval
- RAG infrastructure
- AI interview session management
- Streaming question generation
- Structured answer evaluation and feedback

Future development will focus on expanding the interview experience, frontend integration, production deployment, and improving retrieval and evaluation quality.

## Author

**Taegang Kim**  
Creator and primary developer of Ready2Interview.

Copyright © 2026 Taegang Kim. All rights reserved.