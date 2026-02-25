import { useSearchParams, useNavigate } from "react-router-dom";
import type { AtisData } from "../types/atis";
import { AIRPORTS, type AirportCode } from "../types/atis";
import { useState, useEffect } from "react";

const API_BASE_URL = "https://d-atis-api.kenta-722-768.workers.dev";

function parseAtisRaw(raw: string): { type: string; code: string; letter: string; time: string; content: string[] } {
  const lines = raw.split("\n");
  const result: { type: string; code: string; letter: string; time: string; content: string[] } = {
    type: "",
    code: "",
    letter: "",
    time: "",
    content: [],
  };

  for (const line of lines) {
    if (line.match(/^[A-Z]{4} (ARR|DEP) ATIS/)) {
      const match = line.match(/([A-Z]{4}) (ARR|DEP) ATIS ([A-Z])/);
      if (match) {
        result.code = match[1];
        result.type = match[2];
        result.letter = match[3];
      }
    } else if (line.match(/^\d{4}Z/)) {
      result.time = line;
    } else if (line.trim()) {
      result.content.push(line.trim());
    }
  }

  return result;
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const airportParam = searchParams.get("airport") || "RJTT";
  const [localAirport, setLocalAirport] = useState<AirportCode>(airportParam as AirportCode);
  const [data, setData] = useState<AtisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/${airportParam}`);
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const result: AtisData = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [airportParam]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const airport = formData.get("airport") as string;
    navigate(`/?airport=${airport}`);
  };

  const parsedArrival = data?.arrival_atis?.raw ? parseAtisRaw(data.arrival_atis.raw) : null;
  const parsedDeparture = data?.departure_atis?.raw ? parseAtisRaw(data.departure_atis.raw) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">D-ATIS Viewer</h1>
          <p className="text-slate-400">Airport Terminal Information Service</p>
        </header>

        {/* Airport Selector */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex justify-center gap-4 flex-wrap">
            <select
              name="airport"
              value={localAirport}
              onChange={(e) => setLocalAirport(e.target.value as AirportCode)}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(AIRPORTS).map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load ATIS"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-200">Error loading ATIS data: {error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Info Header */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {AIRPORTS[data.airport] || data.airport}
                  </h2>
                  <p className="text-slate-400">ICAO: {data.airport}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="text-white">
                    {new Date(data.fetched_at).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* ATIS Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Arrival ATIS */}
              {data.arrival_atis && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      Arrival ATIS
                    </h3>
                    {parsedArrival && (
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        {parsedArrival.letter}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{data.arrival_atis.timestamp}</p>
                  <pre className="bg-slate-900/50 rounded p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap font-mono">
                    {data.arrival_atis.raw}
                  </pre>
                </div>
              )}

              {/* Departure ATIS */}
              {data.departure_atis && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                      Departure ATIS
                    </h3>
                    {parsedDeparture && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                        {parsedDeparture.letter}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{data.departure_atis.timestamp}</p>
                  <pre className="bg-slate-900/50 rounded p-4 text-sm text-blue-300 overflow-x-auto whitespace-pre-wrap font-mono">
                    {data.departure_atis.raw}
                  </pre>
                </div>
              )}
            </div>

            {/* METAR */}
            {data.metar && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">METAR</h3>
                <pre className="bg-slate-900/50 rounded p-4 text-sm text-yellow-300 overflow-x-auto whitespace-pre-wrap font-mono">
                  {data.metar}
                </pre>
              </div>
            )}

            {/* TAF */}
            {data.taf && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">TAF</h3>
                <pre className="bg-slate-900/50 rounded p-4 text-sm text-purple-300 overflow-x-auto whitespace-pre-wrap font-mono">
                  {data.taf}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>ATIS data provided by <a href="https://atis.guru" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">atis.guru</a></p>
          <p className="mt-1">API: <a href={API_BASE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{API_BASE_URL}</a></p>
        </footer>
      </div>
    </div>
  );
}
