import { RefObject, useState } from 'react';
import { MuscleGroupStats, LowerMuscle, UpperMuscle } from '../../types';
import { RadarChart } from '../ui/RadarChart';
import { MUSCLE_COLORS, LOWER_MUSCLES, UPPER_MUSCLES } from '../../data/muscleGroupCalendar';

interface MuscleGroupsCardProps {
  stats: MuscleGroupStats;
  year: number;
  cardRef: RefObject<HTMLDivElement>;
  isCapturing?: boolean;
}

type MuscleView = 'lower' | 'upper';

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MuscleGroupsCard({ stats, year, cardRef, isCapturing }: MuscleGroupsCardProps) {
  const [muscleView, setMuscleView] = useState<MuscleView>('lower');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null = full year

  // Get current stats based on selected month
  const monthStats = selectedMonth !== null
    ? stats.monthlyStats.find(m => m.month === selectedMonth)
    : null;

  // Get counts for current period
  const currentLowerCounts = monthStats?.lowerBodyCounts ?? stats.lowerBodyCounts;
  const currentUpperCounts = monthStats?.upperBodyCounts ?? stats.upperBodyCounts;
  const currentPushCount = monthStats?.pushCount ?? stats.pushCount;
  const currentClassCount = monthStats?.classCount ?? stats.classesWithData;

  const pushPercent = currentClassCount > 0
    ? Math.round((currentPushCount / currentClassCount) * 100)
    : 50;
  const pullPercent = 100 - pushPercent;

  // Get data for current view
  const radarData = muscleView === 'lower'
    ? Object.fromEntries(LOWER_MUSCLES.map(m => [m, currentLowerCounts[m]]))
    : Object.fromEntries(UPPER_MUSCLES.map(m => [m, currentUpperCounts[m]]));

  // Find top and neglected for current period
  const findTop = <T extends string>(counts: Record<T, number>, muscles: readonly T[]): T => {
    let top = muscles[0];
    for (const m of muscles) {
      if (counts[m] > counts[top]) top = m;
    }
    return top;
  };

  const findNeglected = <T extends string>(counts: Record<T, number>, muscles: readonly T[]): T => {
    let neglected = muscles[0];
    for (const m of muscles) {
      if (counts[m] < counts[neglected]) neglected = m;
    }
    return neglected;
  };

  const topMuscle = muscleView === 'lower'
    ? findTop(currentLowerCounts, LOWER_MUSCLES as unknown as LowerMuscle[])
    : findTop(currentUpperCounts, UPPER_MUSCLES as unknown as UpperMuscle[]);
  const neglectedMuscle = muscleView === 'lower'
    ? findNeglected(currentLowerCounts, LOWER_MUSCLES as unknown as LowerMuscle[])
    : findNeglected(currentUpperCounts, UPPER_MUSCLES as unknown as UpperMuscle[]);

  // Get color for a muscle
  const getColor = (muscle: string) => MUSCLE_COLORS[muscle as keyof typeof MUSCLE_COLORS] || '#94a3b8';

  // Header display
  const periodDisplay = selectedMonth !== null
    ? `${MONTH_NAMES[selectedMonth]} ${year}`
    : String(year);

  return (
    <div
      ref={cardRef}
      data-share-card
      className="bg-[#F8FAFC] border-4 border-black overflow-hidden shadow-brutal-xl relative flex flex-col text-black"
      style={{ width: '420px' }}
    >
      {/* Header Section - identical to Stats card */}
      <div className="bg-black p-4 flex justify-between items-end border-b-4 border-black">
        <div>
          <h3 className="text-white text-3xl font-black uppercase tracking-tighter leading-none">
            Solid<span className="text-primary">Stats</span>
          </h3>
        </div>
        <div className="text-right">
          <div className="text-primary font-black text-xl">{periodDisplay}</div>
          <div className="text-white text-[8px] uppercase font-bold tracking-widest bg-gray-800 px-1">Muscle Focus</div>
        </div>
      </div>

      {/* Month Selector Strip */}
      <div className="flex justify-center gap-0.5 px-2 py-2 bg-gray-50 border-b-4 border-black overflow-x-auto">
        <button
          onClick={() => setSelectedMonth(null)}
          className={`px-1.5 py-1 text-[7px] font-black uppercase border-2 border-black flex-shrink-0 transition-colors ${
            selectedMonth === null
              ? 'bg-black text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Year
        </button>
        {MONTH_LABELS.map((label, i) => {
          const hasData = stats.monthlyStats.some(m => m.month === i);
          return (
            <button
              key={i}
              onClick={() => hasData && setSelectedMonth(i)}
              disabled={!hasData}
              className={`w-6 h-6 text-[8px] font-black border-2 border-black flex-shrink-0 transition-colors ${
                selectedMonth === i
                  ? 'bg-black text-white'
                  : hasData
                    ? 'bg-white text-gray-600 hover:bg-gray-100'
                    : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="p-3 border-b-4 border-black bg-primary-lighter flex justify-center gap-2">
        <button
          onClick={() => setMuscleView('lower')}
          className={`px-4 py-1.5 text-[10px] font-black uppercase border-2 border-black transition-colors ${
            muscleView === 'lower'
              ? 'bg-black text-white'
              : 'bg-white text-gray-400 hover:bg-gray-50'
          }`}
        >
          Lower Body
        </button>
        <button
          onClick={() => setMuscleView('upper')}
          className={`px-4 py-1.5 text-[10px] font-black uppercase border-2 border-black transition-colors ${
            muscleView === 'upper'
              ? 'bg-black text-white'
              : 'bg-white text-gray-400 hover:bg-gray-50'
          }`}
        >
          Upper Body
        </button>
      </div>

      {/* Radar Chart */}
      <div className="p-4 border-b-4 border-black bg-white flex justify-center items-center min-h-[220px]">
        <RadarChart
          data={radarData}
          colors={MUSCLE_COLORS}
          size={200}
        />
      </div>

      {/* Top/Neglected Callout */}
      <div className="p-3 border-b-4 border-black bg-primary-lighter grid grid-cols-2 gap-2">
        <div>
          <div className="text-[8px] font-bold uppercase mb-0.5 tracking-widest text-gray-600">
            Top Focus
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 border border-black"
              style={{ backgroundColor: getColor(topMuscle) }}
            />
            <span className="text-lg font-black leading-tight">{topMuscle}</span>
          </div>
        </div>
        <div className="border-l-4 border-black pl-3">
          <div className="text-[8px] font-bold uppercase mb-0.5 tracking-widest text-gray-600">
            Needs Love
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 border border-black"
              style={{ backgroundColor: getColor(neglectedMuscle) }}
            />
            <span className="text-lg font-black leading-tight">{neglectedMuscle}</span>
          </div>
        </div>
      </div>

      {/* Push/Pull Balance */}
      <div className="p-3 bg-white">
        <div className="text-[9px] font-black uppercase tracking-wider mb-2">Push / Pull Balance</div>
        <div className="w-full h-5 border-2 border-black flex overflow-hidden">
          <div
            className="h-full bg-primary flex items-center justify-center"
            style={{ width: `${pushPercent}%` }}
          >
            {pushPercent > 15 && (
              <span className="text-[8px] font-black text-white">{pushPercent}%</span>
            )}
          </div>
          <div
            className="h-full bg-primary-light flex items-center justify-center"
            style={{ width: `${pullPercent}%` }}
          >
            {pullPercent > 15 && (
              <span className="text-[8px] font-black text-black">{pullPercent}%</span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-[8px] font-bold mt-1 text-gray-600">
          <span>Push (Chest, Shoulders, Triceps)</span>
          <span>Pull (Back, Biceps)</span>
        </div>
      </div>

      {/* Classes count - only during capture */}
      {isCapturing && (
        <div className="px-3 pb-3 bg-white border-t-2 border-gray-100">
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-600 mb-1">
            Classes Tracked
          </div>
          <div className="text-xl font-black">{currentClassCount}</div>
        </div>
      )}

      {/* Footer - identical to Stats card */}
      <div className="p-2 bg-black text-white text-center flex flex-col gap-0.5 border-t-4 border-black">
        <div className="text-[9px] font-bold uppercase tracking-widest">solidstats.bigdreams.info</div>
        <div className="text-[7px] text-gray-400 uppercase">
          Fan project. Not affiliated with Solidcore.
        </div>
      </div>
    </div>
  );
}
