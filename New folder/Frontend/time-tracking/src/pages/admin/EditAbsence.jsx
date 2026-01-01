import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import absenceApi from "../../api/absenceApi";

export default function EditAbsence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ date: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Fetch the absence details
    absenceApi.getAbsence(id)
      .then((res) => {
        // Format date to YYYY-MM-DD for the input
        const dateStr = new Date(res.data.date).toISOString().split('T')[0];
        setForm({
          date: dateStr,
          reason: res.data.reason
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load absence.");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await absenceApi.updateAbsence(id, form);
      navigate("/admin/absences");
    } catch (err) {
      console.error(err);
      setError("Failed to update absence.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Absence</h1>
      
      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            required
            className="w-full p-2 border rounded-lg"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-lg"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
            Save Changes
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/admin/absences")} 
            className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}