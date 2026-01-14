
import { useEffect, useState } from "react";
import managerApi from "../../api/managerApi";

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("hours");
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [teamSummary, setTeamSummary] = useState([]);
  const [pendingAbsences, setPendingAbsences] = useState([]);

  const [myTeam, setMyTeam] = useState([]);
  const [absenceForm, setAbsenceForm] = useState({ employeeId: "", startDate: "", endDate: "", type: "Vacation", description: "" });

  useEffect(() => {
    if (activeTab === "hours") fetchSummary();
    if (activeTab === "absences") fetchAbsences();
    if (activeTab === "createAbsence") fetchTeam();
  }, [activeTab, currentWeek, currentYear]);

  const fetchSummary = async () => {
    try {
      const res = await managerApi.getWeeklySummary(currentYear, currentWeek);
      setTeamSummary(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAbsences = async () => {
    try {
      const res = await managerApi.getPendingAbsences();
      setPendingAbsences(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTeam = async () => {
    try {
      const res = await managerApi.getTeam();
      setMyTeam(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApproveWeek = async (empId) => {
    if (!window.confirm("Lock this week for this employee?")) return;
    try {
      await managerApi.approveWeek(empId, currentYear, currentWeek);
      fetchSummary();
    } catch (err) { alert("Failed to approve."); }
  };

  const handleAbsenceDecision = async (id, approved) => {
    try {
      await managerApi.toggleAbsenceApproval(id, approved);
      fetchAbsences();
    } catch (err) { alert("Action failed."); }
  };

  const handleCreateAbsence = async (e) => {
    e.preventDefault();
    try {
      await managerApi.createAbsence({
        ...absenceForm,
        employeeId: parseInt(absenceForm.employeeId)
      });
      alert("Absence Created!");
      setAbsenceForm({ employeeId: "", startDate: "", endDate: "", type: "Vacation", description: "" });
    } catch (err) {
      alert("Failed to create absence. Check dates.");
    }
  };

  const handleExport = async () => {
    const month = prompt("Enter month number (1-12):", new Date().getMonth() + 1);
    if (!month) return;
    try {
      const res = await managerApi.exportPayroll(currentYear, month);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll-${currentYear}-${month}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) { alert("Export failed."); }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Manager Dashboard</h1>

      <div className="flex space-x-4 mb-8 border-b border-slate-200 pb-1">
        <button onClick={() => setActiveTab("hours")} className={`pb-2 px-4 font-medium ${activeTab === "hours" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"}`}>
          Review Hours
        </button>
        <button onClick={() => setActiveTab("absences")} className={`pb-2 px-4 font-medium ${activeTab === "absences" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"}`}>
          Approve Absences
        </button>
        <button onClick={() => setActiveTab("createAbsence")} className={`pb-2 px-4 font-medium ${activeTab === "createAbsence" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"}`}>
          Record Absence
        </button>
        <button onClick={handleExport} className="pb-2 px-4 font-medium text-emerald-600 hover:text-emerald-700 ml-auto">
          📥 Export Payroll
        </button>
      </div>

      {activeTab === "hours" && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold">Week {currentWeek} / {currentYear}</h2>
            <button onClick={() => setCurrentWeek(p => p - 1)} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">Prev</button>
            <button onClick={() => setCurrentWeek(p => p + 1)} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">Next</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500 text-sm">
                <th className="py-2">Employee</th>
                <th className="py-2">Total Hours</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {teamSummary.map(s => (
                <tr key={s.employeeId} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-4 font-medium">{s.name}</td>
                  <td className="py-4">{s.totalHours}h</td>
                  <td className="py-4">
                    {s.isApproved
                      ? <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">APPROVED</span>
                      : <span className="text-amber-600 text-xs font-bold bg-amber-100 px-2 py-1 rounded">OPEN</span>}
                  </td>
                  <td className="py-4 text-right">
                    {!s.isApproved && (
                      <button
                        onClick={() => handleApproveWeek(s.employeeId)}
                        className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        Approve Week
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {teamSummary.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-slate-500">No data for this week.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "absences" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-6">Pending Absence Requests</h2>
          <div className="space-y-4">
            {pendingAbsences.filter(a => !a.approved).map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900">{a.employeeName}</p>
                  <p className="text-sm text-slate-500">{a.type}: {new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-400 italic">"{a.description}"</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAbsenceDecision(a.id, true)} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded font-bold hover:bg-emerald-200">Approve</button>
                  <button onClick={() => handleAbsenceDecision(a.id, false)} className="bg-rose-100 text-rose-700 px-3 py-1 rounded font-bold hover:bg-rose-200">Reject</button>
                </div>
              </div>
            ))}
            {pendingAbsences.filter(a => !a.approved).length === 0 && <p className="text-slate-500">No pending requests.</p>}
          </div>
        </div>
      )}

      {activeTab === "createAbsence" && (
        <div className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-6">Record Absence for Team Member</h2>
          <form onSubmit={handleCreateAbsence} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Employee</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={absenceForm.employeeId}
                onChange={e => setAbsenceForm({ ...absenceForm, employeeId: e.target.value })}
              >
                <option value="">-- Choose --</option>
                {myTeam.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" required className="w-full p-2 border rounded"
                value={absenceForm.startDate} onChange={e => setAbsenceForm({ ...absenceForm, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" required className="w-full p-2 border rounded"
                value={absenceForm.endDate} onChange={e => setAbsenceForm({ ...absenceForm, endDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full p-2 border rounded"
                value={absenceForm.type} onChange={e => setAbsenceForm({ ...absenceForm, type: e.target.value })}>
                <option value="Vacation">Vacation</option>
                <option value="SickLeave">Sick Leave</option>
                <option value="SelfCertified">Self Certified</option>
                <option value="ChildSick">Child Sick</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input type="text" className="w-full p-2 border rounded"
                value={absenceForm.description} onChange={e => setAbsenceForm({ ...absenceForm, description: e.target.value })} />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">Save Absence</button>
          </form>
        </div>
      )}
    </div>
  );
}