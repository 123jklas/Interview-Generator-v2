"use client";
import { useRef } from "react";
import { uploadResume, updateResume, deleteResume } from "@/lib/api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

const statusDot: Record<string, string> = {
  READY: "bg-indigo-500",
  PROCESSING: "bg-amber-500",
  UPLOADED: "bg-slate-400",
  FAILED: "bg-red-500",
};

export function ResumeSection() {
  const { resumes, refreshResumes } = useWorkspace();
  const addInputRef = useRef<HTMLInputElement>(null);
  const updateInputRef = useRef<HTMLInputElement>(null);
  const updateTargetId = useRef<string | null>(null);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadResume(file);
    refreshResumes();
    e.target.value = "";
  }

  function triggerUpdate(id: string) {
    updateTargetId.current = id;
    updateInputRef.current?.click();
  }

  async function handleUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = updateTargetId.current;
    if (!file || !id) return;
    await updateResume(id, file);
    refreshResumes();
    e.target.value = "";
  }

  async function handleRemove(id: string) {
    await deleteResume(id);
    refreshResumes();
  }

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Resumes</span>
        <button onClick={() => addInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Add resume">
          <Plus size={16} />
        </button>
        <input ref={addInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleAdd} />
        <input ref={updateInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpdate} />
      </div>
      <ul className="space-y-1">
        {resumes.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
            <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[r.status] || statusDot.UPLOADED}`} />
              <span className="truncate">{r.file_name}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <button onClick={() => triggerUpdate(r.id)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Update resume">
                <RefreshCw size={14} />
              </button>
              <button onClick={() => handleRemove(r.id)} className="text-slate-400 hover:text-red-500" aria-label="Remove resume">
                <Trash2 size={14} />
              </button>
            </span>
          </li>
        ))}
        {resumes.length === 0 && <li className="px-2 text-sm text-slate-400">No resumes yet</li>}
      </ul>
    </div>
  );
}