import { ReactNode } from 'react';

interface BrutalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function BrutalCard({ children, className = '', title }: BrutalCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 border-4 border-black dark:border-primary shadow-brutal-lg dark:shadow-brutal-lg-dark p-6 ${className}`}>
      {title && (
        <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter border-b-4 border-black dark:border-primary pb-2 inline-block">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
