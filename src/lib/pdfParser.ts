import * as pdfjsLib from 'pdfjs-dist';
import { ClassData, ClassType, ParseResult } from '../types';

// Set worker path for pdfjs - use local copy for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function parsePDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParseResult> {
  console.log('[SolidStats] Starting PDF parse...');
  console.log('[SolidStats] File:', file.name, '| Size:', (file.size / 1024).toFixed(1), 'KB');

  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('[SolidStats] File loaded into memory');

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('[SolidStats] PDF parsed | Pages:', pdf.numPages);

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

    console.log('[SolidStats] Text extracted | Length:', fullText.length, 'chars');

    // Detect PDFs with no extractable text
    // This happens when "Microsoft: Print To PDF" or similar tools render text as graphics
    if (fullText.trim().length < 100 && totalPages > 1) {
      console.error('[SolidStats] Error: PDF has no extractable text');
      console.error('[SolidStats] This PDF was likely created using "Microsoft: Print To PDF"');
      console.error('[SolidStats] which renders text as images instead of text.');
      throw new Error(
        'This PDF has no extractable text. It was likely created using "Microsoft: Print To PDF" which renders text as images.\n\n' +
        'To fix this, please re-export your schedule:\n' +
        '1. Open your Mindbody schedule page in Chrome, Firefox, or Safari\n' +
        '2. Press Ctrl+P (or Cmd+P on Mac) to print\n' +
        '3. Select "Save as PDF" or "Print to PDF" as the destination\n' +
        '4. Save and upload the new PDF\n\n' +
        'Note: Avoid using Windows "Print To PDF" - use your browser\'s built-in PDF option instead.'
      );
    }

    // Detect image-based PDFs (text length too short relative to page count)
    // A typical Mindbody PDF has ~200-400 chars per class entry, ~5 classes per page
    const expectedMinChars = totalPages * 500; // Conservative estimate
    if (fullText.length < expectedMinChars && totalPages > 3) {
      console.warn('[SolidStats] Warning: PDF appears to be image-based (low text content)');
      console.warn('[SolidStats] Text length:', fullText.length, 'chars for', totalPages, 'pages');
      console.warn('[SolidStats] Tip: Re-export your schedule from Mindbody using "Print to PDF" or "Save as PDF" instead of taking screenshots');
    }

    const classes = extractClasses(fullText);
    const availableYears = [...new Set(classes.map(c => c.rawDate.getFullYear()))].sort((a, b) => b - a);

    console.log('[SolidStats] Parsing complete!');
    console.log('[SolidStats] Classes found:', classes.length);
    console.log('[SolidStats] Years available:', availableYears.join(', '));

    if (classes.length > 0) {
      console.log('[SolidStats] Sample (first 3 classes):');
      classes.slice(0, 3).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.date} | ${c.type}: ${c.variant} | ${c.instructor} | ${c.location} | ${c.time}`);
      });
    }

    return { classes, availableYears };
  } catch (error) {
    console.error('[SolidStats] Error parsing PDF:', error);
    throw error;
  }
}

function extractClasses(text: string): ClassData[] {
  const classes: ClassData[] = [];

  // Normalize broken text from PDF extraction (some PDFs have spaces between characters)
  let normalizedText = text
    .replace(/\s*∶\s*/g, ':')  // Special colon character (U+2236)
    // Fix broken class types
    .replace(/S\s*ign\s*a\s*tur\s*e\s*50/gi, 'Signature50')
    .replace(/F\s*o\s*c\s*us\s*50/gi, 'Focus50')
    .replace(/F\s*oun\s*da\s*tion\s*50/gi, 'Foundation50')
    .replace(/S\s*t\s*a\s*rt\s*e\s*r\s*50/gi, 'Starter50')
    .replace(/P\s*o\s*w\s*e\s*r\s*30/gi, 'Power30')
    .replace(/A\s*d\s*v\s*a\s*n\s*c\s*e\s*d\s*50/gi, 'Advanced50')
    .replace(/A\s*d\s*v\s*a\s*n\s*c\s*e\s*d\s*65/gi, 'Advanced65')
    // Fix broken month names
    .replace(/J\s*a\s*n\s*u\s*a\s*r\s*y/gi, 'January')
    .replace(/F\s*e\s*b\s*r\s*u\s*a\s*r\s*y/gi, 'February')
    .replace(/M\s*a\s*r\s*c\s*h/gi, 'March')
    .replace(/A\s*p\s*r\s*i\s*l/gi, 'April')
    .replace(/M\s*a\s*y/gi, 'May')
    .replace(/J\s*u\s*n\s*e/gi, 'June')
    .replace(/J\s*u\s*l\s*y/gi, 'July')
    .replace(/A\s*u\s*g\s*u\s*s\s*t/gi, 'August')
    .replace(/S\s*e\s*p\s*t\s*e\s*m\s*b\s*e\s*r/gi, 'September')
    .replace(/O\s*c\s*t\s*o\s*b\s*e\s*r/gi, 'October')
    .replace(/N\s*o\s*v\s*e\s*m\s*b\s*e\s*r/gi, 'November')
    .replace(/D\s*e\s*c\s*e\s*m\s*b\s*e\s*r/gi, 'December')
    // Fix broken day names
    .replace(/M\s*o\s*n\s*d\s*a\s*y/gi, 'Monday')
    .replace(/T\s*u\s*e\s*s\s*d\s*a\s*y/gi, 'Tuesday')
    .replace(/W\s*e\s*d\s*n\s*e\s*s\s*d\s*a\s*y/gi, 'Wednesday')
    .replace(/T\s*h\s*u\s*r\s*s\s*d\s*a\s*y/gi, 'Thursday')
    .replace(/F\s*r\s*i\s*d\s*a\s*y/gi, 'Friday')
    .replace(/S\s*a\s*t\s*u\s*r\s*d\s*a\s*y/gi, 'Saturday')
    .replace(/S\s*u\s*n\s*d\s*a\s*y/gi, 'Sunday')
    // Fix broken time suffixes
    .replace(/(\d+:\d+)\s*a\s*m/gi, '$1am')
    .replace(/(\d+:\d+)\s*p\s*m/gi, '$1pm')
    // Fix broken state codes (2-letter codes with space)
    .replace(/\b([A-Z])\s+([A-Z])\s*,/g, '$1$2,')
    // Fix other broken words
    .replace(/PIL\s*ATES/gi, 'PILATES')
    .replace(/STRENGTH\s*TRAINING/gi, 'PILATES')
    .replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)PILATES/gi, '$1 PILATES')
    .replace(/S\s*tu\s*d\s*io/gi, 'Studio')
    .replace(/\s+/g, ' ');

  // Handle alternate date format: "Sunday PILATES 14 December, 2025" -> "14 Sunday December, 2025 PILATES"
  // This moves the day number before the day-of-week and PILATES after the year
  const dayOfWeekNames = 'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday';
  const monthNames = 'January|February|March|April|May|June|July|August|September|October|November|December';
  normalizedText = normalizedText.replace(
    new RegExp(`(${dayOfWeekNames})\\s+PILATES\\s+(\\d{1,2})\\s+(${monthNames})\\s*,?\\s*(\\d{4})`, 'gi'),
    '$2 $1 $3, $4 PILATES'
  );

  // Handle: "PILATES Signature50: Variant DD DayOfWeek Month, Year" -> "DD DayOfWeek Month, Year PILATES Signature50: Variant"
  const classTypeNames = 'Signature50|Focus50|Foundation50|Starter50|Power30|Advanced50|Advanced65';
  normalizedText = normalizedText.replace(
    new RegExp(`PILATES\\s+((?:Studio\\s*\\d+\\s*\\|\\s*)?(?:Off-Peak\\s+)?(?:${classTypeNames})[:\\|][^,]+?)\\s+(\\d{1,2})\\s+(${dayOfWeekNames})\\s+(${monthNames})\\s*,?\\s*(\\d{4})`, 'gi'),
    '$2 $3 $4, $5 PILATES $1'
  );

  // Handle: "PILATES DD DayOfWeek Month, Year Studio X |" -> "DD DayOfWeek Month, Year PILATES Studio X |"
  normalizedText = normalizedText.replace(
    new RegExp(`PILATES\\s+(\\d{1,2})\\s+(${dayOfWeekNames})\\s+(${monthNames})\\s*,?\\s*(\\d{4})\\s+(Studio\\s*\\d+\\s*\\|)`, 'gi'),
    '$1 $2 $3, $4 PILATES $5'
  );

  // Handle web page PDF format where time/duration comes before PILATES
  // "04 Sunday January, 2026 5:30pm (50 min) PILATES Signature50: Full Body TX, Location w/ Instructor"
  // -> "04 Sunday January, 2026 PILATES Signature50: Full Body TX, Location w/ Instructor 5:30pm (50 min)"
  // Note: Also handles STRENGTH TRAINING (already normalized to PILATES above) and optional timezone
  normalizedText = normalizedText.replace(
    new RegExp(
      // Date: "04 Sunday January, 2026" or "04 Sunday January 2026"
      `(\\d{1,2}\\s+(?:${dayOfWeekNames})\\s+(?:${monthNames})\\s*,?\\s*\\d{4})\\s+` +
      // Time with optional timezone: "5:30pm" or "9:00am EDT"
      `(\\d{1,2}:\\d{2}(?:am|pm)(?:\\s*[A-Z]{2,4})?)\\s*` +
      // Duration: "(50 min)"
      `\\((\\d+)\\s*min\\s*\\)\\s+` +
      // Class info: PILATES [prefix] ClassType: Variant State, Location w/ Instructor
      `(PILATES\\s+(?:Studio\\s*\\d+\\s*\\|\\s*)?(?:Off-Peak\\s+)?(?:Grand\\s+Opening\\s+)?(?:${classTypeNames})[:\\|].+?w\\s*/\\s*[A-Za-z][A-Za-z\\s\\-''''.…#]+?)` +
      // Lookahead: stop before BOOK, REVIEW, next date, or end
      `(?=\\s*(?:BOOK|REVIEW|\\d{1,2}\\s+(?:${dayOfWeekNames})|$))`,
      'gi'
    ),
    '$1 $4 $2 ($3 min)'
  );

  // Also handle when BOOK AGAIN appears between time and duration (row-by-row extraction)
  // "04 Sunday January, 2026 PILATES ... Instructor 5:30pm BOOK AGAIN (50 min)"
  // This is already handled by the main pattern, but we need to handle the reversed case too:
  // "04 Sunday January, 2026 5:30pm BOOK AGAIN (50 min) PILATES ..."
  normalizedText = normalizedText.replace(
    new RegExp(
      `(\\d{1,2}\\s+(?:${dayOfWeekNames})\\s+(?:${monthNames})\\s*,?\\s*\\d{4})\\s+` +
      `(\\d{1,2}:\\d{2}(?:am|pm)(?:\\s*[A-Z]{2,4})?)\\s+` +
      `BOOK\\s+AGAIN\\s+` +
      `\\((\\d+)\\s*min\\s*\\)\\s+` +
      `(PILATES\\s+(?:Studio\\s*\\d+\\s*\\|\\s*)?(?:Off-Peak\\s+)?(?:Grand\\s+Opening\\s+)?(?:${classTypeNames})[:\\|].+?w\\s*/\\s*[A-Za-z][A-Za-z\\s\\-''''.…#]+?)` +
      `(?=\\s*(?:BOOK|REVIEW|\\d{1,2}\\s+(?:${dayOfWeekNames})|$))`,
      'gi'
    ),
    '$1 $4 $2 ($3 min)'
  );

  // Check for key indicators that this is a Mindbody PDF
  const hasMindbody = normalizedText.toLowerCase().includes('mindbody');
  const hasPilates = normalizedText.toLowerCase().includes('pilates');
  const hasSignature = normalizedText.toLowerCase().includes('signature50');

  console.log('[SolidStats] PDF content check:', {
    hasMindbody,
    hasPilates,
    hasSignature,
    textPreview: normalizedText.substring(0, 200) + '...'
  });

  if (!hasPilates && !hasSignature) {
    console.warn('[SolidStats] Warning: This PDF may not contain Solidcore class data');
  }

  // Pattern to match class entries:
  // Day Month, Year ... ClassType: Variant ... Location w/ Instructor ... Time (Duration)
  // Example: "31 Wednesday December, 2025 PILATES Signature50: Full Body MA, Arsenal Yards w/ Jacqui Caefer 3:00pm (50 min)"

  // All US states where Solidcore has studios (31 states + DC)
  const statePattern = 'AL|AZ|CA|CO|CT|DC|DE|FL|GA|IL|IN|KY|MD|MA|MI|MN|NV|NJ|NY|NC|ND|OK|PA|RI|SD|TN|TX|UT|VA|WA|WI';

  // All class types: Signature50, Focus50, Foundation50, Starter50, Power30, Advanced50, Advanced65
  // Also includes Private Class for private sessions
  const classTypePattern = 'Signature50|Focus50|Foundation50|Starter50|Power30|Advanced50|Advanced65|Private Class';

  // Pattern explanation:
  // - Day of week (optional position) + day number + day of week (optional position) + month + year
  // - PILATES + class type + colon + variant (may include playlist name after |, or "Studio X |")
  // - State code + location (until " w/ ")
  // - Instructor name (until time)
  // - Time + duration
  const dayOfWeek = '(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)';
  // Timezone pattern for CST, CDT, EST, EDT, PST, PDT, MST, MDT, etc.
  const timezonePattern = '(?:\\s*[A-Z]{2,4})?';

  // Optional "Off-Peak" prefix before class type
  const offPeakPrefix = '(?:Off-Peak\\s+)?';

  // Main class pattern - handles standard class types with : separator
  // Also handles Private Class with | separator (with optional whitespace around separator)
  const classPattern = new RegExp(
    `(?:${dayOfWeek}\\s+)?(\\d{1,2})\\s+(?:${dayOfWeek}\\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)\\s*,?\\s*(\\d{4})\\s+PILATES\\s+(?:Studio\\s*\\d+\\s*\\|\\s*)?${offPeakPrefix}(${classTypePattern})\\s*[:\\|]\\s*(.+?)\\s+(${statePattern})\\s*,\\s*(.+?)\\s+w\\s*/\\s*([A-Za-z][A-Za-z\\s\\-'.…]+?)\\s*(\\d{1,2}:\\d{2}(?:am|pm))${timezonePattern}(?:\\s+(?:BOOK\\s+AGAIN|REVIEW))?\\s*\\((\\d+)\\s*min\\s*\\)`,
    'gi'
  );

  let match;
  let skippedNonSolidcore = 0;

  while ((match = classPattern.exec(normalizedText)) !== null) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2];
    const year = parseInt(match[3], 10);
    const classType = normalizeClassType(match[4]);
    const variant = normalizeVariant(match[5]);
    // match[6] is state (MA/NY/etc.) - not currently used
    const location = collapseSpacedChars(match[7]).trim();
    const instructor = normalizeInstructorName(match[8]);
    const time = match[9].toLowerCase();

    const month = getMonthIndex(monthStr);
    const rawDate = new Date(year, month, day);

    // Skip invalid dates
    if (isNaN(rawDate.getTime())) continue;

    // Skip non-Solidcore Pilates classes (e.g., Reformer from other studios)
    if (isNonSolidcoreClass(variant, location)) {
      skippedNonSolidcore++;
      console.log(`[SolidStats] Skipped non-Solidcore class: ${variant} at ${location}`);
      continue;
    }

    const classData: ClassData = {
      date: formatDate(rawDate),
      time: time,
      type: classType,
      variant: variant,
      instructor: instructor,
      location: location,
      rawDate: rawDate,
    };

    classes.push(classData);
  }

  if (skippedNonSolidcore > 0) {
    console.log(`[SolidStats] Filtered out ${skippedNonSolidcore} non-Solidcore Pilates classes`);
  }

  // Debug: Find potential unmatched classes (lines with date patterns and duration)
  const potentialClassPattern = /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December).*?\(\d+\s*min\s*\)/gi;
  const potentialMatches = normalizedText.match(potentialClassPattern) || [];
  const unmatchedCount = potentialMatches.length - classes.length;

  if (unmatchedCount > 0) {
    console.log(`[SolidStats DEBUG] Found ${potentialMatches.length} potential class entries, matched ${classes.length}`);
    console.log(`[SolidStats DEBUG] ${unmatchedCount} potential entries didn't match. Sampling unmatched:`);

    let debugCount = 0;
    for (const potential of potentialMatches) {
      // Check if this potential match is in our results
      const dayMonthMatch = potential.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i);
      if (dayMonthMatch) {
        const sig = `${dayMonthMatch[1]} ${dayMonthMatch[2]}`;
        // Count how many times this date appears in matches vs potentials
        const matchCount = classes.filter(c => {
          const month = c.rawDate.toLocaleString('en-US', { month: 'long' });
          return `${c.rawDate.getDate()} ${month}` === sig;
        }).length;
        const potentialCount = potentialMatches.filter(p => p.includes(sig)).length;

        if (potentialCount > matchCount && debugCount < 5) {
          console.log(`[SolidStats DEBUG] Unmatched: ${potential.substring(0, 200)}...`);
          debugCount++;
        }
      }
    }
  }

  // Sort by date (most recent first)
  classes.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  return classes;
}

