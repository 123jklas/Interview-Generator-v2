"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listResumes, listJobs, createInterview, Resume, JobDescription } from "@/lib/api";

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
    } catch (err: any) { setError(err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h1 className="text-xl font-bold">New Interview</h1>
      <select className="border p-2 w-full" value={resumeId} onChange={(e) => setResumeId(e.target.value)} required>
        <option value="">Select resume (READY only)</option>
        {resumes.map((r) => <option key={r.id} value={r.id}>{r.file_name}</option>)}
      </select>
      <select className="border p-2 w-full" value={jobId} onChange={(e) => setJobId(e.target.value)} required>
        <option value="">Select job description</option>
        {jobs.map((j) => <option key={j.id} value={j.id}>{j.company_name} - {j.job_title}</option>)}
      </select>
      <select className="border p-2 w-full" value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
        <option value="mixed">Mixed</option><option value="behavioral">Behavioral</option><option value="technical">Technical</option>
      </select>
      <select className="border p-2 w-full" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button className="bg-black text-white px-4 py-2 rounded w-full" type="submit">Start Interview</button>
    </form>
  );
}