import { RefObject, useState } from 'react';
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

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      await captureAndShare(cardRef.current, `MySolidStats${selectedYear}.png`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to share image');
    } finally {
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
              className="font-bold bg-white px-3 py-1 border-2 border-black shadow-brutal-xs"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {/* This div is the "Image" users would share */}
        <div
          ref={cardRef}
          data-share-card
          className="bg-[#F8FAFC] border-4 border-black overflow-hidden shadow-brutal-xl relative flex flex-col text-black group"
          style={{ width: '420px', minHeight: '746px' }}
        >
          {/* Header Section */}
          <div className="bg-black p-5 flex justify-between items-end border-b-4 border-black">
            <div>
              <h3 className="text-white text-4xl font-black uppercase tracking-tighter leading-none">
                Solid<br/><span className="text-primary">Stats</span>
              </h3>
            </div>
            <div className="text-right">
              <div className="text-primary font-black text-2xl">{stats.year}</div>
              <div className="text-white text-[10px] uppercase font-bold tracking-widest bg-gray-800 px-1">Unofficial</div>
            </div>
          </div>

          {/* Personality Title Badge */}
          <div className="bg-primary-lighter px-5 py-3 border-b-4 border-black flex items-center gap-3">
            <span className="text-3xl">{stats.personalityEmoji}</span>
            <div>
              <div className="font-black text-lg uppercase tracking-tight">{stats.personalityTitle}</div>
              <div className="text-xs text-gray-600">{stats.personalityDescription}</div>
            </div>
          </div>

          {/* MAIN STAT HERO */}
          <div className="p-5 border-b-4 border-black bg-primary-lighter grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <div className="text-[10px] font-bold uppercase mb-1 tracking-widest text-gray-600">Total Classes</div>
              <div className="text-6xl font-black text-black leading-[0.8] tracking-tight animate-scale-in origin-left">
                {stats.totalClasses}
              </div>
            </div>
            <div className="col-span-1 border-l-4 border-black pl-4 flex flex-col justify-center">
              <div className="text-[10px] font-bold uppercase mb-1 tracking-widest text-gray-600">Minutes Shaking</div>
              <div className="text-2xl font-black text-primary-dark">
                {stats.totalMinutes.toLocaleString()}
              </div>
            </div>
          </div>

          {/* INSTRUCTOR LEADERBOARD */}
          <div className="p-5 border-b-4 border-black">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-black text-white p-1"><User size={14} /></div>
              <div className="text-xs font-black uppercase tracking-wider">Top Coaches</div>
            </div>
            <div className="space-y-3">
              {stats.sortedInstructors.map(([name, count], idx) => (
                <div
                  key={name}
                  className="flex items-center justify-between animate-slide-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`font-black w-6 h-6 flex items-center justify-center text-sm border-2 border-black shadow-brutal-xs ${idx === 0 ? 'bg-primary text-white' : 'bg-white'}`}>
                      {idx + 1}
                    </div>
                    <span className="font-bold text-lg uppercase truncate max-w-[140px] tracking-tight">{name}</span>
                  </div>
                  <div className="text-[10px] font-bold bg-white border-2 border-black px-2 py-0.5 shadow-brutal-xs">
                    {count} Classes
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PIE CHART SECTION */}
          <div className="grid grid-cols-2 border-b-4 border-black flex-grow">
            {/* TIME OF DAY PIE CHART */}
            <div className="p-4 border-r-4 border-black flex flex-col items-center justify-center bg-white">
              <div className="text-[10px] font-black uppercase tracking-wider mb-3 self-start w-full border-b-2 border-gray-100 pb-1">
                Time of Day
              </div>
              <div className="scale-110 mb-2 animate-spin-enter">
                <PieChart data={stats.timeData} />
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                {stats.timeData.map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 border border-black" style={{ backgroundColor: d.color }} />
                    <span className="text-[8px] font-bold uppercase">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CLASS TYPES */}
            <div className="p-4 flex flex-col bg-primary-lightest">
              <div className="text-[10px] font-black uppercase tracking-wider mb-3 border-b-2 border-gray-200 pb-1">
                Format Split
              </div>
              <div className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                {Object.entries(stats.typeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count], idx) => (
                    <div
                      key={type}
                      className="flex flex-col animate-fade-in-up"
                      style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                    >
                      <div className="flex justify-between text-[9px] font-bold uppercase mb-0.5">
                        <span>{type}</span>
                        <span>{Math.round((count / stats.totalClasses) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
                        <div
                          className="h-full bg-primary animate-fill-bar"
                          style={{ width: `${(count / stats.totalClasses) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* MONTHLY GRAPH */}
          <div className="p-5 bg-white h-32 relative">
            <div className="text-[10px] font-black uppercase tracking-wider mb-2 absolute top-3 left-5">
              Consistency ({stats.year})
            </div>
            <div className="flex items-end justify-between h-full pt-6 gap-1">
              {stats.monthlyActivity.map((count, i) => {
                const max = Math.max(...stats.monthlyActivity);
                const height = max > 0 ? (count / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    {count > 0 && (
                      <div
                        className="text-[6px] font-black mb-0.5 animate-fade-in-up"
                        style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                      >
                        {count}
                      </div>
                    )}
                    <div
                      className={`w-full border-2 border-black min-h-[2px] transition-all hover:bg-black ${count > 0 ? 'bg-primary' : 'bg-gray-100'}`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <div className="text-[6px] font-bold mt-1 text-gray-400">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-3 bg-black text-white text-center flex flex-col gap-1 border-t-4 border-black mt-auto">
            <div className="text-[10px] font-bold uppercase tracking-widest">SolidStats.app</div>
            <div className="text-[8px] text-gray-400 uppercase leading-tight px-4">
              Fan project. Not affiliated with Solidcore.
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
        <ReceiptCard title="Transaction History">
          <div className="overflow-x-auto max-h-[500px] lg:max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b-4 border-dashed border-black">
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white">Date</th>
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white">Item</th>
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white">Coach</th>
                  <th className="p-2 lg:p-3 font-black uppercase text-[10px] lg:text-xs bg-white text-right">Loc</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px] lg:text-xs uppercase">
                {classes.map((row, i) => (
                  <tr key={i} className="border-b border-dashed border-gray-300 hover:bg-gray-50 transition-colors group">
                    <td className="p-2 lg:p-3 font-bold">{row.date.slice(0, 5)}</td>
                    <td className="p-2 lg:p-3 whitespace-nowrap relative">
                      <span title={row.variant} className="cursor-help border-b border-dotted border-gray-400">
                        {row.type.replace(/\d+$/, '')}
                      </span>
                      <div className="absolute left-0 top-full mt-1 bg-black text-white text-[8px] lg:text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                        {row.variant}
                      </div>
                    </td>
                    <td className="p-2 lg:p-3 truncate max-w-[80px] lg:max-w-[120px]">{row.instructor}</td>
                    <td className="p-2 lg:p-3 truncate max-w-[80px] lg:max-w-[120px] text-right">{row.location}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-4 border-dashed border-black">
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
