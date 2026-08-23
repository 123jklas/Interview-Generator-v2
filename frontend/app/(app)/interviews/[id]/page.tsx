"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listQuestions, streamNextQuestion, submitAnswer, getSessionFeedback, InterviewQuestion, AnswerFeedback } from "@/lib/api";
import { Card } from "@/components/ui/card";

const buttonClass =
  "rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-medium transition-colors";

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [, setQuestions] = useState<InterviewQuestion[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentMeta, setCurrentMeta] = useState<{ type: string; difficulty: string } | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [aggregate, setAggregate] = useState<{ average_score: number | null; answered_count: number } | null>(null);

  useEffect(() => { listQuestions(id).then(setQuestions); }, [id]);

  async function handleNextQuestion() {
    setIsStreaming(true);
    setStreamingText("");
    setFeedback(null);
    setCurrentQuestionId(null);
    setCurrentMeta(null);

    await streamNextQuestion(
      id,
      (token) => setStreamingText((prev) => prev + token),
      (meta) => {
        setCurrentQuestionId(meta.question_id);
        setCurrentMeta({ type: meta.type, difficulty: meta.difficulty });
        setIsStreaming(false);
      }
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
      <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">Interview session</h1>

      <button onClick={handleNextQuestion} disabled={isStreaming} className={buttonClass}>
        {isStreaming ? "Generating..." : "Get next question"}
      </button>

      {(streamingText || currentQuestionId) && (
        <Card>
          {currentMeta && (
            <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1 mb-3">
              {currentMeta.type} &middot; {currentMeta.difficulty}
            </span>
          )}
          <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-100">{streamingText}</p>
        </Card>
      )}

      {currentQuestionId && !feedback && (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-3 h-32 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your answer..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <button onClick={handleSubmitAnswer} className={buttonClass}>Submit answer</button>
        </div>
      )}

      {feedback && (
        <Card className="space-y-2">
          <p className="text-2xl font-medium text-indigo-600 dark:text-indigo-400">{feedback.overall_score}</p>
          <p className="text-sm text-slate-900 dark:text-slate-100">
            <span className="text-slate-500 dark:text-slate-400">Strengths: </span>{feedback.strengths.join(", ")}
          </p>
          <p className="text-sm text-slate-900 dark:text-slate-100">
            <span className="text-slate-500 dark:text-slate-400">Weaknesses: </span>{feedback.weaknesses.join(", ")}
          </p>
          {feedback.follow_up_question && (
            <p className="text-sm text-slate-900 dark:text-slate-100">
              <span className="text-slate-500 dark:text-slate-400">Follow-up: </span>{feedback.follow_up_question}
            </p>
          )}
        </Card>
      )}

      {aggregate && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Session average so far: {aggregate.average_score} ({aggregate.answered_count} answered)
        </p>
      )}
    </div>
  );
}