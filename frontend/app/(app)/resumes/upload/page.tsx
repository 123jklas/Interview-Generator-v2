"use client";
import { useState } from "react";
import { uploadResume, getResumeStatus } from "@/lib/api";

export default function UploadResumePage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStatus("uploading...");
    try {
      const resume = await uploadResume(file);
      setStatus(resume.status);
      poll(resume.id);
    } catch (err: any) { setError(err.message); }
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
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-bold">Upload Resume</h1>
      <input type="file" accept="application/pdf" onChange={handleChange} />
      {status && <p>Status: {status}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}