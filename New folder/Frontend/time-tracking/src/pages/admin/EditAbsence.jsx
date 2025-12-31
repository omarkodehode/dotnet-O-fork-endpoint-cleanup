import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import absenceApi from "../../api/absenceApi";

export default function EditAbsence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: "", date: "", reason: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAbsence = async () => {
      try {
        const res = await absenceApi.getAbsence(id);
        setForm(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load absence.");
      }
    };
    fetchAbsence();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await absenceApi.updateAbsence(id, form);
      navigate("/admin/absences");
    } catch (err) {
      console.error(err);
      setError("Failed to update absence.");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Edit Absence</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <input
          name="employeeId"
          placeholder="Employee ID"
          value={form.employeeId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="date"
          type="date"
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
          <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            Save
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
    </AdminLayout>
  );
}
