import { useState, useEffect } from "react";
import api from "../../api/api";

export default function EmployeeAbsences() {
  const [absences, setAbsences] = useState([]);
  const [form, setForm] = useState({ date: "", reason: "" });
  const [error, setError] = useState("");

  const employeeId = 1; // replace with logged-in employee ID

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const res = await api.get(`/absence/employee/${employeeId}`);
      setAbsences(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/absence/${employeeId}`, form);
      setForm({ date: "", reason: "" });
      fetchAbsences();
    } catch (err) {
      setError(err.response?.data || "Failed to create absence");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Absences</h1>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded shadow">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="reason"
            placeholder="Reason"
            value={form.reason}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Absence
        </button>
      </form>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Absence History</h2>
        <ul className="divide-y">
          {absences.map((a) => (
            <li key={a.id} className="py-2 flex justify-between">
              <span>{new Date(a.date).toLocaleDateString()}</span>
              <span>{a.reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
