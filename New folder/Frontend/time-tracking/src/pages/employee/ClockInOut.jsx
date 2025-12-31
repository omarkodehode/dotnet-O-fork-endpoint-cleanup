import { useState } from "react";
// ✅ FIXED: Import from 'apiClient', not 'api'
import api from "../../api/apiClient"; 

export default function ClockInOut() {
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [message, setMessage] = useState("");

  const handleClock = async (type) => {
    try {
      // type will be "clockin" or "clockout"
      await api.post(`/employee/${type}`);
      setStatus("success");
      setMessage(type === "clockin" ? "You are now clocked in." : "You have clocked out. Have a good evening!");
    } catch (err) {
      setStatus("error");
      // Read specific error message from backend if available
      const errMsg = err.response?.data?.message || err.response?.data || "Action failed.";
      setMessage(errMsg);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Time Clock</h1>
      <p className="text-slate-500 text-center mb-10">Record your daily attendance.</p>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <button 
          onClick={() => handleClock("clockin")}
          className="h-40 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex flex-col items-center justify-center gap-3 hover:bg-emerald-100 hover:scale-105 transition-all group"
        >
          <span className="text-4xl group-hover:scale-110 transition-transform">☀️</span>
          <span className="text-emerald-800 font-bold text-lg">Clock In</span>
        </button>

        <button 
          onClick={() => handleClock("clockout")}
          className="h-40 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex flex-col items-center justify-center gap-3 hover:bg-indigo-100 hover:scale-105 transition-all group"
        >
          <span className="text-4xl group-hover:scale-110 transition-transform">🌙</span>
          <span className="text-indigo-800 font-bold text-lg">Clock Out</span>
        </button>
      </div>

      {status !== "idle" && (
        <div className={`p-4 rounded-xl text-center border ${status === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {message}
        </div>
      )}
    </div>
  );
}