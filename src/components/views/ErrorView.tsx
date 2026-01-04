import { AlertTriangle } from 'lucide-react';
import { BrutalButton } from '../ui/BrutalButton';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="bg-red-100 dark:bg-red-900/30 border-4 border-black dark:border-red-500 shadow-brutal-lg dark:shadow-brutal-lg-dark p-8 max-w-md text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600 dark:text-red-400" />
        <h2 className="text-2xl font-black mb-4 uppercase">Oops!</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{error}</p>
        <BrutalButton onClick={onRetry}>Try Again</BrutalButton>
      </div>
    </div>
  );
}
