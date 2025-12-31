import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import employeeApi from "../../api/employeeApi";
import adminTimeApi from "../../api/adminTimeApi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    absencesToday: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
    fetchActive();
    fetchEmployees();
  }, []);

  const [employees, setEmployees] = useState([]);
  const [activeMap, setActiveMap] = useState({});
  const [logsMap, setLogsMap] = useState({});
  const [showLogs, setShowLogs] = useState({});

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getEmployees();
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchActive = async () => {
    try {
      const res = await adminTimeApi.getActive();
      // build map by userId for quick lookup
      const map = {};
      (res.data || []).forEach((it) => {
        if (it.userId) map[it.userId] = it;
      });
      setActiveMap(map);
    } catch (err) {
      console.error("Failed to fetch active shifts", err);
    }
  };

  const handleClockIn = async (userId) => {
    try {
      await adminTimeApi.clockInForUser(userId);
      await fetchActive();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Clock-in failed");
    }
  };

  const handleClockOut = async (userId) => {
    try {
      await adminTimeApi.clockOutForUser(userId);
      await fetchActive();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Clock-out failed");
    }
  };

  const fetchLogs = async (userId) => {
    try {
      const res = await adminTimeApi.getHistory(userId);
      setLogsMap((prev) => ({ ...prev, [userId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setLogsMap((prev) => ({ ...prev, [userId]: [] }));
    }
  };

  const toggleLogs = async (userId) => {
    const currently = !!showLogs[userId];
    if (!currently) await fetchLogs(userId);
    setShowLogs((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium mb-2">Total Employees</h2>
          <p className="text-2xl font-bold">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium mb-2">Active Employees</h2>
          <p className="text-2xl font-bold">{stats.activeEmployees}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium mb-2">Absences Today</h2>
          <p className="text-2xl font-bold">{stats.absencesToday}</p>
        </div>
      </div>
      {/* Check-in pad */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Check-in Pad</h2>
        <p className="text-sm text-gray-600 mb-4">Quickly clock employees in or out and view active shifts.</p>

        <div className="space-y-3">
          {employees.length === 0 && <p className="text-gray-500">No employees found.</p>}

          {employees.map((emp) => {
            const active = activeMap[emp.userId];
            return (
              <div key={emp.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{emp.fullName || emp.userId || emp.username}</div>
                  <div className="text-sm text-gray-500">{emp.position}</div>
                </div>

                <div className="flex items-center gap-3">
                  {active ? (
                    <>
                      <div className="text-sm text-gray-700">In: {new Date(active.clockIn).toLocaleString()}</div>
                      <button onClick={() => handleClockOut(emp.userId)} className="px-3 py-1 bg-red-500 text-white rounded">Clock Out</button>
                    </>
                  ) : (
                    <button onClick={() => handleClockIn(emp.userId)} className="px-3 py-1 bg-green-600 text-white rounded">Clock In</button>
                  )}
                  <button onClick={() => toggleLogs(emp.userId)} className="px-3 py-1 bg-gray-200 rounded">{showLogs[emp.userId] ? 'Hide Logs' : 'View Logs'}</button>
                </div>
                {showLogs[emp.userId] && (
                  <div className="mt-3 w-full">
                    <div className="text-sm text-gray-600 mb-2">Recent logs:</div>
                    <div className="space-y-2">
                      {(logsMap[emp.userId] || []).map((entry) => (
                        <div key={entry.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                          <div>
                            <div>Clock In: {new Date(entry.clockIn).toLocaleString()}</div>
                            <div>Clock Out: {entry.clockOut ? new Date(entry.clockOut).toLocaleString() : '—'}</div>
                          </div>
                          <div className="text-gray-500">#{entry.id}</div>
                        </div>
                      ))}
                      {((logsMap[emp.userId] || []).length === 0) && <div className="text-sm text-gray-500">No logs found.</div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
