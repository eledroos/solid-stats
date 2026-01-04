interface ProcessingViewProps {
  progress: number;
}

export function ProcessingView({ progress }: ProcessingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h2 className="text-4xl font-black mb-8 uppercase text-center italic animate-pulse">
        Extracting<br/>Shakes...
      </h2>
      <div className="w-full max-w-md h-16 border-4 border-black dark:border-primary p-2 bg-white dark:bg-slate-800 shadow-brutal-lg dark:shadow-brutal-lg-dark">
        <div
          className="h-full bg-primary transition-all duration-200 ease-linear border-r-4 border-black dark:border-primary-dark"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-6 font-mono font-bold text-xl">{Math.floor(progress)}%</p>
    </div>
  );
}
