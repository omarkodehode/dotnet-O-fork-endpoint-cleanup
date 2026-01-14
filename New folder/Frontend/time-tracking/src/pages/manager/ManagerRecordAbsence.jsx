import { useEffect, useState } from "react";
// ✅ FIX: Named imports
import { getTeam, createAbsence } from "../../api/managerApi";

export default function ManagerRecordAbsence() {
  const [myTeam, setMyTeam] = useState([]);
  const [absenceForm, setAbsenceForm] = useState({ 
    employeeId: "", 
    startDate: "", 
    endDate: "", 
    type: "Vacation", 
    description: "" 
  });

  useEffect(() => {
    // ✅ FIX: Direct function call
    getTeam().then(res => setMyTeam(res.data)).catch(console.error);
  }, []);

  const handleCreateAbsence = async (e) => {
    e.preventDefault();
    try {
      // ✅ FIX: Direct function call
      await createAbsence({
        ...absenceForm,
        employeeId: parseInt(absenceForm.employeeId)
      });
      alert("Absence Created Successfully!");
      setAbsenceForm({ employeeId: "", startDate: "", endDate: "", type: "Vacation", description: "" });
    } catch (err) {
      alert("Failed to create absence. Please check dates and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Record Absence</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Register Time Off for Team Member</h2>
        <form onSubmit={handleCreateAbsence} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Employee</label>
            <select
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={absenceForm.employeeId}
              onChange={e => setAbsenceForm({ ...absenceForm, employeeId: e.target.value })}
            >
              <option value="">-- Choose Employee --</option>
              {myTeam.map(e => (
                <option key={e.id} value={e.id}>{e.fullName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
              <input 
                type="date" 
                required 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={absenceForm.startDate} 
                onChange={e => setAbsenceForm({ ...absenceForm, startDate: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
              <input 
                type="date" 
                required 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={absenceForm.endDate} 
                onChange={e => setAbsenceForm({ ...absenceForm, endDate: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Absence Type</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={absenceForm.type} 
              onChange={e => setAbsenceForm({ ...absenceForm, type: e.target.value })}
            >
              <option value="Vacation">Vacation</option>
              <option value="SickLeave">Sick Leave</option>
              <option value="SelfCertified">Self Certified</option>
              <option value="ChildSick">Child Sick</option>
              <option value="UnpaidLeave">Unpaid Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
            <textarea 
              rows="3"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Reason for absence..."
              value={absenceForm.description} 
              onChange={e => setAbsenceForm({ ...absenceForm, description: e.target.value })} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-transform active:scale-95 shadow-lg shadow-indigo-200"
          >
            Save Absence Record
          </button>
        </form>
      </div>
    </div>
  );
}