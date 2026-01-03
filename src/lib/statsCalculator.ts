import { ClassData, Stats, TimeOfDayData } from '../types';
import { determinePersonality } from './personalityTitles';

// Get duration in minutes based on class type
function getClassDuration(type: string): number {
  if (type.includes('30')) return 30;
  if (type.includes('65')) return 65;
  return 50; // Default for Signature50, Focus50, Foundation50, Starter50, Advanced50
}

export function calculateStats(classes: ClassData[], year: number): Stats {
  const totalClasses = classes.length;
  const totalMinutes = classes.reduce((sum, c) => sum + getClassDuration(c.type), 0);

  // Top instructors
  const instructorCounts = classes.reduce((acc, curr) => {
    acc[curr.instructor] = (acc[curr.instructor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedInstructors = Object.entries(instructorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) as [string, number][];

  // Top location
  const locationCounts = classes.reduce((acc, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocation = Object.keys(locationCounts).reduce(
    (a, b) => (locationCounts[a] > locationCounts[b] ? a : b),
    Object.keys(locationCounts)[0] || 'Unknown'
  );

  // Monthly activity
  const monthlyActivity = new Array(12).fill(0);
  classes.forEach(d => {
    const month = d.rawDate.getMonth();
    monthlyActivity[month]++;
  });

  // Time of day
  let morning = 0;
  let afternoon = 0;
  let evening = 0;

  classes.forEach(d => {
    const hour = getHour(d.time);
    if (hour < 12) morning++;
    else if (hour < 17) afternoon++;
    else evening++;
  });

  const allTimeData: TimeOfDayData[] = [
    { name: 'Morning', value: morning, color: '#3B82F6', percent: morning / totalClasses },
    { name: 'Afternoon', value: afternoon, color: '#93C5FD', percent: afternoon / totalClasses },
    { name: 'Evening', value: evening, color: '#1E40AF', percent: evening / totalClasses }
  ];
  const timeData = allTimeData.filter(d => d.value > 0);

  // Class type counts
  const typeCounts = classes.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Longest streak
  const maxStreak = calculateStreak(classes);

  // Personality title
  const personality = determinePersonality({
    totalClasses,
    maxStreak,
    timeData,
    typeCounts,
    sortedInstructors,
    monthlyActivity,
    classes
  });

  return {
    totalClasses,
    totalMinutes,
    sortedInstructors,
    topLocation,
    monthlyActivity,
    timeData,
    typeCounts,
    maxStreak,
    personalityTitle: personality.title,
    personalityDescription: personality.description,
    personalityEmoji: personality.emoji,
    year
  };
}

function getHour(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})(am|pm)/i);
  if (!match) return 12;

  let hours = parseInt(match[1], 10);
  const modifier = match[3].toLowerCase();

  if (hours === 12) {
    hours = modifier === 'am' ? 0 : 12;
  } else if (modifier === 'pm') {
    hours += 12;
  }

  return hours;
}

function calculateStreak(classes: ClassData[]): number {
  if (classes.length === 0) return 0;

  // Sort by date ascending
  const sortedDates = classes
    .map(d => d.rawDate)
    .sort((a, b) => a.getTime() - b.getTime());

  // Remove duplicates (same day)
  const uniqueDates: Date[] = [];
  for (const date of sortedDates) {
    const dateStr = date.toDateString();
    if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1].toDateString() !== dateStr) {
      uniqueDates.push(date);
    }
  }

  if (uniqueDates.length <= 1) return uniqueDates.length;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const diffTime = uniqueDates[i].getTime() - uniqueDates[i - 1].getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
    // If diffDays === 0, same day, don't increment
  }

  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
}
