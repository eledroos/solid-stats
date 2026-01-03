import { ReactNode } from 'react';

interface BrutalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function BrutalCard({ children, className = '', title }: BrutalCardProps) {
  return (
    <div className={`bg-white border-4 border-black shadow-brutal-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter border-b-4 border-black pb-2 inline-block">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
