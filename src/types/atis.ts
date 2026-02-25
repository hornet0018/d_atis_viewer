export interface AtisData {
  airport: string;
  fetched_at: string;
  arrival_atis?: AtisInfo;
  departure_atis?: AtisInfo;
  metar?: string;
  taf?: string;
}

export interface AtisInfo {
  timestamp: string;
  raw: string;
}

export const AIRPORTS: Record<string, string> = {
  RJTT: "Tokyo Haneda",
  RJAA: "Tokyo Narita",
  RJBB: "Osaka Kansai",
  RJSS: "Sendai",
  RJOO: "Osaka Itami",
  RJFF: "Fukuoka",
  RJFK: "Kagoshima",
} as const;

export type AirportCode = keyof typeof AIRPORTS;
