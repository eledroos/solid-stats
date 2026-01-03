import * as pdfjsLib from 'pdfjs-dist';
import { ClassData, ClassType, ParseResult } from '../types';

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  const totalPages = pdf.numPages;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';

    if (onProgress) {
      onProgress(i / totalPages);
    }
  }

  const classes = extractClasses(fullText);
  const availableYears = [...new Set(classes.map(c => c.rawDate.getFullYear()))].sort((a, b) => b - a);

  return { classes, availableYears };
}

function extractClasses(text: string): ClassData[] {
  const classes: ClassData[] = [];

  // Normalize special characters
  const normalizedText = text
    .replace(/∶/g, ':')  // Replace special colon
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Also need to extract dates and class types from surrounding context
  // The PDF format has dates like "Friday January, 2026" or just date numbers

  // Build a more comprehensive approach:
  // 1. Find all class type mentions with their positions
  // 2. Find all location/instructor/time patterns with their positions
  // 3. Find all date mentions with their positions
  // 4. Match them together based on proximity

  const classTypes = findClassTypes(normalizedText);
  const locationMatches = findLocationInstructorTime(normalizedText);
  const dateMatches = findDates(normalizedText);

  // For each location match, find the nearest class type and date
  for (const loc of locationMatches) {
    const nearestType = findNearest(classTypes, loc.index);
    const nearestDate = findNearestDate(dateMatches, loc.index);

    if (nearestDate) {
      const classData: ClassData = {
        date: formatDate(nearestDate.date),
        time: normalizeTime(loc.time),
        type: nearestType?.type || 'Signature50',
        instructor: normalizeInstructorName(loc.instructor),
        location: normalizeLocation(loc.location),
        rawDate: nearestDate.date,
      };

      // Avoid duplicates
      const isDuplicate = classes.some(
        c => c.date === classData.date && c.time === classData.time && c.instructor === classData.instructor
      );

      if (!isDuplicate && !isClassCancelled(normalizedText, loc.index)) {
        classes.push(classData);
      }
    }
  }

  // Sort by date (most recent first)
  classes.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  return classes;
}

interface ClassTypeMatch {
  type: ClassType;
  index: number;
}

function findClassTypes(text: string): ClassTypeMatch[] {
  const matches: ClassTypeMatch[] = [];
  const pattern = /(Signature50|Focus50|Foundation50|Starter50)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const typeStr = match[1].toLowerCase();
    let type: ClassType = 'Signature50';
    if (typeStr.includes('focus')) type = 'Focus50';
    else if (typeStr.includes('foundation')) type = 'Foundation50';
    else if (typeStr.includes('starter')) type = 'Starter50';

    matches.push({ type, index: match.index });
  }

  return matches;
}

interface LocationMatch {
  location: string;
  instructor: string;
  time: string;
  duration: number;
  index: number;
}

function findLocationInstructorTime(text: string): LocationMatch[] {
  const matches: LocationMatch[] = [];

  // Pattern: "STATE, Location w/ Instructor Name TIME (DURATION min)"
  const pattern = /([A-Z]{2},\s*[^w]+?)\s*w\/\s*([A-Za-z][A-Za-z\s\-'.]+?)(?:\s*-\s*[^0-9]+?)?\s*(\d{1,2}:\d{2}(?:am|pm))\s*\((\d+)\s*min\)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      location: match[1].trim(),
      instructor: match[2].trim(),
      time: match[3],
      duration: parseInt(match[4], 10),
      index: match.index,
    });
  }

  return matches;
}

interface DateMatch {
  date: Date;
  index: number;
}

function findDates(text: string): DateMatch[] {
  const matches: DateMatch[] = [];
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december'];

  // Pattern for "Day, Month DD, YYYY" or variations
  // Also handles "DD Month, YYYY" format from the PDF
  const pattern = /(\d{1,2})?\s*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(January|February|March|April|May|June|July|August|September|October|November|December)[,\s]*(\d{1,2})?[,\s]*(\d{4})/gi;

  let match;

  while ((match = pattern.exec(text)) !== null) {
    const day = parseInt(match[1] || match[3] || '1', 10);
    const monthStr = match[2].toLowerCase();
    const month = months.indexOf(monthStr);
    const year = parseInt(match[4], 10);

    if (month !== -1 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        matches.push({ date, index: match.index });
      }
    }
  }

  return matches;
}

function findNearest<T extends { index: number }>(items: T[], targetIndex: number): T | null {
  if (items.length === 0) return null;

  let nearest = items[0];
  let minDistance = Math.abs(items[0].index - targetIndex);

  for (const item of items) {
    // Prefer items that come before the target
    const distance = item.index < targetIndex
      ? targetIndex - item.index
      : (item.index - targetIndex) * 2; // Penalize items after target

    if (distance < minDistance) {
      minDistance = distance;
      nearest = item;
    }
  }

  // Only return if reasonably close (within 500 chars)
  return minDistance < 500 ? nearest : null;
}

function findNearestDate(dates: DateMatch[], targetIndex: number): DateMatch | null {
  if (dates.length === 0) return null;

  // Find the most recent date that appears before the target index
  let nearest: DateMatch | null = null;
  let minDistance = Infinity;

  for (const date of dates) {
    if (date.index < targetIndex) {
      const distance = targetIndex - date.index;
      if (distance < minDistance) {
        minDistance = distance;
        nearest = date;
      }
    }
  }

  // If no date found before, take the nearest one after
  if (!nearest) {
    for (const date of dates) {
      const distance = Math.abs(date.index - targetIndex);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = date;
      }
    }
  }

  return nearest;
}

function isClassCancelled(text: string, index: number): boolean {
  // Check for "CANCELLED" or "Late Cancel" near this index
  const searchStart = Math.max(0, index - 100);
  const searchEnd = Math.min(text.length, index + 100);
  const nearby = text.slice(searchStart, searchEnd).toLowerCase();

  return nearby.includes('cancelled') || nearby.includes('late cancel');
}

function normalizeInstructorName(name: string): string {
  // Remove titles like "- Senior Master", "- Pro Coach", etc.
  let normalized = name
    .replace(/\s*-\s*(Senior Master|Master|Pro Coach|Head Coach|Coach|Instructor).*$/i, '')
    .trim();

  // Abbreviate last name to initial (e.g., "Nikki Gagliano" -> "Nikki G.")
  const parts = normalized.split(/\s+/);
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  }

  return normalized;
}

function normalizeLocation(location: string): string {
  // Remove state prefix ("MA, " or "NY, ")
  return location.replace(/^[A-Z]{2},\s*/, '').trim();
}

function normalizeTime(time: string): string {
  // Ensure consistent format
  return time.toLowerCase().replace(/\s/g, '');
}

function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
