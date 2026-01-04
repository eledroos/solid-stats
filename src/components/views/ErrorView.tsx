import { AlertTriangle, Mail } from 'lucide-react';
import { BrutalButton } from '../ui/BrutalButton';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  const handleReportIssue = () => {
    const subject = encodeURIComponent('SolidStats PDF Issue');
    const body = encodeURIComponent(
      `Hi,\n\nI'm having trouble parsing my Mindbody PDF.\n\nError: ${error}\n\n[Please attach your PDF to this email]\n\nThanks!`
    );
    window.open(`mailto:hello@bigdreams.info?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="bg-red-100 dark:bg-red-900/30 border-4 border-black dark:border-red-500 shadow-brutal-lg dark:shadow-brutal-lg-dark p-8 max-w-md text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600 dark:text-red-400" />
        <h2 className="text-2xl font-black mb-4 uppercase">Oops!</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{error}</p>
        <div className="flex flex-col gap-3">
          <BrutalButton onClick={onRetry}>Try Again</BrutalButton>
          <BrutalButton variant="secondary" onClick={handleReportIssue} icon={Mail}>
            Report Issue
          </BrutalButton>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Attach your PDF to the email so we can debug
          </p>
        </div>
      </div>
    </div>
  );
}
