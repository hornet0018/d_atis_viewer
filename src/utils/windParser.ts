export interface ParsedWind {
  direction?: number; // 風向 (度)
  speed?: number; // 風速 (kt)
  gust?: number; // 突風 (kt)
  variable?: boolean; // 可変風
}

/**
 * Parse wind information from ATIS/METAR string
 * Supports formats:
 * - 35010KT (direction 350, speed 10 knots)
 * - 35010G15KT (direction 350, speed 10 knots, gust 15 knots)
 * - VRB03KT (variable direction, speed 3 knots)
 * - 00000KT (calm)
 */
export function parseWind(text: string): ParsedWind | null {
  // Pattern for wind: dddffGffKT or dddffKT or VRBffGffKT or VRBffKT
  const windPattern =
    /(?:WIND\s*)?(?:(\d{3})(\d{2})(?:G(\d{2}))?KT|VRB(\d{2})(?:G(\d{2}))?KT|00000KT)/i;

  const match = text.match(windPattern);
  if (!match) return null;

  // Calm wind
  if (match[0] === "00000KT" || match[0].includes("00000KT")) {
    return { direction: 0, speed: 0, variable: false };
  }

  // Variable wind
  if (match[0].toUpperCase().startsWith("VRB")) {
    return {
      variable: true,
      speed: match[4] ? parseInt(match[4]) : undefined,
      gust: match[5] ? parseInt(match[5]) : undefined,
    };
  }

  // Normal wind
  return {
    direction: match[1] ? parseInt(match[1]) : undefined,
    speed: match[2] ? parseInt(match[2]) : undefined,
    gust: match[3] ? parseInt(match[3]) : undefined,
  };
}

/**
 * Extract wind from ATIS raw text
 */
export function extractWindFromAtis(atisRaw: string): ParsedWind | null {
  return parseWind(atisRaw);
}
