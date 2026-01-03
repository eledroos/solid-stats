import { ClassData, TimeOfDayData } from '../types';

interface PersonalityInput {
  totalClasses: number;
  maxStreak: number;
  timeData: TimeOfDayData[];
  typeCounts: Record<string, number>;
  sortedInstructors: [string, number][];
  monthlyActivity: number[];
  classes: ClassData[];
}

interface PersonalityResult {
  title: string;
  description: string;
  emoji: string;
}

export function determinePersonality(input: PersonalityInput): PersonalityResult {
  const {
    totalClasses,
    maxStreak,
    timeData,
    typeCounts,
    sortedInstructors,
    monthlyActivity,
    classes
  } = input;

  // Calculate additional metrics
  const morningPercent = timeData.find(t => t.name === 'Morning')?.percent || 0;
  const eveningPercent = timeData.find(t => t.name === 'Evening')?.percent || 0;
  const uniqueInstructors = sortedInstructors.length;
  const consistencyScore = monthlyActivity.filter(m => m > 0).length;
  const topInstructorPercent = totalClasses > 0 ? (sortedInstructors[0]?.[1] || 0) / totalClasses : 0;
  const maxMonthClasses = Math.max(...monthlyActivity);

  // Calculate weekend percentage
  const weekendClasses = classes.filter(c => {
    const day = c.rawDate.getDay();
    return day === 0 || day === 6;
  }).length;
  const weekendPercent = totalClasses > 0 ? weekendClasses / totalClasses : 0;

  // Format count
  const formatCount = Object.keys(typeCounts).length;

  // Title determination logic (priority order)

  // 1. THE CENTURION - 100+ classes
  if (totalClasses >= 100) {
    return {
      title: "The Centurion",
      description: "100+ classes! You're basically a [solidcore] board member.",
      emoji: "👑"
    };
  }

  // 2. STREAK MONSTER - 7+ day streak
  if (maxStreak >= 7) {
    return {
      title: "Streak Monster",
      description: `${maxStreak} days straight! Your muscles don't know rest days exist.`,
      emoji: "🔥"
    };
  }

  // 3. MARATHON MONTH - 20+ classes in single month
  if (maxMonthClasses >= 20) {
    return {
      title: "Marathon Month",
      description: `${maxMonthClasses} classes in one month? Beast mode activated.`,
      emoji: "🏃"
    };
  }

  // 4. DAWN PATROL - 70%+ morning classes
  if (morningPercent >= 0.7) {
    return {
      title: "Dawn Patrol",
      description: "Up before the sun to shake. Coffee who?",
      emoji: "🌅"
    };
  }

  // 5. NIGHT OWL - 60%+ evening classes
  if (eveningPercent >= 0.6) {
    return {
      title: "Night Owl",
      description: "Evening shakes hit different. Post-work therapy.",
      emoji: "🦉"
    };
  }

  // 6. LOYALIST - 50%+ with one instructor
  if (topInstructorPercent >= 0.5 && sortedInstructors.length > 0) {
    return {
      title: "The Loyalist",
      description: `You and ${sortedInstructors[0][0]} are basically besties.`,
      emoji: "🤝"
    };
  }

  // 7. VARIETY SEEKER - 8+ unique instructors
  if (uniqueInstructors >= 8) {
    return {
      title: "Variety Seeker",
      description: "Why pick a favorite when they're all amazing?",
      emoji: "🎰"
    };
  }

  // 8. YEAR-ROUND WARRIOR - Active 10+ months
  if (consistencyScore >= 10) {
    return {
      title: "Year-Round Warrior",
      description: "Seasonal? Not you. You showed up all year.",
      emoji: "⚔️"
    };
  }

  // 9. FORMAT EXPLORER - Used 3+ class types
  if (formatCount >= 3) {
    return {
      title: "Format Explorer",
      description: "Signature, Focus, Foundation... you've tried them all!",
      emoji: "🧭"
    };
  }

  // 10. WEEKEND WARRIOR - 60%+ on Sat/Sun
  if (weekendPercent >= 0.6) {
    return {
      title: "Weekend Warrior",
      description: "Saturdays are for shaking, not sleeping in.",
      emoji: "📅"
    };
  }

  // 11. RISING STAR - 20-49 classes (newcomer)
  if (totalClasses >= 20 && totalClasses < 50) {
    return {
      title: "Rising Star",
      description: "Just getting started but already addicted!",
      emoji: "⭐"
    };
  }

  // 12. DEDICATED - 50-99 classes
  if (totalClasses >= 50) {
    return {
      title: "Dedicated",
      description: "50+ classes shows serious commitment!",
      emoji: "💎"
    };
  }

  // DEFAULT - SHAKE ENTHUSIAST
  return {
    title: "Shake Enthusiast",
    description: "You showed up, you shook, you conquered.",
    emoji: "💪"
  };
}
