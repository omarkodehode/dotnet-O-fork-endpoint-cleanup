import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import absenceApi from "../../api/absenceApi"; 
import { toast } from "react-toastify";

export default function EditAbsence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    type: "Vacation", 
    description: "",
    approved: false
  });

  const absenceTypes = [
    "Vacation",
    "SickLeave",
    "SelfCertified",
    "ChildSick",
    "UnpaidLeave",
    "Other"
  ];

  useEffect(() => {
    const fetchAbsence = async () => {
      try {
        // ✅ 1. Correct Method Name
        const response = await absenceApi.getAbsence(id);
        const data = response.data || response; 

        const formatForInput = (dateStr) => {
           if (!dateStr) return "";
           // If backend sends min-date, show empty input
           if (dateStr.startsWith("0001") || dateStr.startsWith("0000")) {
             return "";
           }
           // Return YYYY-MM-DD
           return dateStr.split('T')[0];
        };

        setFormData({
          startDate: formatForInput(data.startDate),
          endDate: formatForInput(data.endDate),
          type: data.type || "Vacation",
          description: data.description || "",
          approved: data.approved || false
        });
      } catch (error) {
        console.error("Failed to fetch absence", error);
        toast.error("Could not load absence data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbsence();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 3. Client-Side Validation
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select a valid Start Date and End Date.");
      return;
    }

    try {
      // ✅ 4. Send Update
      await absenceApi.updateAbsence(id, {
        ...formData,
        // Send plain strings "YYYY-MM-DD"
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      toast.success("Absence updated successfully!");
      navigate("/admin/absences");
    } catch (error) {
      console.error("Update failed", error);
      const msg = error.response?.data?.message || "Failed to update absence.";
      toast.error(msg);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Absence</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* START DATE */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* END DATE */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* TYPE */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Absence Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          >
            {absenceTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Description / Reason</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            rows="3"
            placeholder="Optional details..."
          />
        </div>

        {/* APPROVED CHECKBOX */}
        <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded">
          <input
            type="checkbox"
            name="approved"
            checked={formData.approved}
            onChange={handleChange}
            id="approvedCheck"
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label htmlFor="approvedCheck" className="text-gray-700 font-medium cursor-pointer">
            Approve Request
          </label>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/absences")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}