function getMonthIndex(monthStr: string): number {
  const months: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  return months[monthStr.toLowerCase()] ?? 0;
}

function normalizeClassType(type: string): ClassType {
  const lower = type.toLowerCase();
  if (lower.includes('advanced65')) return 'Advanced65';
  if (lower.includes('advanced50')) return 'Advanced50';
  if (lower.includes('power30')) return 'Power30';
  if (lower.includes('signature')) return 'Signature50';
  if (lower.includes('focus')) return 'Focus50';
  if (lower.includes('foundation')) return 'Foundation50';
  if (lower.includes('starter')) return 'Starter50';
  if (lower.includes('private')) return 'Signature50'; // Treat private classes as Signature50
  return 'Signature50';
}

// Check if a class entry is a non-Solidcore Pilates class (e.g., Reformer classes from other studios)
function isNonSolidcoreClass(variant: string, location: string): boolean {
  const variantLower = variant.toLowerCase();
  const locationLower = location.toLowerCase();

  // Non-Solidcore indicators
  const nonSolidcorePatterns = [
    'reformer',           // Pilates Reformer classes from other studios
    'district pilates',   // District Pilates studio
    'reformation',        // Reformation studio
    'pilates level',      // "Pilates Reformer (Level 1.5)"
    'intermediate',       // "Reformer - Intermediate"
    'beginner',           // "Reformer - Beginner"
  ];

  for (const pattern of nonSolidcorePatterns) {
    if (variantLower.includes(pattern) || locationLower.includes(pattern)) {
      return true;
    }
  }

  return false;
}

// Fix text with spaces between characters (e.g., "J or da n" -> "Jordan")
function collapseSpacedChars(text: string): string {
  // Remove all spaces between letters, then re-add at word boundaries
  const collapsed = text.replace(/\s+/g, '');
  return collapsed.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function normalizeVariant(variant: string): string {
  return collapseSpacedChars(variant)
    .trim()
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\[solidcore\]/gi, '[solidcore]')  // Normalize brand name
    .replace(/\s*\|.*$/, '');       // Remove anything after pipe (playlist names etc.)
}

function normalizeInstructorName(name: string): string {
  // First collapse any spaced characters
  let normalized = collapseSpacedChars(name);

  // Remove titles like "- Senior Master", "- Pro Coach", etc.
  // Match individual title words to handle truncated text like "Senior Ma…"
  normalized = normalized
    .replace(/\s*-\s*(Senior|Master|Pro|Head|Coach|Instructor).*$/i, '')
    .replace(/\s*….*$/i, '')  // Remove truncation
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

function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
