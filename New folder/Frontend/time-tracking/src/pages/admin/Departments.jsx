import { useState, useEffect } from "react";
import { getDepartments, createDepartment, deleteDepartment } from "../../api/departmentApi";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  // Load departments on page load
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createDepartment(newDept);
      setNewDept({ name: "", description: "" });
      setShowForm(false);
      loadDepartments(); // Refresh list
    } catch (err) {
      setError("Failed to create department. Name might already exist.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDepartment(id);
      loadDepartments();
    } catch (err) {
      alert("Could not delete. Check if employees are assigned to it.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? "Close Form" : "+ Add Department"}
        </button>
      </div>

      {/* --- CREATE FORM --- */}
      {showForm && (
        <div className="bg-white p-4 mb-6 rounded shadow border border-gray-200 max-w-lg">
          <h2 className="text-lg font-semibold mb-3">New Department</h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input 
                type="text" required 
                className="w-full p-2 border rounded"
                value={newDept.name}
                onChange={e => setNewDept({...newDept, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={newDept.description}
                onChange={e => setNewDept({...newDept, description: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Save Department
            </button>
          </form>
        </div>
      )}

      {/* --- DEPARTMENTS LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{dept.name}</h3>
                <p className="text-sm text-gray-500">{dept.description}</p>
              </div>
              <button 
                onClick={() => handleDelete(dept.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
              <span className="font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {dept.employeeCount} Employees
              </span>
            </div>
          </div>
        ))}

        {departments.length === 0 && !showForm && (
          <p className="text-gray-500 col-span-full text-center py-10">No departments found. Create one!</p>
        )}
      </div>
    </div>
  );
}