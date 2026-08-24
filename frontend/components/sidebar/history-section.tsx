"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { ArrowUpDown } from "lucide-react";

export function HistorySection() {
  const { interviews } = useWorkspace();
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const router = useRouter();
  const params = useParams<{ id?: string }>();

  const sorted = [...interviews].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return order === "desc" ? -diff : diff;
  });

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Interviews</span>
        <button
          onClick={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          aria-label="Toggle sort order"
        >
          <ArrowUpDown size={14} />
        </button>
      </div>
      <ul className="space-y-1">
        {sorted.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => router.push(`/interviews/${s.id}`)}
              className={`w-full text-left truncate px-2 py-1.5 rounded-lg text-sm transition-colors ${
                params?.id === s.id
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {s.company_name} - {s.job_title}
            </button>
          </li>
        ))}
        {sorted.length === 0 && <li className="px-2 text-sm text-slate-400">No interviews yet</li>}
      </ul>
    </div>
  );
}