"use client";
import { useEffect, useState } from "react";
import { listResumes, listJobs, listInterviews, Resume, JobDescription, InterviewSession } from "@/lib/api";

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);

  useEffect(() => {
    listResumes().then(setResumes);
    listJobs().then(setJobs);
    listInterviews().then(setInterviews);
  }, []);

  return (
    <div className="space-y-8">
      <section><h2 className="font-bold mb-2">Resumes</h2>
        <ul>{resumes.map((r) => <li key={r.id}>{r.file_name} — {r.status}</li>)}</ul></section>
      <section><h2 className="font-bold mb-2">Job Descriptions</h2>
        <ul>{jobs.map((j) => <li key={j.id}>{j.company_name} — {j.job_title}</li>)}</ul></section>
      <section><h2 className="font-bold mb-2">Interviews</h2>
        <ul>{interviews.map((i) => <li key={i.id}><a className="underline" href={`/interviews/${i.id}`}>{i.interview_type} / {i.difficulty} — {i.status}</a></li>)}</ul></section>
    </div>
  );
}