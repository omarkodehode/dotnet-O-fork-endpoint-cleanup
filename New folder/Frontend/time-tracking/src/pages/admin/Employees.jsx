import { useEffect, useState } from "react";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import employeeApi from "../../api/employeeApi";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await employeeApi.getEmployees();
      // axios returns response object; ensure data extraction
      setEmployees(res.data ?? res);
    } catch (err) {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await employeeApi.deleteEmployee(id);
      setSuccess("Employee deleted");
      fetchEmployees();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete employee.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
        <div>
          <button
            onClick={() => navigate("/admin/employees/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Employee
          </button>
        </div>
      </div>

      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <div className="bg-white p-4 rounded shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Position</th>
                <th className="py-2">UserId</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">No employees found.</td>
                </tr>
              )}
              {employees.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2">{e.id}</td>
                  <td className="py-2">{e.fullName ?? e.name ?? "-"}</td>
                  <td className="py-2">{e.position ?? "-"}</td>
                  <td className="py-2">{e.userId ?? "-"}</td>
                  <td className="py-2">
                    <button
                      onClick={() => navigate(`/admin/employees/edit/${e.id}`)}
                      className="mr-2 text-sm px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
