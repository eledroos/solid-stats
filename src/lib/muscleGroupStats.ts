import { ClassData, MuscleGroupStats, LowerMuscle, UpperMuscle } from '../types';
import { getMuscleGroupsFromString, LOWER_MUSCLES, UPPER_MUSCLES } from '../data/muscleGroupCalendar';

/**
 * Calculate muscle group statistics from a list of classes
 * Maps each class date to the Solidcore muscle group calendar
 */
export function calculateMuscleGroupStats(classes: ClassData[]): MuscleGroupStats {
  // Initialize counts
  const lowerBodyCounts: Record<LowerMuscle, number> = {
    'Inner thighs': 0,
    'Center glutes': 0,
    'Outer glutes': 0,
    'Hamstrings': 0,
    'Leg wrap': 0,
  };

  const upperBodyCounts: Record<UpperMuscle, number> = {
    'Biceps': 0,
    'Back': 0,
    'Triceps': 0,
    'Shoulders': 0,
    'Chest': 0,
    'Arm wrap': 0,
  };

  let pushCount = 0;
  let pullCount = 0;
  let classesWithData = 0;

  // Process each class
  for (const classData of classes) {
    const muscleData = getMuscleGroupsFromString(classData.date);

    if (muscleData) {
      classesWithData++;
      lowerBodyCounts[muscleData.lower]++;
      upperBodyCounts[muscleData.upper]++;

      if (muscleData.monthlyUpperFocus === 'Push muscles') {
        pushCount++;
      } else {
        pullCount++;
      }
    }
  }

  // Find top and neglected muscles
  const topLower = findTopMuscle(lowerBodyCounts, LOWER_MUSCLES);
  const topUpper = findTopMuscle(upperBodyCounts, UPPER_MUSCLES);
  const neglectedLower = findNeglectedMuscle(lowerBodyCounts, LOWER_MUSCLES);
  const neglectedUpper = findNeglectedMuscle(upperBodyCounts, UPPER_MUSCLES);

  return {
    lowerBodyCounts,
    upperBodyCounts,
    pushCount,
    pullCount,
    topLower,
    topUpper,
    neglectedLower,
    neglectedUpper,
    classesWithData,
  };
}

function findTopMuscle<T extends string>(counts: Record<T, number>, muscles: readonly T[]): T {
  let top = muscles[0];
  let maxCount = counts[top];

  for (const muscle of muscles) {
    if (counts[muscle] > maxCount) {
      maxCount = counts[muscle];
      top = muscle;
    }
  }

  return top;
}

function findNeglectedMuscle<T extends string>(counts: Record<T, number>, muscles: readonly T[]): T {
  let neglected = muscles[0];
  let minCount = counts[neglected];

  for (const muscle of muscles) {
    if (counts[muscle] < minCount) {
      minCount = counts[muscle];
      neglected = muscle;
    }
  }

  return neglected;
}
