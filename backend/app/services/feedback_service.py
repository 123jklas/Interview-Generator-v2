from pydantic import BaseModel
from app.services.llm_client import client


class ScoreBreakdown(BaseModel):
    technical_accuracy: int
    clarity: int
    specificity: int
    impact: int


class AnswerFeedback(BaseModel):
    overall_score: int
    scores: ScoreBreakdown
    strengths: list[str]
    weaknesses: list[str]
    follow_up_question: str | None


FEEDBACK_SYSTEM_PROMPT = """
You are a strict, rubric-based interviewer grading a candidate's answer.

Score these sub-dimensions from 0-100:
- technical_accuracy
- clarity
- specificity
- impact

overall_score is your holistic judgment and does not need to be the arithmetic average.

Ground every strength and weakness in the actual answer text and provided resume/JD context.

If the answer is vague or lacks concrete metrics or impact, reflect that in the specificity and impact scores.

Always provide one concrete follow_up_question that probes the weakest part of the answer.
"""


def evaluate_answer(
    question_text: str,
    answer_text: str,
    context: str,
) -> AnswerFeedback:

    completion = client.chat.completions.parse(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": FEEDBACK_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": (
                    f"Context:\n{context}\n\n"
                    f"Question:\n{question_text}\n\n"
                    f"Candidate answer:\n{answer_text}"
                ),
            },
        ],
        response_format=AnswerFeedback,
    )

    return completion.choices[0].message.parsed