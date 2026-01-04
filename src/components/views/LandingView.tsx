import { useRef, useState, DragEvent } from 'react';
import { Upload, HelpCircle } from 'lucide-react';

interface LandingViewProps {
  onFileUpload: (file: File) => void;
  onHowToClick: () => void;
}

export function LandingView({ onFileUpload, onHowToClick }: LandingViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      onFileUpload(file);
    } else if (file) {
      alert('Please upload a PDF file.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="mb-8 p-8 lg:p-12 bg-primary-lighter dark:bg-slate-800 border-4 border-black dark:border-primary shadow-brutal-xl dark:shadow-brutal-xl-dark max-w-md lg:max-w-lg w-full rotate-[-2deg] animate-fade-in-up">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white leading-[0.85]">
          Solid<br/><span className="text-primary">Stats</span>
        </h1>
        <div className="text-2xl lg:text-3xl font-black italic bg-black dark:bg-primary text-white inline-block px-3 py-1 rotate-2">
          UNOFFICIAL 2025
        </div>
      </div>

      <p className="text-xl lg:text-2xl font-bold mb-10 max-w-md lg:max-w-lg border-l-8 border-black dark:border-primary pl-6 text-left animate-fade-in-up animation-delay-100">
        Ready to see your year in review?
        <br/><span className="text-base lg:text-lg font-normal mt-3 block text-gray-600 dark:text-gray-400">Upload your Mindbody PDF to get started.</span>
      </p>

      <div className="w-full max-w-sm lg:max-w-md group animate-fade-in-up animation-delay-200">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />
        <label
          className={`flex flex-col items-center justify-center w-full h-40 lg:h-48 border-4 border-black dark:border-primary cursor-pointer shadow-brutal-xl dark:shadow-brutal-xl-dark active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
            isDragging ? 'bg-primary-light border-primary' : 'bg-primary-lightest dark:bg-slate-800'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className={`w-10 h-10 lg:w-12 lg:h-12 mb-2 ${isDragging ? 'text-primary' : 'text-black dark:text-white'}`} />
            <p className="mb-2 text-xl lg:text-2xl font-black text-black dark:text-white uppercase">
              {isDragging ? 'DROP IT!' : 'UPLOAD PDF'}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-bold">
              {fileName || 'Drag & drop or click to select'}
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={onHowToClick}
        className="mt-6 lg:mt-8 flex items-center gap-2 text-sm lg:text-base font-bold bg-white dark:bg-slate-800 px-4 py-2 lg:px-6 lg:py-3 border-2 border-black dark:border-primary shadow-brutal-sm dark:shadow-brutal-dark hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all animate-fade-in-up animation-delay-300"
      >
        <HelpCircle size={16} className="lg:w-5 lg:h-5"/> How do I get my PDF?
      </button>
    </div>
  );
}
