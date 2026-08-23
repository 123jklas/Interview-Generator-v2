"use client";
import { useEffect, useState } from "react";
import { listResumes, listJobs, listInterviews, Resume, JobDescription, InterviewSession } from "@/lib/api";
import { Card } from "@/components/ui/card";

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
      <section>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Resumes</h2>
        <Card>
          {resumes.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No resumes uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {resumes.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-900 dark:text-slate-100">{r.file_name}</span>
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1">
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Job descriptions</h2>
        <Card>
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No job descriptions added yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {jobs.map((j) => (
                <li key={j.id} className="py-2 text-sm text-slate-900 dark:text-slate-100">
                  {j.company_name} — {j.job_title}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Interviews</h2>
        <Card>
          {interviews.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No interviews started yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {interviews.map((i) => (
                <li key={i.id} className="py-2 text-sm">
                  <a href={`/interviews/${i.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {i.interview_type} / {i.difficulty} — {i.status}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}