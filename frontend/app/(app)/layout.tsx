"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !isAuthenticated) router.replace("/login"); }, [loading, isAuthenticated]);
  if (loading || !isAuthenticated) return <p className="p-8">Loading...</p>;

  return (
    <div>
      <nav className="flex justify-between p-4 border-b">
        <div className="space-x-4">
          <a href="/dashboard">Dashboard</a>
          <a href="/resumes/upload">Upload Resume</a>
          <a href="/jobs/new">Add Job</a>
          <a href="/interviews/new">New Interview</a>
        </div>
        <button onClick={() => { logout(); router.push("/login"); }}>Logout</button>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}