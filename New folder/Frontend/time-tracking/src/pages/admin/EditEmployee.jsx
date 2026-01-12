import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import employeeApi from "../../api/employeeApi";
import { getDepartments } from "../../api/departmentApi"; // ✅ Import

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]); // For Manager dropdown
  
  const [form, setForm] = useState({ 
    fullName: "", 
    position: "", 
    departmentId: "", // ✅ Add ID
    managerId: ""     // ✅ Add Manager
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Load Departments
    getDepartments().then(setDepartments).catch(console.error);

    // 2. Load All Employees (to select a manager)
    employeeApi.getAll().then(setEmployees).catch(console.error);

    // 3. Load Current Employee Data
    employeeApi.getById(id)
      .then(res => {
        setForm({
          fullName: res.fullName || "",
          position: res.position || "",
          departmentId: res.departmentId || "", // ✅ Load existing
          managerId: res.managerId || ""       // ✅ Load existing
        });
      })
      .catch(() => setError("Failed to load employee data."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Convert empty strings to null before sending
      const payload = {
        ...form,
        departmentId: form.departmentId ? parseInt(form.departmentId) : null,
        managerId: form.managerId ? parseInt(form.managerId) : null
      };
      
      await employeeApi.update(id, payload);
      navigate("/admin/employees");
    } catch (err) {
      console.error(err);
      setError("Failed to update employee.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      {error && <p className="mb-4 text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={form.fullName}
            onChange={e => setForm({...form, fullName: e.target.value})}
            required
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Position / Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={form.position}
            onChange={e => setForm({...form, position: e.target.value})}
          />
        </div>

        {/* ✅ Department Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Department</label>
          <select
            className="w-full p-2 border rounded"
            value={form.departmentId}
            onChange={e => setForm({...form, departmentId: e.target.value})}
          >
            <option value="">-- No Department --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* ✅ Manager Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Manager</label>
          <select
            className="w-full p-2 border rounded"
            value={form.managerId}
            onChange={e => setForm({...form, managerId: e.target.value})}
          >
            <option value="">-- No Manager --</option>
            {employees
              .filter(emp => emp.id !== parseInt(id)) // Don't let them be their own manager
              .map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Save Changes</button>
          <button type="button" onClick={() => navigate("/admin/employees")} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}