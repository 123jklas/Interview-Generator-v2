"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listResumes, listJobs, createInterview, Resume, JobDescription } from "@/lib/api";
import { Card } from "@/components/ui/card";

const selectClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function NewInterviewPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    listResumes().then((rs) => setResumes(rs.filter((r) => r.status === "READY")));
    listJobs().then(setJobs);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const session = await createInterview({ resume_id: resumeId, job_description_id: jobId, interview_type: interviewType, difficulty });
      router.push(`/interviews/${session.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Card className="max-w-md space-y-4">
      <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">New interview</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select className={selectClass} value={resumeId} onChange={(e) => setResumeId(e.target.value)} required>
          <option value="">Select resume (ready only)</option>
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.file_name}</option>)}
        </select>
        <select className={selectClass} value={jobId} onChange={(e) => setJobId(e.target.value)} required>
          <option value="">Select job description</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.company_name} - {j.job_title}</option>)}
        </select>
        <select className={selectClass} value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
          <option value="mixed">Mixed</option>
          <option value="behavioral">Behavioral</option>
          <option value="technical">Technical</option>
        </select>
        <select className={selectClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium transition-colors" type="submit">
          Start interview
        </button>
      </form>
    </Card>
  );
}