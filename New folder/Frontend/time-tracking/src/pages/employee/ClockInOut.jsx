import { useState, useEffect } from "react";
import api from "../../api/apiClient";

export default function ClockInOut() {
  const [status, setStatus] = useState("Loading...");
  const [lastActionTime, setLastActionTime] = useState(null);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      const res = await api.get("/api/employee/status");
      // ✅ FIX: Matches Backend (clockIn)
      setStatus(res.data.isClockedIn ? "Clocked In" : "Clocked Out");
      setLastActionTime(res.data.clockIn);
    } catch (err) {
      console.error(err);
      setStatus("Error loading status");
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleClockIn = async () => {
    setError("");
    try {
      const res = await api.post("/api/employee/clockin");
      setStatus("Clocked In");
      // ✅ FIX: Matches Backend DTO
      setLastActionTime(res.data.clockIn);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    setError("");
    try {
      const res = await api.post("/api/employee/clockout");
      setStatus("Clocked Out");
      // ✅ FIX: Matches Backend DTO
      setLastActionTime(res.data.clockOut);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clock out");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-center">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Time Clock</h1>

      <div className={`text-lg font-semibold mb-6 py-2 px-4 rounded-lg inline-block ${status === "Clocked In" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}>
        {status}
      </div>

      {lastActionTime && (
        <p className="text-sm text-slate-500 mb-6">
          Last Action: <span className="font-mono">{new Date(lastActionTime).toLocaleString()}</span>
        </p>
      )}

      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleClockIn}
          disabled={status === "Clocked In"}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-200"
        >
          Clock In
        </button>
        <button
          onClick={handleClockOut}
          disabled={status === "Clocked Out"}
          className="bg-rose-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-rose-200"
        >
          Clock Out
        </button>
      </div>
    </div>
  );
}