#  FastAPI 백엔드가 필요한 환경설정(configuration)을 한곳에서 읽고 관리하는 파일
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    upload_dir: str = "./uploads"
    openai_api_key: str
    celery_broker_url: str = "amqp://guest:guest@localhost:5672//"
    celery_result_backend: str = "redis://localhost:6379/0"
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

settings = Settings()