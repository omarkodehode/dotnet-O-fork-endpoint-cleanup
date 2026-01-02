import { useEffect, useState } from "react";
import logApi from "../../api/logApi";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    logApi.getAll()
      .then(res => setLogs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600">
                  {new Date(log.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{log.employee}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.type === "Absence" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}