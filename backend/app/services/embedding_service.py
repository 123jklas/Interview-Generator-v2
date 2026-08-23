from openai import OpenAI
from app.core.config import settings

_client = OpenAI(api_key=settings.openai_api_key)
EMBEDDING_MODEL = "text-embedding-3-small"

def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    response = _client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [d.embedding for d in response.data]

def embed_text(text: str) -> list[float]:
    return embed_texts([text])[0]