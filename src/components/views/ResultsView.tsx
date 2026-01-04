import { RefObject, useState, useRef } from 'react';
import { Share2, Loader2, User, MapPin, Flame } from 'lucide-react';
import { Stats, ClassData } from '../../types';
import { BrutalButton } from '../ui/BrutalButton';
import { BrutalCard } from '../ui/BrutalCard';
import { ReceiptCard } from '../ui/ReceiptCard';
import { PieChart } from '../ui/PieChart';
import { captureAndShare } from '../../lib/shareUtils';

interface ResultsViewProps {
  stats: Stats;
  classes: ClassData[];
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onReset: () => void;
  cardRef: RefObject<HTMLDivElement>;
}

export function ResultsView({
  stats,
  classes,
  availableYears,
  selectedYear,
  onYearChange,
  onReset,
  cardRef
}: ResultsViewProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!wrapperRef.current) return;
    setIsSharing(true);

    // Enable capture mode to show extra stats and wrapper background
    setIsCapturing(true);

    // Wait for React to re-render with the extra content
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Capture the wrapper which includes padding and background
      await captureAndShare(wrapperRef.current, `MySolidStats${selectedYear}.png`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to share image');
    } finally {
      setIsCapturing(false);
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start animate-fade-in-up">
      {/* LEFT COLUMN: The Visual "Wrapped" Card */}
      <div className="w-full lg:w-[420px] flex-shrink-0 mx-auto lg:mx-0">
        <div className="mb-4 lg:mb-6 flex justify-between items-center">
          <h2 className="text-2xl lg:text-3xl font-black uppercase">Your Card</h2>
          {availableYears.length > 1 && (
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className="font-bold bg-white dark:bg-slate-800 px-3 py-1 border-2 border-black dark:border-primary shadow-brutal-xs"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {/* Wrapper for screenshot capture - includes padding and background */}
        <div
          ref={wrapperRef}
          className={isCapturing ? 'p-6 bg-[#F0F4F8] bg-dot-pattern' : ''}
          style={isCapturing ? { width: '468px' } : undefined}
        >
          {/* This div is the "Image" users would share */}
          <div
            ref={cardRef}
            data-share-card
            className="bg-[#F8FAFC] border-4 border-black overflow-hidden shadow-brutal-xl relative flex flex-col text-black group"
            style={{ width: '420px', height: isCapturing ? '746px' : 'auto' }}
          >
          {/* Header Section */}
          <div className="bg-black p-4 flex justify-between items-end border-b-4 border-black">
            <div>
              <h3 className="text-white text-3xl font-black uppercase tracking-tighter leading-none">
                Solid<span className="text-primary">Stats</span>
              </h3>
            </div>
            <div className="text-right">
              <div className="text-primary font-black text-xl">{stats.year}</div>
              <div className="text-white text-[8px] uppercase font-bold tracking-widest bg-gray-800 px-1">Unofficial</div>
            </div>
          </div>

          {/* Personality Title Badge */}
          <div className="bg-primary-lighter px-4 py-2 border-b-4 border-black flex items-center gap-2">
            <span className="text-2xl">{stats.personalityEmoji}</span>
            <div>
              <div className="font-black text-sm uppercase tracking-tight whitespace-nowrap">{stats.personalityTitle}</div>
              <div className="text-[10px] text-gray-600 whitespace-nowrap">{stats.personalityDescription}</div>
            </div>
          </div>

          {/* MAIN STAT HERO */}
          <div className="p-3 border-b-4 border-black bg-primary-lighter grid grid-cols-2 gap-2">
            <div>
              <div className="text-[8px] font-bold uppercase mb-0.5 tracking-widest text-gray-600">Total Classes</div>
              <div className="text-4xl font-black text-black leading-[0.9] tracking-tight">
                {stats.totalClasses}
              </div>
            </div>
            <div className="border-l-4 border-black pl-3">
              <div className="text-[8px] font-bold uppercase mb-0.5 tracking-widest text-gray-600">Minutes</div>
              <div className="text-xl font-black text-primary-dark">
                {stats.totalMinutes.toLocaleString()}
              </div>
            </div>
            {/* Top Studio & Streak - Only shown during screenshot capture */}
            {isCapturing && (
              <>
                <div className="border-t-2 border-black/20 pt-2">
                  <div className="text-[8px] font-bold uppercase mb-0.5 tracking-widest text-gray-600 flex items-center gap-1">
                    <MapPin size={10}/> Top Studio
                  </div>
                  <div className="text-sm font-black truncate leading-tight">{stats.topLocation}</div>
                </div>
                <div className="border-l-4 border-black pl-3 border-t-2 border-black/20 pt-2">
                  <div className="text-[8px] font-bold uppercase mb-0.5 tracking-widest text-gray-600 flex items-center gap-1">
                    <Flame size={10}/> Streak
                  </div>
                  <div className="text-xl font-black text-red-500">{stats.maxStreak} Days</div>
                </div>
              </>
            )}
          </div>

          {/* INSTRUCTOR LEADERBOARD - Compact */}
          <div className="p-3 border-b-4 border-black bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-black text-white p-0.5"><User size={12} /></div>
              <div className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Top Coaches</div>
            </div>
            <div className="space-y-1.5">
              {stats.sortedInstructors.slice(0, 3).map(([name, count], idx) => (
                <div
                  key={name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`font-black w-5 h-5 flex items-center justify-center text-xs border-2 border-black ${idx === 0 ? 'bg-primary text-white' : 'bg-white'}`}>
                      {idx + 1}
                    </div>
                    <span className="font-bold text-sm uppercase whitespace-nowrap tracking-tight">{name}</span>
                  </div>
                  <div className="text-[9px] font-bold bg-white border-2 border-black px-1.5 py-0.5 whitespace-nowrap">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PIE CHART + CLASS TYPES - Side by side */}
          <div className="grid grid-cols-2 border-b-4 border-black flex-grow">
            {/* TIME OF DAY PIE CHART */}
            <div className="p-3 border-r-4 border-black flex flex-col items-center justify-start bg-white">
              <div className="text-[9px] font-black uppercase tracking-wider mb-2 self-start w-full border-b border-gray-100 pb-1 whitespace-nowrap">
                Time of Day
              </div>
              <div className="scale-100 mb-1">
                <PieChart data={stats.timeData} />
              </div>
              <div className="flex flex-nowrap justify-center gap-x-2">
                {stats.timeData.map(d => (
                  <div key={d.name} className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 border border-black flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[7px] font-bold uppercase whitespace-nowrap">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CLASS TYPES */}
            <div className="p-3 flex flex-col bg-primary-lightest">
              <div className="text-[9px] font-black uppercase tracking-wider mb-2 border-b border-gray-200 pb-1 whitespace-nowrap">
                Format Split
              </div>
              <div className="space-y-1.5 flex-grow overflow-y-auto">
                {Object.entries(stats.typeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([type, count]) => (
                    <div key={type} className="flex flex-col">
                      <div className="flex justify-between text-[8px] font-bold uppercase mb-0.5">
                        <span className="whitespace-nowrap">{type}</span>
                        <span className="whitespace-nowrap ml-1">{Math.round((count / stats.totalClasses) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white border border-black overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(count / stats.totalClasses) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* MONTHLY GRAPH - Only shown in preview, hidden during capture to fit 9:16 */}
          {!isCapturing && (
            <div className="p-3 bg-white h-24 relative">
              <div className="text-[9px] font-black uppercase tracking-wider mb-1">
                Consistency ({stats.year})
              </div>
              <div className="flex items-end justify-between h-[calc(100%-20px)] gap-0.5">
                {stats.monthlyActivity.map((count, i) => {
                  const max = Math.max(...stats.monthlyActivity);
                  const height = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full border border-black min-h-[2px] ${count > 0 ? 'bg-primary' : 'bg-gray-100'}`}
                        style={{ height: `${Math.max(height, 3)}%` }}
                      />
                      <div className="text-[5px] font-bold mt-0.5 text-gray-400">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="p-2 bg-black text-white text-center flex flex-col gap-0.5 border-t-4 border-black mt-auto">
            <div className="text-[9px] font-bold uppercase tracking-widest">solidstats.bigdreams.info</div>
            <div className="text-[7px] text-gray-400 uppercase">
              Fan project. Not affiliated with Solidcore.
            </div>
          </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <BrutalButton
            variant="primary"
            icon={isSharing ? Loader2 : Share2}
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 text-sm w-full"
          >
            {isSharing ? 'Generating...' : 'Share Story'}
          </BrutalButton>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Dashboard / Table */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h2 className="text-3xl lg:text-4xl font-black italic uppercase">The<br/>Receipts</h2>
          <BrutalButton variant="secondary" onClick={onReset} className="text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2">
            Reset
          </BrutalButton>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-8 lg:mb-10">
          <BrutalCard className="bg-primary-light">
            <div className="text-xs lg:text-sm font-bold uppercase opacity-60 mb-1">Top Studio</div>
            <div className="text-xl lg:text-2xl font-black truncate leading-tight">{stats.topLocation}</div>
            <div className="mt-3 text-[10px] lg:text-xs font-bold border-t-2 border-black pt-2 inline-flex items-center gap-1">
              <MapPin size={12}/> Most Visited
            </div>
          </BrutalCard>
          <BrutalCard className="bg-red-300 !border-black">
            <div className="text-xs lg:text-sm font-bold uppercase opacity-60 mb-1">Longest Streak</div>
            <div className="text-2xl lg:text-3xl font-black leading-tight">{stats.maxStreak} Days</div>
            <div className="mt-3 text-[10px] lg:text-xs font-bold border-t-2 border-black pt-2 inline-flex items-center gap-1">
              <Flame size={12}/> Ouch
            </div>
          </BrutalCard>
        </div>

        {/* Raw Data Receipt */}
        <ReceiptCard title="Class Log">
          <div className="overflow-x-auto max-h-[500px] lg:max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b-4 border-dashed border-black dark:border-primary">
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white dark:bg-slate-800">Date</th>
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white dark:bg-slate-800">Item</th>
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white dark:bg-slate-800">Coach</th>
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white dark:bg-slate-800 text-right">Loc</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px] lg:text-xs uppercase">
                {classes.map((row, i) => (
                  <tr key={i} className="border-b border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group">
                    <td className="p-2 lg:p-3 font-bold">{row.date.slice(0, 5)}</td>
                    <td className="p-2 lg:p-3 whitespace-nowrap relative">
                      <span title={row.variant} className="cursor-help border-b border-dotted border-gray-400 dark:border-gray-500">
                        {row.type.replace(/\d+$/, '')}
                      </span>
                      <div className="absolute left-0 top-full mt-1 bg-black dark:bg-primary text-white text-[8px] lg:text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                        {row.variant}
                      </div>
                    </td>
                    <td className="p-2 lg:p-3 truncate max-w-[80px] lg:max-w-[120px]">{row.instructor}</td>
                    <td className="p-2 lg:p-3 truncate max-w-[80px] lg:max-w-[120px] text-right">{row.location}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-4 border-dashed border-black dark:border-primary">
                <tr>
                  <td colSpan={4} className="p-3 lg:p-4 text-center text-[10px] lg:text-sm font-bold">
                    TOTAL ITEMS: {stats.totalClasses}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ReceiptCard>
      </div>
    </div>
  );
}
