import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import employeeApi from "../../api/employeeApi";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", position: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    // Load existing data
    employeeApi.getById(id)
      .then(res => {
        setForm({
          fullName: res.fullName || "",
          position: res.position || ""
        });
      })
      .catch(() => setError("Failed to load employee data."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send PUT request
      await employeeApi.update(id, form);
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Position</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={form.position}
            onChange={e => setForm({...form, position: e.target.value})}
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Save Changes</button>
          <button type="button" onClick={() => navigate("/admin/employees")} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}