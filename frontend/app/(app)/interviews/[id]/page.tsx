"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listQuestions, streamNextQuestion, submitAnswer, getSessionFeedback, InterviewQuestion, AnswerFeedback } from "@/lib/api";

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [, setQuestions] = useState<InterviewQuestion[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [aggregate, setAggregate] = useState<{ average_score: number | null; answered_count: number } | null>(null);

  useEffect(() => { listQuestions(id).then(setQuestions); }, [id]);

  async function handleNextQuestion() {
    setIsStreaming(true); setStreamingText(""); setFeedback(null); setCurrentQuestionId(null);
    await streamNextQuestion(
      id,
      (token) => setStreamingText((prev) => prev + token),
      (meta) => { setCurrentQuestionId(meta.question_id); setIsStreaming(false); }
    );
  }

  async function handleSubmitAnswer() {
    if (!currentQuestionId) return;
    const result = await submitAnswer(id, currentQuestionId, answerText);
    setFeedback(result);
    setAnswerText("");
    setAggregate(await getSessionFeedback(id));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Interview Session</h1>
      <button onClick={handleNextQuestion} disabled={isStreaming} className="bg-black text-white px-4 py-2 rounded">
        {isStreaming ? "Generating..." : "Get Next Question"}
      </button>
      {(streamingText || currentQuestionId) && (
        <div className="border p-4 rounded"><p className="font-medium">{streamingText}</p></div>
      )}
      {currentQuestionId && !feedback && (
        <div className="space-y-2">
          <textarea className="border w-full p-2 h-32" placeholder="Type your answer..." value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
          <button onClick={handleSubmitAnswer} className="bg-black text-white px-4 py-2 rounded">Submit Answer</button>
        </div>
      )}
      {feedback && (
        <div className="border p-4 rounded space-y-2">
          <p className="font-bold">Score: {feedback.overall_score}</p>
          <p>Strengths: {feedback.strengths.join(", ")}</p>
          <p>Weaknesses: {feedback.weaknesses.join(", ")}</p>
          {feedback.follow_up_question && <p>Follow-up: {feedback.follow_up_question}</p>}
        </div>
      )}
      {aggregate && <p className="text-sm text-gray-500">Session average so far: {aggregate.average_score} ({aggregate.answered_count} answered)</p>}
    </div>
  );
}