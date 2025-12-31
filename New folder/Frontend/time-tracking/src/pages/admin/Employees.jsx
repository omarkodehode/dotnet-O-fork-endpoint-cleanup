import { useEffect, useState } from "react";
import employeeApi from "../../api/employeeApi";
import { useNavigate } from "react-router-dom";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    employeeApi.getAll().then((res) => setEmployees(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
          <p className="text-slate-500 text-sm mt-1">Manage users, roles, and details.</p>
        </div>
        <button
          onClick={() => navigate("/admin/employees/create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <span>+</span> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role/Position</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hire Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {e.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{e.fullName}</p>
                      <p className="text-xs text-slate-500">ID: #{e.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {e.position || "Staff"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(e.hireDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition-colors mr-3">Edit</button>
                  <button className="text-slate-400 hover:text-rose-600 font-medium text-sm transition-colors">Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-12 text-slate-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}