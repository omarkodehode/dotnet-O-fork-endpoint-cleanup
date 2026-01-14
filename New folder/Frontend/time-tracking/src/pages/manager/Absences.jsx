import { useEffect, useState } from "react";
import absenceApi from "../../api/absenceApi";
import { useNavigate } from "react-router-dom";

export default function Absences() {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);
  const [error, setError] = useState("");

  const fetchAbsences = async () => {
    try {
      const res = await managerApi.getPendingAbsences();
      setAbsences(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load absences.");
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this absence?")) return;
    try {
      await absenceApi.deleteAbsence(id);
      setAbsences(prev => prev.filter(a => a.id !== id));
    } catch {
      setError("Failed to delete absence.");
    }
  };

  // Helper to format dates cleanly
  const formatDate = (dateString) => {
    if (!dateString || dateString.startsWith("0001")) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Absences</h1>
        <button
          onClick={() => navigate("/admin/absences/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Absence
        </button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              {["ID", "Employee", "Start Date", "End Date", "Type", "Approved", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2 border font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {absences && absences.length > 0 ? absences.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2">{a.id}</td>
                
             
                <td className="px-4 py-2 font-medium">
                  {a.employeeName || (a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : "Unknown")}
                </td>

                <td className="px-4 py-2">{formatDate(a.startDate)}</td>
                
                <td className="px-4 py-2">{formatDate(a.endDate)}</td>

                <td className="px-4 py-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {a.type || "Other"}
                  </span>
                </td>

                <td className="px-4 py-2">
                  {a.approved ? (
                    <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">Yes</span>
                  ) : (
                    <span className="text-yellow-600 font-bold text-sm bg-yellow-100 px-2 py-1 rounded">Pending</span>
                  )}
                </td>

                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/absences/edit/${a.id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No absences found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}