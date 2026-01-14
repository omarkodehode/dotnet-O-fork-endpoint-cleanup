import { useEffect, useState } from "react";
import managerApi from "../../api/managerApi";

export default function ManagerEmployees() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // 👇 Fix: Use managerApi.getTeam() instead of employeeApi.getAll()
    managerApi.getTeam()
      .then(setEmployees)
      .catch((err) => setError("Failed to load team members."));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Team</h1>
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Position</th>
              <th className="p-4 border-b">Department</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">{emp.fullName}</td>
                  <td className="p-4 border-b">{emp.position || "-"}</td>
                  <td className="p-4 border-b">{emp.department?.name || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No employees found in your team.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}