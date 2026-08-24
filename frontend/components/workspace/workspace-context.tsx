"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { listResumes, listInterviews, Resume, InterviewSession } from "@/lib/api";

interface WorkspaceContextValue {
  resumes: Resume[];
  refreshResumes: () => void;
  interviews: InterviewSession[];
  refreshInterviews: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);

  const refreshResumes = useCallback(() => { listResumes().then(setResumes); }, []);
  const refreshInterviews = useCallback(() => { listInterviews().then(setInterviews); }, []);

  useEffect(() => { refreshResumes(); refreshInterviews(); }, [refreshResumes, refreshInterviews]);

  return (
    <WorkspaceContext.Provider value={{ resumes, refreshResumes, interviews, refreshInterviews }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}