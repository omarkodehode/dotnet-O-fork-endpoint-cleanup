import { useEffect, useState } from "react";
import employeeApi from "../../api/employeeApi";

export default function EmployeeDashboard() {
  const [absences, setAbsences] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [error, setError] = useState("");

  const fetchAbsences = async () => {
    try {
      const res = await employeeApi.getOwnAbsences();
      setAbsences(res);
    } catch {
      setError("Failed to load absences.");
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleClockInOut = async () => {
    try {
      if (clockedIn) await employeeApi.clockOut();
      else await employeeApi.clockIn();
      setClockedIn(!clockedIn);
    } catch {
      setError("Failed to update clock.");
    }
  };

  const handleAddAbsence = async () => {
    const reason = prompt("Enter absence reason:");
    if (!reason) return;
    try {
      await employeeApi.createAbsence({ date: new Date(), reason });
      fetchAbsences();
    } catch {
      setError("Failed to add absence.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-4">
        <button
          onClick={handleClockInOut}
          className={`flex-1 py-2 rounded text-white font-semibold ${
            clockedIn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {clockedIn ? "Clock Out" : "Clock In"}
        </button>
        <button
          onClick={handleAddAbsence}
          className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          Add Absence
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">My Absences</h2>
        <ul className="divide-y">
          {absences.length > 0 ? absences.map(a => (
            <li key={a.id} className="py-2 flex justify-between">
              <span>{new Date(a.date).toLocaleDateString()}</span>
              <span>{a.reason}</span>
            </li>
          )) : (
            <li className="py-2 text-center text-gray-500">No absences recorded.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
