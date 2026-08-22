# FastAPI가 PostgreSQL과 대화할 수 있도록 DB 연결을 만들고, API 요청마다 사용할 Database Session을 제공하는 파일
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()