# scoring with rubric, structured output
from pydantic import BaseModel
from app.services.llm_client import client

class AnswerFeedback(BaseModel):
    overall_score: int
    scores: dict[str, int]
    strengths: list[str]
    weaknesses: list[str]
    follow_up_question: str | None = None

FEEDBACK_SYSTEM_PROMPT = """You are a strict, rubric-based interviewer grading a candidate's answer.
Score these sub-dimensions from 0-100: technical_accuracy, clarity, specificity, impact.
overall_score is your holistic judgment (not necessarily the average).
Ground every strength/weakness in the actual answer text and the provided resume/JD context.
If the answer is vague or lacks concrete numbers/impact, reflect that in specificity/impact scores.
Always propose one concrete follow_up_question that probes the weakest part of the answer."""

def evaluate_answer(question_text: str, answer_text: str, context: str) -> AnswerFeedback:
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[
            {"role": "system", "content": FEEDBACK_SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{question_text}\n\nCandidate answer:\n{answer_text}"},
        ],
        response_format=AnswerFeedback,
    )
    return completion.choices[0].message.parsed