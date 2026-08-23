"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">Log in</h1>
        <input className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium transition-colors" type="submit">
          Log in
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No account? <a href="/register" className="text-indigo-600 dark:text-indigo-400 underline">Register</a>
        </p>
      </form>
    </div>
  );
}