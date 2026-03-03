export interface RunwayCoordinates {
  name: string;
  // Runway endpoints for accurate drawing [lat, lng]
  endpoint1: [number, number];
  endpoint2: [number, number];
}

export interface AirportCoordinates {
  name: string;
  position: [number, number];
  runways: RunwayCoordinates[];
}

// Accurate runway coordinates from OpenStreetMap
// All runways standardized with endpoint1 = south/lower latitude, endpoint2 = north/higher latitude
// Runway naming: "XX/YY" where XX and YY are magnetic heading ÷ 10
//   - Numbers 01-18: runway oriented southeast/south (lower number is north end)
//   - Numbers 31-36: runway oriented north/northwest (higher number is south end)
// For example "16R/34L": 16R is north end (heading ~160°), 34L is south end (heading ~340°)
export const AIRPORT_COORDINATES: Record<string, AirportCoordinates> = {
  RJTT: {
    name: "Tokyo Haneda",
    position: [35.5494, 139.7798],
    runways: [
      // Runway A (16R/34L) - 3000m - OSM way 5170667
      // endpoint1: south end (34L), endpoint2: north end (16R)
      {
        name: "16R/34L",
        endpoint1: [35.5366291, 139.7856418],
        endpoint2: [35.5599800, 139.7690680],
      },
      // Runway B (04/22) - 2500m - OSM way 5170665
      // endpoint1: west end (04), endpoint2: east end (22)
      {
        name: "04/22",
        endpoint1: [35.5490018, 139.7612640],
        endpoint2: [35.5674042, 139.7770627],
      },
      // Runway C (16L/34R) - 3360m - OSM way 322815280
      // endpoint1: south end (34R), endpoint2: north end (16L)
      // Note: OSM way direction was opposite, swapped for consistency
      {
        name: "16L/34R",
        endpoint1: [35.5425114, 139.8031431],
        endpoint2: [35.5628941, 139.7886755],
      },
      // Runway D (05/23) - 2500m - OSM way 82435600
      // endpoint1: southwest end (05), endpoint2: northeast end (23)
      {
        name: "05/23",
        endpoint1: [35.5239960, 139.8034708],
        endpoint2: [35.5405363, 139.8220500],
      },
    ],
  },
  RJAA: {
    name: "Tokyo Narita",
    position: [35.7647, 140.3864],
    runways: [
      // Runway A (16R/34L) - 4000m - OSM way 14984706
      {
        name: "16R/34L",
        endpoint1: [35.7743940, 140.3682920],
        endpoint2: [35.7433046, 140.3907436],
      },
      // Runway B (16L/34R) - 2500m - OSM way 27482896
      {
        name: "16L/34R",
        endpoint1: [35.8051837, 140.3781157],
        endpoint2: [35.7857680, 140.3921522],
      },
    ],
  },
  RJBB: {
    name: "Osaka Kansai",
    position: [34.4347, 135.2441],
    runways: [
      // Runway A (06R/24L) - 4000m - OSM way 62227351
      {
        name: "06R/24L",
        endpoint1: [34.4512600, 135.2400029],
        endpoint2: [34.4285336, 135.2061511],
      },
      // Runway B (06L/24R) - 3500m - OSM way 40983116
      {
        name: "06L/24R",
        endpoint1: [34.4173452, 135.2292165],
        endpoint2: [34.4372139, 135.2588306],
      },
    ],
  },
  RJSS: {
    name: "Sendai",
    position: [38.1396, 140.9169],
    runways: [
      // Runway 09/27 - 3000m - OSM way 22787652
      {
        name: "09/27",
        endpoint1: [38.1386955, 140.8980700],
        endpoint2: [38.1423295, 140.9333749],
      },
      // Runway 12/30 - 1200m - OSM way 22787654
      {
        name: "12/30",
        endpoint1: [38.1402286, 140.9129108],
        endpoint2: [38.1340489, 140.9277945],
      },
    ],
  },
  RJOO: {
    name: "Osaka Itami",
    position: [34.7855, 135.4380],
    runways: [
      // Runway 14R/32L - 3000m - OSM way 172873472
      {
        name: "14R/32L",
        endpoint1: [34.7919837, 135.4279054],
        endpoint2: [34.7715243, 135.4526895],
      },
      // Runway 14L/32R - 1628m - OSM way 172873475
      {
        name: "14L/32R",
        endpoint1: [34.7966301, 135.4270212],
        endpoint2: [34.7824683, 135.4441882],
      },
    ],
  },
  RJFF: {
    name: "Fukuoka",
    position: [33.5859, 130.4511],
    runways: [
      // Runway 16L/34R - 2800m - OSM way 23303829
      {
        name: "16L/34R",
        endpoint1: [33.5968173, 130.4432455],
        endpoint2: [33.5750558, 130.4581177],
      },
      // Runway 16R/34L - 2500m - OSM way 922841352
      {
        name: "16R/34L",
        endpoint1: [33.5921356, 130.4438500],
        endpoint2: [33.5760730, 130.4547941],
      },
    ],
  },
  RJFK: {
    name: "Kagoshima",
    position: [31.8034, 130.7191],
    runways: [
      // Runway 16/34 - 3000m - OSM way 35194224
      {
        name: "16/34",
        endpoint1: [31.7917423, 130.7272676],
        endpoint2: [31.8150890, 130.7114775],
      },
    ],
  },
  RJCC: {
    name: "Sapporo New Chitose",
    position: [42.7753, 141.6925],
    runways: [
      // Runway 01L/19R - 3000m
      // endpoint1: south end (01L), endpoint2: north end (19R)
      {
        name: "01L/19R",
        endpoint1: [42.761727, 141.692813],
        endpoint2: [42.788390, 141.688093],
      },
      // Runway 01R/19L - 3000m
      // endpoint1: south end (01R), endpoint2: north end (19L)
      {
        name: "01R/19L",
        endpoint1: [42.762036, 141.696436],
        endpoint2: [42.788720, 141.691733],
      },
    ],
  },
  RJCH: {
    name: "Hakodate",
    position: [41.772, 140.792],
    runways: [
      // Runway 12/30 - 2000m
      // endpoint1: west end (12), endpoint2: east end (30)
      {
        name: "12/30",
        endpoint1: [41.7720000, 140.7799324],
        endpoint2: [41.7720000, 140.8040676],
      },
    ],
  },
  RJCK: {
    name: "Kushiro",
    position: [43.0408, 144.1931],
    runways: [
      // Runway 17/35 - 2500m
      // endpoint1: south end (35), endpoint2: north end (17)
      {
        name: "17/35",
        endpoint1: [43.0295500, 144.1931000],
        endpoint2: [43.0520500, 144.1931000],
      },
    ],
  },
};

// Get runways for an airport
export function getRunwaysForAirport(airportCode: string): RunwayCoordinates[] {
  return AIRPORT_COORDINATES[airportCode]?.runways || [];
}

// Get airport position
export function getAirportPosition(airportCode: string): [number, number] | null {
  return AIRPORT_COORDINATES[airportCode]?.position || null;
}
