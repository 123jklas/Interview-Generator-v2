"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, LogOut } from "lucide-react";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
          <User size={16} />
        </span>
        Profile
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 space-y-1 z-10">
          <div className="px-2 py-1"><ThemeToggle /></div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}