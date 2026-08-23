"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resumes/upload", label: "Resumes" },
  { href: "/jobs/new", label: "Jobs" },
  { href: "/interviews/new", label: "Interviews" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !isAuthenticated) router.replace("/login"); }, [loading, isAuthenticated]);
  if (loading || !isAuthenticated) return <p className="p-8 text-slate-500 dark:text-slate-400">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <span className="font-medium text-slate-900 dark:text-slate-100">Ready2Interview</span>
        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {item.label}
            </a>
          ))}
          <ThemeToggle />
          <button onClick={() => { logout(); router.push("/login"); }} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}