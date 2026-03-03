import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { RunwayCoordinates } from "../data/runways";
import { AIRPORT_COORDINATES } from "../data/runways";
import { AIRPORTS } from "../types/atis";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface AirportMapProps {
  airportCode: string;
  activeRunways?: string[]; // Active runway designations (e.g., ["16L", "16R"])
}

// Component to update map view when airport changes
function MapViewController({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 14);
  }, [position, map]);
  return null;
}

/**
 * Calculate runway polygon coordinates from two endpoints
 */
function calculateRunwayPolygon(
  endpoint1: [number, number],
  endpoint2: [number, number]
): [number, number][] {
  const widthDegrees = 0.0008; // ~30m runway width at this latitude

  // Calculate direction vector from endpoint1 to endpoint2
  const dx = endpoint2[1] - endpoint1[1];
  const dy = endpoint2[0] - endpoint1[0];
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  const dirX = dx / length;
  const dirY = dy / length;

  // Perpendicular vector (for width)
  const perpX = -dirY * widthDegrees;
  const perpY = dirX * widthDegrees;

  // Calculate four corners
  const topLeft: [number, number] = [
    endpoint1[0] + perpY / 2,
    endpoint1[1] + perpX / 2
  ];
  const topRight: [number, number] = [
    endpoint2[0] + perpY / 2,
    endpoint2[1] + perpX / 2
  ];
  const bottomRight: [number, number] = [
    endpoint2[0] - perpY / 2,
    endpoint2[1] - perpX / 2
  ];
  const bottomLeft: [number, number] = [
    endpoint1[0] - perpY / 2,
    endpoint1[1] - perpX / 2
  ];

  return [topLeft, topRight, bottomRight, bottomLeft];
}

/**
 * Calculate offset position for runway end label
 * Places the label slightly outside the runway end
 */
function calculateLabelOffset(
  endpoint: [number, number],
  otherEndpoint: [number, number],
  offsetDistance: number = 0.002
): [number, number] {
  // Calculate direction from other endpoint to this endpoint
  const dx = endpoint[1] - otherEndpoint[1];
  const dy = endpoint[0] - otherEndpoint[0];
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize and extend beyond the endpoint
  return [
    endpoint[0] + (dy / length) * offsetDistance,
    endpoint[1] + (dx / length) * offsetDistance
  ];
}

/**
 * Match runway end designation to position
 * Uses latitude/longitude to determine which end gets which designation
 *
 * Runway naming convention (runway number = magnetic heading ÷ 10):
 * - Runway 04/05 = heading ~40-50° (points NE) → SOUTHWEST end
 * - Runway 16 = heading ~160° (points SE) → NORTH end
 * - Runway 22/23 = heading ~220-230° (points SW) → NORTHEAST end
 * - Runway 34 = heading ~340° (points NW) → SOUTH end
 *
 * For a runway named "16R/34L":
 * - 16R end (heading 160°, points SE) is the NORTH end
 * - 34L end (heading 340°, points NW) is the SOUTH end
 *
 * For a runway named "04/22":
 * - 04 end (heading 40°, points NE) is the SOUTHWEST end
 * - 22 end (heading 220°, points SW) is the NORTHEAST end
 */
function matchRunwayEndToPosition(
  runwayEnds: string[],
  endpoint1: [number, number],
  endpoint2: [number, number]
): { end1: string; end2: string } {
  // Extract runway numbers
  const runwayNumbers = runwayEnds.map(end => ({
    label: end,
    num: parseInt(end.replace(/[LRC]/g, ""))
  }));

  // Determine if this is a north-south runway (16/34) or east-west runway (04/22, 05/23)
  const isNorthSouthRunway = runwayNumbers.some(r => r.num >= 13 && r.num <= 18) &&
                             runwayNumbers.some(r => r.num >= 31 && r.num <= 36);

  if (isNorthSouthRunway) {
    // North-south runways like 16/34
    const end1IsNorth = endpoint1[0] > endpoint2[0];
    const northEndLabel = runwayNumbers.find(r => r.num >= 13 && r.num <= 18)?.label || runwayEnds[0];
    const southEndLabel = runwayNumbers.find(r => r.num >= 31 && r.num <= 36)?.label || runwayEnds[1];

    return {
      end1: end1IsNorth ? northEndLabel : southEndLabel,
      end2: end1IsNorth ? southEndLabel : northEndLabel,
    };
  } else {
    // East-west runways like 04/22, 05/23
    // Determine which endpoint is more northeast (higher lat OR higher lon)
    const end1IsNE = endpoint1[0] > endpoint2[0] || (endpoint1[0] === endpoint2[0] && endpoint1[1] > endpoint2[1]);
    const neEndLabel = runwayNumbers.find(r => r.num >= 19 && r.num <= 27)?.label || runwayEnds[1];
    const swEndLabel = runwayNumbers.find(r => r.num >= 1 && r.num <= 18)?.label || runwayEnds[0];

    return {
      end1: end1IsNE ? neEndLabel : swEndLabel,
      end2: end1IsNE ? swEndLabel : neEndLabel,
    };
  }
}

