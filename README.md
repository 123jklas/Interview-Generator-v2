# Interview Generator (v1 — Streamlit baseline)

AI 기반 모의면접 생성기. 이력서 PDF를 업로드하면 지원 회사/역할에 맞춘 면접 질문을 생성하고,
텍스트 또는 음성으로 답변하면 AI가 피드백을 제공한다.

이 버전(`v1-streamlit` 태그)은 SaaS 백엔드 플랫폼으로 재설계하기 전 기준선(baseline)이다.
이후 개발은 `develop` 브랜치에서 진행하며, 이 버전의 동작은 보존한다.

## 현재 기능 (v1)

- **이력서 업로드**: PDF 업로드 → `PyMuPDFLoader`로 텍스트 추출
- **RAG 기반 질문 생성**: 이력서 텍스트를 청크로 분할(`RecursiveCharacterTextSplitter`) →
  OpenAI 임베딩 → FAISS 벡터스토어 → LangChain 검색 도구(`pdf_search`)로 구성
- **회사 리서치**: Tavily Search를 LangChain 도구로 연결해 지원 회사 정보를 함께 활용
- **면접 에이전트**: `gpt-4o` 기반 LangChain tool-calling agent가 이력서 검색 결과 + 회사 검색
  결과를 근거로 질문 생성 및 답변 피드백을 수행 (`agent.py`의 `modelCreation`)
- **텍스트 답변**: Streamlit 채팅 UI로 질문/답변 진행, 세션별 대화 기록 유지
- **음성 답변**: 브라우저에서 오디오 녹음 → HuggingFace `openai/whisper-small` 파이프라인으로
  transcription → `superb/wav2vec2-base-superb-er`로 감정(emotion) 인식 → 텍스트 + 감정 라벨을
  함께 프롬프트에 전달
- **TTS**: OpenAI TTS(`tts-1`, voice `shimmer`)로 질문을 음성으로 읽어줌 (pygame으로 재생)

## 스택

Streamlit, LangChain, LangChain-OpenAI, FAISS, PyMuPDF/PyPDF2, OpenAI API, Tavily,
HuggingFace Transformers(Whisper, wav2vec2), pygame, pydub

## 로컬 실행

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# .env에 OPENAI_API_KEY, TAVILY_API_KEY 입력

streamlit run main.py
```

## 알려진 제한 (v2 재설계에서 해결 예정)

- 인증/사용자 구분 없음 (단일 세션, Streamlit `session_state`에만 상태 저장)
- 이력서/면접 기록이 영구 저장되지 않음 (새로고침 시 소실)
- FAISS 인덱스가 요청마다 메모리에서 재생성됨 (다중 사용자 확장 불가)
- PDF 파싱/임베딩/음성 인식이 모두 동기적으로 요청 안에서 처리됨
- 배포된 웹 서비스 아님 (로컬 실행 전용)

## 로드맵

`v1-streamlit` 이후에는 FastAPI + PostgreSQL(pgvector) + Redis + Celery/RabbitMQ 기반
백엔드와 Next.js 프론트엔드로 재구성해 실제 배포 가능한 SaaS 플랫폼으로 발전시킨다.
진행 상황은 `develop` 브랜치와 GitHub Issues/Milestones에서 관리한다.
