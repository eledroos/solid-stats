export type ClassType = 'Signature50' | 'Focus50' | 'Foundation50' | 'Starter50';

export interface ClassData {
  date: string;           // MM/DD/YYYY
  time: string;           // e.g., "4:30pm"
  type: ClassType;
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
