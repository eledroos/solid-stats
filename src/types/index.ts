export type ClassType =
  | 'Starter50'
  | 'Foundation50'
  | 'Signature50'
  | 'Focus50'
  | 'Power30'
  | 'Advanced50'
  | 'Advanced65';

export interface ClassData {
  date: string;           // MM/DD/YYYY
  time: string;           // e.g., "4:30pm"
  type: ClassType;        // Base type (e.g., "Signature50")
  variant: string;        // Specific variant (e.g., "Full Body", "Core + Obliques + Lower Body")
  instructor: string;     // Normalized (e.g., "Nikki G.")
  location: string;       // Without state prefix
  rawDate: Date;          // For calculations
}

export interface TimeOfDayData {
  name: 'Morning' | 'Afternoon' | 'Evening';
  value: number;
  color: string;
  percent: number;
}

export interface Stats {
  totalClasses: number;
  totalMinutes: number;
  sortedInstructors: [string, number][];
  topLocation: string;
  monthlyActivity: number[];
  timeData: TimeOfDayData[];
  typeCounts: Record<string, number>;
  maxStreak: number;
  personalityTitle: string;
  personalityDescription: string;
  personalityEmoji: string;
  year: number;
}

export type AppView = 'landing' | 'processing' | 'results' | 'error';

export interface ParseResult {
  classes: ClassData[];
  availableYears: number[];
}

// Muscle group types
export type LowerMuscle = 'Inner thighs' | 'Center glutes' | 'Outer glutes' | 'Hamstrings' | 'Leg wrap';
export type UpperMuscle = 'Biceps' | 'Back' | 'Triceps' | 'Shoulders' | 'Chest' | 'Arm wrap';

export interface MonthlyMuscleStats {
  month: number; // 0-11
  lowerBodyCounts: Record<LowerMuscle, number>;
  upperBodyCounts: Record<UpperMuscle, number>;
  pushCount: number;
  pullCount: number;
  classCount: number;
}

export interface MuscleGroupStats {
  lowerBodyCounts: Record<LowerMuscle, number>;
  upperBodyCounts: Record<UpperMuscle, number>;
  pushCount: number;
  pullCount: number;
  topLower: LowerMuscle;
  topUpper: UpperMuscle;
  neglectedLower: LowerMuscle;
  neglectedUpper: UpperMuscle;
  classesWithData: number;
  monthlyStats: MonthlyMuscleStats[];
}
