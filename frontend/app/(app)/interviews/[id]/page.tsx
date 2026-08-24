"use client";
import { useParams } from "next/navigation";
import { SessionPanel } from "@/components/workspace/session-panel";

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  return <SessionPanel interviewId={id} />;
}