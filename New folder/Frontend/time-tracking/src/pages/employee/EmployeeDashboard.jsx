import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import timeEntryApi from "../../api/timeEntryApi";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flexBalance, setFlexBalance] = useState(0);

  useEffect(() => {
    // Fetch Flex Balance on load
    timeEntryApi.getFlexBalance()
      .then(res => setFlexBalance(res.data.flexHours))
      .catch(err => console.error("Failed to load flex balance", err));
  }, []);

  const ActionCard = ({ title, desc, icon, color, onClick, extraInfo }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group w-full text-center h-64 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
      <div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform ${color.replace('bg-', 'text-').replace('600', '600')}`} 
        style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2 text-sm">{desc}</p>
      {extraInfo && <div className="mt-4">{extraInfo}</div>}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome back, {user?.username || "Employee"}!</h1>
        <p className="text-lg text-slate-500">Here is your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Time Clock */}
        <ActionCard 
          title="Time Clock" 
          desc="Clock in/out & view history." 
          icon="⏱" 
          color="bg-indigo-600"
          onClick={() => navigate("/employee/clock-in-out")}
        />

        {/* Absences */}
        <ActionCard 
          title="Absences" 
          desc="Request leave & view status." 
          icon="📅" 
          color="bg-emerald-600"
          onClick={() => navigate("/employee/absences")}
        />

        {/* ✅ NEW: Flex Balance Card */}
        <ActionCard 
          title="Flex Balance" 
          desc="Your current +/- hours." 
          icon="⚖️" 
          color={flexBalance >= 0 ? "bg-blue-600" : "bg-amber-500"}
          onClick={() => {}} // No navigation needed
          extraInfo={
            <span className={`text-2xl font-mono font-bold ${flexBalance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
              {flexBalance > 0 ? "+" : ""}{flexBalance}h
            </span>
          }
        />
      </div>
    </div>
  );
}