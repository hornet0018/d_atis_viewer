import type { RunwayCoordinates } from "../data/runways";
import { AIRPORT_COORDINATES } from "../data/runways";

export interface AirportCoordinates {
  name: string;
  position: [number, number];
  runways: RunwayCoordinates[];
}

/**
 * Fetch runway data from OpenStreetMap Overpass API using ICAO code
 * Falls back to local static data if OSM fails
 */
export async function fetchRunwaysFromOSM(airportCode: string): Promise<RunwayCoordinates[]> {
  // Try local data first to avoid OSM rate limiting
  const localData = AIRPORT_COORDINATES[airportCode];
  if (localData && localData.runways.length > 0) {
    console.log("Using local runway data for", airportCode);
    return localData.runways;
  }

  // If no local data, try OSM (will likely fail due to rate limiting)
  const query = `
    [out:json][timeout:25];
    node["aeroway"="aerodrome"]["icao"="${airportCode}"];
    way["aeroway"="aerodrome"]["icao"="${airportCode}"];
    relation["aeroway"="aerodrome"]["icao"="${airportCode}"];
    map_to_area;
    way["aeroway"="runway"](area);
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    const runways: RunwayCoordinates[] = [];
    const ways = data.elements.filter((el: any) => el.type === "way");

    for (const way of ways) {
      const ref = way.tags?.ref;
      const nodes = way.nodes;
      if (nodes.length < 2) continue;

      const firstNode = data.elements.find((el: any) => el.id === nodes[0]);
      const lastNode = data.elements.find((el: any) => el.id === nodes[nodes.length - 1]);

      if (firstNode && lastNode) {
        runways.push({
          name: ref || "Unknown",
          endpoint1: [firstNode.lat, firstNode.lon],
          endpoint2: [lastNode.lat, lastNode.lon],
        });
      }
    }

    return runways;
  } catch (error) {
    console.error("Error fetching runways from OSM:", error);
    return [];
  }
}

/**
 * Get airport center position
 */
export function getAirportPosition(airportCode: string): [number, number] | null {
  return AIRPORT_COORDINATES[airportCode]?.position || null;
}

/**
 * Fetch complete airport data (uses local static data)
 */
export async function fetchAirportDataFromOSM(airportCode: string): Promise<AirportCoordinates | null> {
  const data = AIRPORT_COORDINATES[airportCode];
  return data || null;
}
