import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import employeeApi from "../../api/employeeApi";
import adminTimeApi from "../../api/adminTimeApi";
import { useAuth } from "../../context/AuthProvider";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({});
  const { user } = useAuth();
  const isManager = user?.role?.toLowerCase() === "manager";

  const fetchEmployees = async () => {
    try {
      const data = await employeeApi.getAll();

      // ✅ SAFETY CHECK: Only set state if we received an array
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.warn("API returned non-array data:", data);
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to load employees", err);
      // Optional: setEmployees([]) here too if you want to be extra safe
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleAdminClock = async (userId, action) => {
    if (!userId) return alert("This employee has no linked User Account.");

    setLoading(prev => ({ ...prev, [userId]: true }));
    try {
      if (action === "in") await adminTimeApi.clockInUser(userId);
      else await adminTimeApi.clockOutUser(userId);
      alert(`Success: User ${action === "in" ? "Clocked In" : "Clocked Out"}`);
    } catch (err) {
      alert(err.response?.data?.message || "Action Failed");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await employeeApi.delete(id);
      fetchEmployees();
    } catch {
      alert("Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        {!isManager && (
          <Link to="/admin/employees/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200">
            + Add Employee
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Position</th>
              <th className="px-6 py-4 text-center">Quick Actions</th>
              <th className="px-6 py-4 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* ✅ CHECK: Ensure employees is valid before mapping */}
            {Array.isArray(employees) && employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{emp.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">{emp.position || "-"}</td>

                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleAdminClock(emp.userId, "in")}
                      disabled={loading[emp.userId]}
                      className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50"
                    >
                      In
                    </button>
                    <button
                      onClick={() => handleAdminClock(emp.userId, "out")}
                      disabled={loading[emp.userId]}
                      className="px-3 py-1 text-xs font-bold bg-slate-50 text-slate-700 rounded hover:bg-slate-100 border border-slate-200 disabled:opacity-50"
                    >
                      Out
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right space-x-3">
                    <Link to={`/admin/employees/edit/${emp.id}`} className="text-indigo-600 hover:underline text-sm font-medium">Edit</Link>
                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}