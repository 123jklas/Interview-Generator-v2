# Ready2Interview

Ready2Interview is an AI-powered mock interview platform that generates personalized interview questions based on a user's resume and target job description.

The platform uses Retrieval-Augmented Generation (RAG) to retrieve relevant experience from the candidate's resume, generate contextual interview questions, and provide structured feedback on each answer.

## Features

- User registration and authentication
- PDF resume upload and processing
- Resume text extraction and chunking
- Vector embeddings with semantic search
- Job description management
- RAG-based resume context retrieval
- Personalized AI interview question generation
- Real-time question streaming
- Multiple interview types and difficulty levels
- AI-powered answer evaluation
- Structured scores, strengths, weaknesses, and follow-up questions
- Interview session history
- User-level data isolation

---

## How It Works

1. **Upload Resume**
   - The user uploads a PDF resume.
   - Resume processing runs asynchronously in the background.

2. **Resume Processing**
   - Text is extracted from the PDF.
   - The resume is divided into smaller chunks.
   - Each chunk is converted into a vector embedding and stored in PostgreSQL with pgvector.

3. **Add Job Description**
   - The user provides a company, role, and job description.

4. **Start Interview**
   - The user selects a processed resume, job description, interview type, and difficulty.

5. **Retrieve Relevant Context**
   - The job description is used to search the resume vector database.
   - The most relevant resume sections are retrieved using vector similarity search.

6. **Generate Interview Question**
   - Relevant resume context, the job description, and previous questions are provided to the LLM.
   - The next interview question is streamed to the frontend in real time.

7. **Submit Answer**
   - The user submits an answer to the generated question.

8. **Receive AI Feedback**
   - The answer is evaluated using a structured rubric.
   - The platform returns an overall score, category scores, strengths, weaknesses, and a follow-up question.

---

## Architecture

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Next.js Frontend  │
                         │  React + TypeScript │
                         └──────────┬──────────┘
                                    │
                              REST API / SSE
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         └──────────┬──────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
               ▼                    ▼                    ▼
       ┌──────────────┐    ┌────────────────┐   ┌────────────────┐
       │ PostgreSQL   │    │   RabbitMQ     │   │   OpenAI API   │
       │ + pgvector   │    │   Task Queue   │   │ LLM/Embeddings │
       └──────────────┘    └───────┬────────┘   └────────────────┘
                                   │
                                   ▼
                           ┌──────────────┐
                           │Celery Worker │
                           │Resume Process│
                           └───────┬──────┘
                                   │
                                   ▼
                           ┌──────────────┐
                           │    Redis     │
                           │Task Results  │
                           └──────────────┘
```

### RAG Pipeline

```text
PDF Resume
    │
    ▼
Text Extraction
    │
    ▼
Section Detection & Chunking
    │
    ▼
OpenAI Embeddings
    │
    ▼
PostgreSQL + pgvector
    │
    │
    ├─────────────── Job Description
    │                       │
    ▼                       ▼
Vector Similarity Search ◄──┘
    │
    ▼
Relevant Resume Context
    │
    ▼
LLM
    │
    ▼
Personalized Interview Question
```

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python
- SQLAlchemy
- Alembic
- Pydantic

### Database

- PostgreSQL
- pgvector

### Background Processing

- Celery
- RabbitMQ
- Redis

### AI

- OpenAI API
- Vector Embeddings
- Retrieval-Augmented Generation (RAG)
- Structured LLM Outputs

### Infrastructure

- Docker
- Docker Compose

---

## Running Locally

### Prerequisites

Make sure you have installed:

- Python 3.10+
- Node.js
- Docker
- Docker Compose
- An OpenAI API key

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Interview-Generator-v2
```

### 2. Configure environment variables

Create your local environment file from the example:

```bash
cp .env.example .env
```

Add your own credentials and API keys.

**Never commit your `.env` file or OpenAI API key to GitHub.**

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts the services required by the backend, including PostgreSQL, RabbitMQ, and Redis.

### 4. Set up the backend

```bash
python -m venv venv
source venv/bin/activate

pip install -r backend/requirements.txt
```

Run database migrations:

```bash
cd backend
alembic upgrade head
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

### 5. Start the Celery worker

Open another terminal:

```bash
cd backend
source ../venv/bin/activate

python -m celery -A app.workers.celery_app worker --loglevel=info --pool=solo
```

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Application Flow

```text
Register / Login
       ↓
Upload Resume
       ↓
Resume Processing
       ↓
Add Job Description
       ↓
Create Interview
       ↓
AI Generates Question
       ↓
Submit Answer
       ↓
AI Feedback
       ↓
Next Question
```

---

## Security

Ready2Interview includes several basic security measures:

- JWT-based authentication
- User-scoped resume and interview access
- Protected API endpoints
- Resume ownership validation
- Environment-based secret management
- User-level filtering for vector retrieval

The current application is intended as a portfolio and development project rather than a production SaaS deployment.

---

## Future Improvements

Potential future improvements include:

- Production cloud deployment
- Improved authentication and token handling
- Rate limiting
- Interview completion workflows
- Detailed analytics and performance history
- Additional interview modes
- Improved RAG retrieval and ranking
- Voice-based interviews
- Automated testing and CI/CD

---

## Author

**Taegang Kim**

Computer Science  
The University of Texas at Austin

This project was designed and developed by Taegang Kim.

---

## License

Copyright © 2026 Taegang Kim. All rights reserved.

This repository is publicly available for portfolio, educational review, and evaluation purposes.
