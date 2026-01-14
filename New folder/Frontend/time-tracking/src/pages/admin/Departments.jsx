import { useState, useEffect } from "react";
import departmentApi from "../../api/departmentApi"; // ✅ Default import

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDept, setNewDept] = useState("");
  // Track expanded department for viewing team details
  const [expandedDeptId, setExpandedDeptId] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getDepartments();
      // Ensure we handle the data correctly whether it comes as res.data or direct array
      const data = Array.isArray(res) ? res : (res.data || []);
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await departmentApi.createDepartment({ name: newDept });
      setNewDept("");
      setShowForm(false);
      loadDepartments();
    } catch (err) {
      alert("Failed to create department. Name might already exist.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This department must be empty to delete.")) return;
    try {
      await departmentApi.deleteDepartment(id);
      loadDepartments();
    } catch (err) {
      alert("Could not delete. Ensure no employees are assigned to it.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedDeptId(expandedDeptId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          {showForm ? "Close" : "+ Add Department"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded shadow flex gap-4">
          <input 
            className="flex-1 p-2 border rounded"
            placeholder="Department Name"
            value={newDept}
            onChange={e => setNewDept(e.target.value)}
            required
          />
          <button type="submit" className="bg-green-600 text-white px-6 rounded font-bold">Save</button>
        </form>
      )}

      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center p-6 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                <p className="text-sm text-slate-500">{dept.employeeCount} Employees</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => toggleExpand(dept.id)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    {expandedDeptId === dept.id ? "Hide Team" : "View Team ▼"}
                </button>
                <button 
                    onClick={() => handleDelete(dept.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                    Delete
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedDeptId === dept.id && (
              <div className="p-6 bg-white border-t border-slate-100">
                {dept.employees && dept.employees.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Position</th>
                        <th className="pb-2 font-medium">Manager</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {dept.employees.map(emp => (
                        <tr key={emp.id}>
                          <td className="py-3 font-medium text-slate-700">{emp.fullName}</td>
                          <td className="py-3 text-slate-500">{emp.position}</td>
                          <td className="py-3 text-slate-500">
                            {emp.managerName !== "-" ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    {emp.managerName}
                                </span>
                            ) : <span className="text-slate-300 italic">None</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-slate-400 italic">No employees found in this department.</p>}
              </div>
            )}
          </div>
        ))}
        {departments.length === 0 && !showForm && (
            <p className="text-center text-slate-500 py-10">No departments found.</p>
        )}
      </div>
    </div>
  );
}