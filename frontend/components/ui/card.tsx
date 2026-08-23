export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
      <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 ${className}`}>
        {children}
      </div>
    );
  }