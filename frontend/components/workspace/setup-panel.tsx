"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createJob, listJobs, createInterview, JobDescription } from "@/lib/api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Card } from "@/components/ui/card";

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export function SetupPanel() {
  const { resumes, refreshInterviews } = useWorkspace();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [jobId, setJobId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => { listJobs().then(setJobs); }, []);

  const readyResumes = resumes.filter((r) => r.status === "READY");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!resumeId) { setError("Select a resume."); return; }

    setSubmitting(true);
    try {
      let finalJobId = jobId;
      if (mode === "new") {
        if (!companyName || !jobTitle || !description) {
          setError("Fill in company, job title, and description.");
          setSubmitting(false);
          return;
        }
        const job = await createJob({ company_name: companyName, job_title: jobTitle, description });
        finalJobId = job.id;
      }
      if (!finalJobId) { setError("Select or create a job description."); setSubmitting(false); return; }

      const session = await createInterview({ resume_id: resumeId, job_description_id: finalJobId, interview_type: interviewType, difficulty });
      refreshInterviews();
      router.push(`/interviews/${session.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-xl space-y-5">
      <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">Start a new interview</h1>

      <div>
        <div className="flex gap-2 mb-3 text-sm">
          <button type="button" onClick={() => setMode("existing")}
            className={`px-3 py-1.5 rounded-lg ${mode === "existing" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}>
            Use existing job
          </button>
          <button type="button" onClick={() => setMode("new")}
            className={`px-3 py-1.5 rounded-lg ${mode === "new" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}>
            Add new job description
          </button>
        </div>

        {mode === "existing" ? (
          <select className={inputClass} value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">Select job description</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.company_name} - {j.job_title}</option>)}
          </select>
        ) : (
          <div className="space-y-3">
            <input className={inputClass} placeholder="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <input className={inputClass} placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <textarea className={`${inputClass} h-32`} placeholder="Job description text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select className={inputClass} value={resumeId} onChange={(e) => setResumeId(e.target.value)} required>
          <option value="">Select resume (ready only)</option>
          {readyResumes.map((r) => <option key={r.id} value={r.id}>{r.file_name}</option>)}
        </select>
        <div className="flex gap-3">
          <select className={inputClass} value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
            <option value="mixed">Mixed</option>
            <option value="behavioral">Behavioral</option>
            <option value="technical">Technical</option>
          </select>
          <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={submitting} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-2 text-sm font-medium transition-colors" type="submit">
          {submitting ? "Starting..." : "Start interview"}
        </button>
      </form>
    </Card>
  );
}