import { useState, useEffect } from "react";
import api from "../../api/apiClient";

export default function ClockInOut() {
  const [status, setStatus] = useState("Loading...");
  const [lastTime, setLastTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check status on load
  const fetchStatus = async () => {
    try {
      const res = await api.get("/employee/status");
      setStatus(res.data.status); // "Clocked In" or "Clocked Out"
      if (res.data.startTime) setLastTime(res.data.startTime);
    } catch (err) {
      console.error(err);
      setStatus("Unknown");
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleClock = async (endpoint) => {
    setLoading(true);
    setMessage("");
    try {
      await api.post(`/employee/${endpoint}`);
      await fetchStatus(); // Refresh status after action
      setMessage(endpoint === "clockin" ? "Successfully Clocked In!" : "Successfully Clocked Out!");
    } catch (err) {
      const msg = err.response?.data?.message || "Action failed.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = status === "Clocked In";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Time Clock</h1>
        
        {/* Status Pill */}
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-6 ${
          isClockedIn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}>
          {status}
        </div>

        {/* Time Display */}
        {isClockedIn && lastTime && (
          <div className="mb-8">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Started At</p>
            <p className="text-2xl font-mono text-slate-700">
              {new Date(lastTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        )}

        {/* Action Button */}
        {status !== "Loading..." && (
          <button 
            onClick={() => handleClock(isClockedIn ? "clockout" : "clockin")}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform active:scale-95 ${
              isClockedIn 
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {loading ? "Processing..." : (isClockedIn ? "Clock Out" : "Clock In")}
          </button>
        )}

        {message && (
          <p className="mt-4 text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}