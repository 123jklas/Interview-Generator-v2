const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}
export function setToken(token: string) { localStorage.setItem("access_token", token); }
export function clearToken() { localStorage.removeItem("access_token"); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- auth ----
export function register(email: string, password: string, full_name?: string) {
  return request("/api/v1/auth/register", { method: "POST", body: JSON.stringify({ email, password, full_name }) });
}
export async function login(email: string, password: string) {
  const data = await request<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

// ---- resumes ----
export interface Resume { id: string; file_name: string; status: string; created_at: string; }
export function listResumes() { return request<Resume[]>("/api/v1/resumes"); }
export function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<Resume>("/api/v1/resumes", { method: "POST", body: form });
}
export function getResumeStatus(id: string) {
  return request<{ resume_id: string; status: string; error_message: string | null }>(`/api/v1/resumes/${id}/status`);
}

// ---- jobs ----
export interface JobDescription { id: string; company_name: string; job_title: string; description: string; created_at: string; }
export function listJobs() { return request<JobDescription[]>("/api/v1/jobs"); }
export function createJob(payload: { company_name: string; job_title: string; description: string }) {
  return request<JobDescription>("/api/v1/jobs", { method: "POST", body: JSON.stringify(payload) });
}

// ---- interviews ----
export interface InterviewSession {
    id: string;
    resume_id: string;
    job_description_id: string;
    interview_type: string;
    difficulty: string;
    status: string;
    created_at: string;
    company_name: string;
    job_title: string;
  }
export interface InterviewQuestion {
  id: string; sequence_number: number; question_type: string; difficulty: string;
  question: string; target_skills: string[]; reason: string | null;
}
export interface AnswerFeedback {
  id: string; question_id: string; overall_score: number; scores: Record<string, number>;
  strengths: string[]; weaknesses: string[]; follow_up_question: string | null;
}

export function listInterviews() { return request<InterviewSession[]>("/api/v1/interviews"); }
export function createInterview(payload: { resume_id: string; job_description_id: string; interview_type: string; difficulty: string }) {
  return request<InterviewSession>("/api/v1/interviews", { method: "POST", body: JSON.stringify(payload) });
}
export function listQuestions(id: string) { return request<InterviewQuestion[]>(`/api/v1/interviews/${id}/questions`); }
export function submitAnswer(interviewId: string, question_id: string, answer_text: string) {
  return request<AnswerFeedback>(`/api/v1/interviews/${interviewId}/answers`, {
    method: "POST", body: JSON.stringify({ question_id, answer_text }),
  });
}
export function getSessionFeedback(id: string) {
  return request<{ session_id: string; answered_count: number; average_score: number | null; weaknesses: string[] }>(
    `/api/v1/interviews/${id}/feedback`
  );
}
export function updateResume(id: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return request<Resume>(`/api/v1/resumes/${id}`, { method: "PATCH", body: form });
  }
  
export function deleteResume(id: string) {
return request<void>(`/api/v1/resumes/${id}`, { method: "DELETE" });
}
// ---- SSE 스트리밍 (EventSource는 커스텀 헤더를 못 보내서 fetch+ReadableStream으로 직접 파싱) ----
export async function streamNextQuestion(
  interviewId: string,
  onToken: (token: string) => void,
  onDone: (meta: { question_id: string; type: string; difficulty: string; target_skills: string[]; reason: string }) => void
) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/interviews/${interviewId}/questions/stream`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.body) throw new Error("No stream body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const raw of events) {
      const lines = raw.split("\n");
      const isDone = lines.some((l) => l.startsWith("event: done"));
      const dataLine = lines.find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      const data = JSON.parse(dataLine.slice("data: ".length));
      if (isDone) onDone(data);
      else if (data.token) onToken(data.token);
    }
  }
}