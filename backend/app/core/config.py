#  FastAPI 백엔드가 필요한 환경설정(configuration)을 한곳에서 읽고 관리하는 파일
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    upload_dir: str = "./uploads"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

settings = Settings()