/**
 * Check if a specific runway end is active
 */
function isRunwayEndActive(runwayEnd: string, activeRunways: string[]): boolean {
  if (activeRunways.length === 0) return false;

  const normalizedEnd = runwayEnd.padStart(2, "0");
  return activeRunways.some(activeRwy => {
    const normalizedActive = activeRwy.padStart(2, "0");
    return normalizedActive === normalizedEnd ||
           normalizedEnd.includes(normalizedActive) ||
           normalizedActive.includes(normalizedEnd);
  });
}

/**
 * Runway End Label component
 */
function RunwayEndLabel({
  position,
  label,
  isActive
}: {
  position: [number, number];
  label: string;
  isActive: boolean;
}) {
  return (
    <Marker
      position={position}
      icon={L.divIcon({
        className: "runway-end-label",
        html: `<div style="
          background: ${isActive ? '#22c55e' : '#475569'};
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
          white-space: nowrap;
          opacity: ${isActive ? 1 : 0.8};
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          border: 2px solid ${isActive ? '#16a34a' : '#64748b'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${label}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      })}
    >
      <Popup>
        <div className="text-center">
          <strong>{label}</strong>
          <br />
          {isActive ? (
            <span className="text-green-600 font-semibold">✓ Active</span>
          ) : (
            <span className="text-slate-400">Inactive</span>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * Runway component - draws a single runway with end labels
 */
function Runway({
  runway,
  activeRunways
}: {
  runway: RunwayCoordinates;
  activeRunways: string[];
}) {
  const positions = calculateRunwayPolygon(runway.endpoint1, runway.endpoint2);

  // Parse runway name to get end designations (e.g., "16L/34R" -> ["16L", "34R"])
  const runwayEnds = runway.name.split('/').map(r => r.trim());

  // Match runway ends to positions based on latitude
  const { end1, end2 } = matchRunwayEndToPosition(runwayEnds, runway.endpoint1, runway.endpoint2);

  // Check if each end is active
  const end1Active = isRunwayEndActive(end1, activeRunways);
  const end2Active = isRunwayEndActive(end2, activeRunways);
  const isActive = end1Active || end2Active;

  // Calculate label positions (offset from runway ends)
  const label1Pos = calculateLabelOffset(runway.endpoint1, runway.endpoint2);
  const label2Pos = calculateLabelOffset(runway.endpoint2, runway.endpoint1);

  return (
    <>
      <Polygon
        positions={positions}
        pathOptions={{
          color: isActive ? "#22c55e" : "#64748b",
          weight: isActive ? 4 : 2,
          opacity: isActive ? 1.0 : 0.6,
          fillColor: isActive ? "#22c55e" : "#64748b",
          fillOpacity: isActive ? 0.6 : 0.25,
        }}
      />
      {/* Runway end labels */}
      <RunwayEndLabel position={label1Pos} label={end1} isActive={end1Active} />
      <RunwayEndLabel position={label2Pos} label={end2} isActive={end2Active} />
    </>
  );
}

/**
 * Main Airport Map component
 */
export default function AirportMap({ airportCode, activeRunways = [] }: AirportMapProps) {
  const airportData = AIRPORT_COORDINATES[airportCode];

  console.log("AirportMap - airportCode:", airportCode);
  console.log("AirportMap - activeRunways:", activeRunways);
  console.log("AirportMap - airportData:", airportData);

  if (!airportData) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center text-slate-400">
        No map data available for {airportCode}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-700 px-4 py-3 border-b border-slate-600 flex justify-between items-center">
        <div>
          <h3 className="text-white font-semibold">Airport Map - Active Runways</h3>
          <p className="text-sm text-slate-400">
            {activeRunways.length > 0
              ? `Active: ${activeRunways.join(", ")}`
              : "No active runway data from ATIS"}
          </p>
        </div>
      </div>
      <div style={{ height: "400px" }}>
        <MapContainer
          center={airportData.position}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <MapViewController position={airportData.position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Airport center marker */}
          <Marker position={airportData.position}>
            <Popup>
              <div className="text-center">
                <strong>{AIRPORTS[airportCode]}</strong>
                <br />
                {airportCode}
              </div>
            </Popup>
          </Marker>
          {/* Runways with end labels */}
          {airportData.runways.map((runway) => (
            <Runway key={runway.name} runway={runway} activeRunways={activeRunways} />
          ))}
        </MapContainer>
      </div>
      {/* Legend */}
      <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-300">Active Runway End</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-slate-600 rounded"></div>
          <span className="text-slate-300">Inactive Runway End</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-slate-300">Airport Position</span>
        </div>
      </div>
    </div>
  );
}
