"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";

export default function NewJobPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try { await createJob({ company_name: companyName, job_title: jobTitle, description }); router.push("/dashboard"); }
    catch (err: any) { setError(err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h1 className="text-xl font-bold">Add Job Description</h1>
      <input className="border p-2 w-full" placeholder="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
      <textarea className="border p-2 w-full h-40" placeholder="Job description text" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button className="bg-black text-white px-4 py-2 rounded w-full" type="submit">Save</button>
    </form>
  );
}