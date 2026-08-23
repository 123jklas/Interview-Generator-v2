"use client";
import { useState } from "react";
import { uploadResume, getResumeStatus } from "@/lib/api";
import { Card } from "@/components/ui/card";

const statusStyles: Record<string, string> = {
  READY: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
  PROCESSING: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  UPLOADED: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  FAILED: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
};

export default function UploadResumePage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStatus("UPLOADING");
    try {
      const resume = await uploadResume(file);
      setStatus(resume.status);
      poll(resume.id);
    } catch (err: any) {
      setError(err.message);
      setStatus("");
    }
  }

  function poll(id: string) {
    const interval = setInterval(async () => {
      const s = await getResumeStatus(id);
      setStatus(s.status);
      if (s.status === "READY" || s.status === "FAILED") {
        clearInterval(interval);
        if (s.status === "FAILED") setError(s.error_message);
      }
    }, 2000);
  }

  return (
    <Card className="max-w-md space-y-4">
      <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">Upload resume</h1>
      <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-8 text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
        Click to select a PDF
        <input type="file" accept="application/pdf" onChange={handleChange} className="hidden" />
      </label>
      {status && (
        <span className={`inline-block rounded-full text-xs px-2.5 py-1 ${statusStyles[status] || statusStyles.UPLOADED}`}>
          {status}
        </span>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </Card>
  );
}