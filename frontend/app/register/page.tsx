"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, fullName);
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">Register</h1>
        <input className={inputClass} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium transition-colors" type="submit">
          Register
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <a href="/login" className="text-indigo-600 dark:text-indigo-400 underline">Log in</a>
        </p>
      </form>
    </div>
  );
}