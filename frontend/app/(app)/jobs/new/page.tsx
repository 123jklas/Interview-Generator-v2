"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";
import { Card } from "@/components/ui/card";

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function NewJobPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createJob({ company_name: companyName, job_title: jobTitle, description });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Card className="max-w-md space-y-4">
      <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">Add job description</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className={inputClass} placeholder="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <input className={inputClass} placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        <textarea className={`${inputClass} h-40`} placeholder="Job description text" value={description} onChange={(e) => setDescription(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium transition-colors" type="submit">
          Save
        </button>
      </form>
    </Card>
  );
}