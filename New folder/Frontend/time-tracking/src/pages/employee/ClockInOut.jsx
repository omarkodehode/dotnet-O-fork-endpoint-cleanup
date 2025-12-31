import { useState, useEffect } from "react";
import api from "../../api/api";

export default function ClockInOut() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const clockIn = async () => {
    setLoading(true);
    try {
      await api.post("/clockin/1"); // replace 1 with employeeId from login
      setStatus("Clocked In successfully!");
    } catch (err) {
      setStatus(err.response?.data || "Error clocking in");
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    setLoading(true);
    try {
      await api.post("/clockout/1");
      setStatus("Clocked Out successfully!");
    } catch (err) {
      setStatus(err.response?.data || "Error clocking out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clock In / Clock Out</h1>
      {status && <p className="mb-4 text-green-600">{status}</p>}

      <div className="flex gap-4">
        <button
          onClick={clockIn}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white p-4 rounded hover:bg-blue-700"
        >
          Clock In
        </button>
        <button
          onClick={clockOut}
          disabled={loading}
          className="flex-1 bg-red-600 text-white p-4 rounded hover:bg-red-700"
        >
          Clock Out
        </button>
      </div>
    </div>
  );
}
