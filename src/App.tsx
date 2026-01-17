import { useState, useRef, useEffect } from 'react';
import { Shield, Github, ExternalLink, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppView, ClassData, Stats, ParseResult, MuscleGroupStats } from './types';
import { Modal } from './components/ui/Modal';
import { LandingView } from './components/views/LandingView';
import { ProcessingView } from './components/views/ProcessingView';
import { ResultsView } from './components/views/ResultsView';
import { ErrorView } from './components/views/ErrorView';
import { parsePDF } from './lib/pdfParser';
import { calculateStats } from './lib/statsCalculator';
import { calculateMuscleGroupStats } from './lib/muscleGroupStats';

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [muscleStats, setMuscleStats] = useState<MuscleGroupStats | null>(null);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'howto' | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#93C5FD', '#1E40AF', '#DBEAFE']
    });
  };

  const handleFileUpload = async (file: File) => {
    setView('processing');
    setProgress(0);
    setError(null);

    try {
      // Parse PDF
      setProgress(10);
      const result: ParseResult = await parsePDF(file, (p) => setProgress(10 + p * 40));

      if (result.classes.length === 0) {
        throw new Error('No Solidcore classes found in this PDF. Make sure you uploaded a Mindbody schedule export.');
      }

      setAllClasses(result.classes);
      setAvailableYears(result.availableYears);
      setProgress(60);

      // Default to 2025 if available, otherwise most recent year
      const defaultYear = result.availableYears.includes(2025)
        ? 2025
        : result.availableYears[0] || new Date().getFullYear();
      setSelectedYear(defaultYear);

      // Filter and calculate stats
      const filtered = result.classes.filter(c => c.rawDate.getFullYear() === defaultYear);
      setFilteredClasses(filtered);
      setProgress(80);

      if (filtered.length === 0) {
        throw new Error(`No classes found for ${defaultYear}. Try selecting a different year.`);
      }

      const calculatedStats = calculateStats(filtered, defaultYear);
      setStats(calculatedStats);

      // Calculate muscle group stats
      const calculatedMuscleStats = calculateMuscleGroupStats(filtered);
      setMuscleStats(calculatedMuscleStats);
      setProgress(100);

      setView('results');

      // Trigger confetti celebration
      setTimeout(triggerConfetti, 300);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse PDF. Please try again.');
      setView('error');
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const filtered = allClasses.filter(c => c.rawDate.getFullYear() === year);
    setFilteredClasses(filtered);

    if (filtered.length > 0) {
      const calculatedStats = calculateStats(filtered, year);
      setStats(calculatedStats);

      // Recalculate muscle group stats for new year
      const calculatedMuscleStats = calculateMuscleGroupStats(filtered);
      setMuscleStats(calculatedMuscleStats);
    }
  };

  const handleReset = () => {
    setView('landing');
    setProgress(0);
    setStats(null);
    setMuscleStats(null);
    setAllClasses([]);
    setFilteredClasses([]);
    setAvailableYears([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-slate-900 bg-dot-pattern text-black dark:text-white font-sans selection:bg-primary selection:text-white flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <nav className="border-b-4 border-black dark:border-primary bg-white dark:bg-slate-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          <div className="font-black text-xl lg:text-2xl tracking-tighter flex items-center gap-2 lg:gap-3">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary border-2 border-black dark:border-primary"></div>
            SOLID.STATS
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setActiveModal('about')} className="font-bold hover:underline decoration-2 text-sm lg:text-base uppercase">About</button>
            <button onClick={() => setActiveModal('privacy')} className="font-bold hover:underline decoration-2 text-sm lg:text-base uppercase">Privacy</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 lg:pt-12 flex-grow">
        {view === 'landing' && (
          <LandingView
            onFileUpload={handleFileUpload}
            onHowToClick={() => setActiveModal('howto')}
          />
        )}
        {view === 'processing' && <ProcessingView progress={progress} />}
        {view === 'results' && stats && (
          <ResultsView
            stats={stats}
            muscleStats={muscleStats}
            classes={filteredClasses}
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            onReset={handleReset}
            cardRef={cardRef}
          />
        )}
        {view === 'error' && (
          <ErrorView
            error={error || 'An unknown error occurred'}
            onRetry={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-8 mt-12 border-t-4 border-black dark:border-primary transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-black uppercase text-lg mb-4">Disclaimer</p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6">
            This is an unofficial fan project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Solidcore, Mindbody, or any of their subsidiaries or its affiliates. All product and company names are trademarks or registered trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
          </p>
          <div className="pt-4 border-t border-gray-800">
            <a
              href="https://bigdreams.info"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-primary-light font-bold transition-colors"
            >
              A Big Dreams Project
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="About Project"
      >
        <p className="mb-4 font-bold text-lg">Built for the shaking community.</p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          SolidStats is a fun, fan-made tool designed to help you visualize your year in workouts.
          Whether you're hitting [solidcore] once a week or every day, you deserve to see your progress in style.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          This tool works by parsing the PDF schedule export from the Mindbody website. It calculates your top stats locally in your browser and generates a shareable image for your socials.
        </p>
        <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
          <a href="https://github.com/eledroos/solid-stats" target="_blank" rel="noreferrer" className="inline-flex items-center font-bold text-blue-600 dark:text-blue-400 hover:underline">
            <Github className="w-4 h-4 mr-2"/> View Source Code
          </a>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
      >
        <div className="flex items-center gap-3 mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 border-2 border-blue-200 dark:border-blue-800">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-300">100% Client-Side Processing</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Your data never leaves your device.</p>
          </div>
        </div>

        <p className="mb-4 text-gray-700 dark:text-gray-300">
          <strong>We do not store your data.</strong> When you upload your PDF, it is read by JavaScript running directly in your web browser.
          It is never uploaded to any server, database, or cloud storage.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Once you close this tab or refresh the page, all data is permanently wiped from your browser's memory.
        </p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          <strong>Note:</strong> Because we don't store data, we cannot "recover" your stats later. You will need to re-upload your PDF if you want to view your stats again.
        </p>
      </Modal>

      <Modal
        isOpen={activeModal === 'howto'}
        onClose={() => setActiveModal(null)}
        title="Get Your Stats"
      >
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black dark:bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">1</div>
            <div>
              <p className="font-bold mb-1">Log in to Mindbody</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Go to the schedule page on the desktop website (not the app).</p>
              <a
                href="https://www.mindbodyonline.com/explore/account/schedule"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm font-bold text-white bg-primary px-3 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Open Mindbody <ExternalLink size={14} className="ml-2"/>
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black dark:bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">2</div>
            <div>
              <p className="font-bold mb-1">Find your history</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the <span className="font-bold bg-gray-200 dark:bg-gray-700 px-1">Schedule</span> tab, then click <span className="font-bold bg-gray-200 dark:bg-gray-700 px-1">Completed</span>.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black dark:bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">3</div>
            <div>
              <p className="font-bold mb-1">Load all your classes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scroll to the bottom and click <span className="font-bold bg-gray-200 dark:bg-gray-700 px-1">View More</span> repeatedly until you see all the classes you want to include.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black dark:bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">4</div>
            <div>
              <p className="font-bold mb-1">Print to PDF</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Right click anywhere and select <strong>Print</strong>. Change the destination printer to <strong>"Save as PDF"</strong> and save the file.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black dark:bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">5</div>
            <div>
              <p className="font-bold mb-1">Upload here</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Come back to this page and upload that PDF file to see your stats!
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
