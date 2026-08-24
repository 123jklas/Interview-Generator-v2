"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { WorkspaceProvider } from "@/components/workspace/workspace-context";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !isAuthenticated) router.replace("/login"); }, [loading, isAuthenticated]);
  if (loading || !isAuthenticated) return <p className="p-8 text-slate-500 dark:text-slate-400">Loading...</p>;

  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </WorkspaceProvider>
  );
}