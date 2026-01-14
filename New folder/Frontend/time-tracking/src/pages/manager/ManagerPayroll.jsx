import { useEffect, useState } from "react";
// ✅ FIX: Named imports
import { getTeam, exportPayroll } from "../../api/managerApi";

export default function ManagerPayroll() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      // ✅ FIX: Direct function call
      const res = await getTeam();
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to load team");
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      const empId = selectedEmployee ? parseInt(selectedEmployee) : null;
      
      // ✅ FIX: Direct function call
      const res = await exportPayroll(year, month, empId);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const empName = selectedEmployee 
        ? employees.find(e => e.id === empId)?.fullName.replace(/\s+/g, '_') 
        : "ALL_TEAM";
        
      link.setAttribute('download', `Payroll_${year}_${month}_${empName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export payroll.");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Payroll Export</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <form onSubmit={handleExport} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={e => setYear(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Month</label>
              <select 
                value={month} 
                onChange={e => setMonth(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Export All Team Members --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Leave blank to export the entire team's payroll.
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex justify-center gap-2"
          >
            <span>📥</span> Download CSV
          </button>
        </form>
      </div>
    </div>
  );
}