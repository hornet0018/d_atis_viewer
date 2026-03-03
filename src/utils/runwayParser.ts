export interface ParsedRunwayInfo {
  arrivalRunways: string[];
  departureRunways: string[];
  landingRunways: string[];
  approachType?: string; // ILS, VISUAL, etc.
  rawText?: string; // For debugging
}

/**
 * Parse ATIS raw text to extract active runway information
 * Supports multiple ATIS formats from atis.guru and similar sources
 */
export function parseRunwaysFromAtis(raw: string): ParsedRunwayInfo {
  const result: ParsedRunwayInfo = {
    arrivalRunways: [],
    departureRunways: [],
    landingRunways: [],
    approachType: undefined,
    rawText: raw,
  };

  const lines = raw.toUpperCase().split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Extract arrival runways - multiple patterns
    // Pattern 1: "ARR RWY 16L/16R" or "ARRIVAL RWY 16L/16R"
    let arrivalMatch = trimmedLine.match(/ARR(?:IVAL)?\s+RWY\s+(\d+[LRC]?(?:\/\d+[LRC]?)?(?:\s*,\s*\d+[LRC]?)*)/);
    if (arrivalMatch) {
      result.arrivalRunways = parseRunwayList(arrivalMatch[1]);
      continue;
    }

    // Pattern 2: "ARR RWY 16L AND 16R"
    arrivalMatch = trimmedLine.match(/ARR(?:IVAL)?\s+RWY\s+(\d+[LRC]?)\s+AND\s+(\d+[LRC]?)/);
    if (arrivalMatch) {
      result.arrivalRunways = [
        normalizeRunway(arrivalMatch[1]),
        normalizeRunway(arrivalMatch[2]),
      ];
      continue;
    }

    // Extract departure runways - multiple patterns
    // Pattern 1: "DEP RWY 22" or "DEPARTURE RWY 22"
    let depMatch = trimmedLine.match(/DEP(?:ARTURE)?\s+RWY\s+(\d+[LRC]?(?:\/\d+[LRC]?)?(?:\s*,\s*\d+[LRC]?)*)/);
    if (depMatch) {
      result.departureRunways = parseRunwayList(depMatch[1]);
      continue;
    }

    // Pattern 2: "DEP RWY 22 AND 23"
    depMatch = trimmedLine.match(/DEP(?:ARTURE)?\s+RWY\s+(\d+[LRC]?)\s+AND\s+(\d+[LRC]?)/);
    if (depMatch) {
      result.departureRunways = [
        normalizeRunway(depMatch[1]),
        normalizeRunway(depMatch[2]),
      ];
      continue;
    }

    // Extract landing runways - multiple patterns
    // "LANDING RWY 16L/34R" or "LDG RWY 16L"
    let landingMatch = trimmedLine.match(/(?:LANDING|LDG)\s+RWY\s+(\d+[LRC]?(?:\/\d+[LRC]?)?(?:\s*,\s*\d+[LRC]?)*)/);
    if (landingMatch) {
      result.landingRunways = parseRunwayList(landingMatch[1]);
      continue;
    }

    // Extract approach type
    if (trimmedLine.includes("ILS APCH") || trimmedLine.includes("ILS APPROACH")) {
      result.approachType = "ILS";
    } else if (trimmedLine.includes("VISUAL APCH") || trimmedLine.includes("VISUAL APPROACH")) {
      result.approachType = "VISUAL";
    } else if (trimmedLine.includes("RNAV APCH") || trimmedLine.includes("RNAV APPROACH")) {
      result.approachType = "RNAV";
    }
  }

  // If no explicit arrival/departure runways, try to find any runway info
  if (result.arrivalRunways.length === 0 && result.departureRunways.length === 0) {
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Look for standalone "RWY XX" patterns
      const rwyMatch = trimmedLine.match(/RWY\s+(\d+[LRC]?(?:\/\d+[LRC]?)?)/);
      if (rwyMatch) {
        result.landingRunways = parseRunwayList(rwyMatch[1]);
        break;
      }

      // Look for "USING RWY XX" pattern
      const usingMatch = trimmedLine.match(/USING\s+RWY\s+(\d+[LRC]?)/);
      if (usingMatch) {
        result.landingRunways = [normalizeRunway(usingMatch[1])];
        break;
      }
    }
  }

  console.log("Parsed runways from ATIS:", result);
  return result;
}

/**
 * Normalize runway designation (e.g., "4" -> "04", "16L" -> "16L")
 */
function normalizeRunway(rwy: string): string {
  const match = rwy.match(/^(\d{1,2})([LRC]?)$/);
  if (match) {
    const num = match[1].padStart(2, "0");
    return num + match[2];
  }
  return rwy;
}

/**
 * Parse runway list (e.g., "16L/16R" or "16" or "16L,16R")
 * Supports both "/" and "," separators
 */
function parseRunwayList(runwayStr: string): string[] {
  if (!runwayStr) return [];

  // Split by common separators (/, comma, space)
  const runways = runwayStr.split(/\s*[\/,]\s*|\s+and\s+/i).filter(r => r.length > 0);

  // Normalize each runway designation
  return runways.map(r => normalizeRunway(r.trim()));
}

/**
 * Find matching runway from available runways
 * Matches by number (e.g., "16" matches "16L", "16R", "16L/34R")
 */
export function findMatchingRunways(
  activeRunways: string[],
  availableRunways: string[]
): string[] {
  const matches: string[] = [];

  for (const active of activeRunways) {
    for (const available of availableRunways) {
      // Check if the active runway is a substring of the available runway
      // e.g., "16" matches "16L", "16R", or "16L/34R"
      if (available.includes(active)) {
        if (!matches.includes(available)) {
          matches.push(available);
        }
      }
    }
  }

  return matches;
}
