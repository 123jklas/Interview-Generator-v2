"use client";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProfileMenu } from "./profile-menu";
import { ResumeSection } from "./resume-section";
import { HistorySection } from "./history-section";

export function Sidebar() {
  const router = useRouter();
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 gap-4 overflow-y-auto">
      <ProfileMenu />
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 transition-colors"
      >
        <Plus size={16} /> New interview
      </button>
      <ResumeSection />
      <div className="border-t border-slate-200 dark:border-slate-800" />
      <HistorySection />
    </aside>
  );
}