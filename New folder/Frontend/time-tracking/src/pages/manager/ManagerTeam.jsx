import { useEffect, useState } from "react";
import managerApi from "../../api/managerApi";
import { Link } from "react-router-dom";

export default function ManagerTeam() {
  const [myTeam, setMyTeam] = useState([]);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await managerApi.getTeam();
      setMyTeam(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Team</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Position</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myTeam.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900">{e.fullName}</td>
                <td className="py-4 px-6 text-slate-600">{e.position}</td>
                <td className="py-4 px-6 text-slate-600">{e.department}</td>
                <td className="py-4 px-6 text-right">
                  <Link 
                    to={`/admin/employees/edit/${e.id}`} 
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline"
                  >
                    Edit Details
                  </Link>
                </td>
              </tr>
            ))}
            {myTeam.length === 0 && (
                <tr><td colSpan="4" className="py-8 text-center text-slate-400">No team members assigned.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}