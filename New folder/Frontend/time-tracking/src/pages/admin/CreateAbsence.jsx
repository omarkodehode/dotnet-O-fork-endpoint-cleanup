import { useState } from "react";
import { useNavigate } from "react-router-dom";
import absenceApi from "../../api/absenceApi";

export default function CreateAbsence() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: "", date: "", reason: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Ensure EmployeeId is an integer
      const payload = {
        ...form,
        employeeId: parseInt(form.employeeId)
      };
      
      await absenceApi.createAbsence(payload);
      navigate("/admin/absences");
    } catch (err) {
      console.error(err);
      setError("Failed to create absence. Verify the Employee ID exists.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Absence (Admin)</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <input
          type="number" 
          name="employeeId"
          placeholder="Employee ID"
          value={form.employeeId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="reason"
          placeholder="Reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <div className="flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/absences")}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}