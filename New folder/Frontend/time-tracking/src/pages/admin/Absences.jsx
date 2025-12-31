import { useEffect, useState } from "react";
import absenceApi from "../../api/absenceApi";
import { useNavigate } from "react-router-dom";

export default function Absences() {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);
  const [error, setError] = useState("");

  const fetchAbsences = async () => {
    try {
      const res = await absenceApi.getAbsences();
      setAbsences(res);
    } catch {
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
      setAbsences(absences.filter(a => a.id !== id));
    } catch {
      setError("Failed to delete absence.");
    }
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

      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              {["ID", "Employee", "Date", "Reason", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2 border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {absences.length > 0 ? absences.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{a.id}</td>
                <td className="px-4 py-2">{a.employeeName}</td>
                <td className="px-4 py-2">{new Date(a.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{a.reason}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/absences/edit/${a.id}`)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No absences found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
