import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider"; // ✅ FIX: Added { } for named import

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth(); // Now this should work correctly

  const ActionCard = ({ title, desc, icon, color, onClick }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group w-full text-center h-64 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
      {/* Icon Background opacity fix */}
      <div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform ${color.replace('bg-', 'text-').replace('600', '600')}`} 
        style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2 text-sm">{desc}</p>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome back, {auth?.user?.username || "Employee"}!</h1>
        <p className="text-lg text-slate-500">What would you like to handle today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <ActionCard 
          title="Time Clock" 
          desc="Clock in to start your shift or clock out to end it." 
          icon="⏱" 
          color="bg-indigo-600"
          onClick={() => navigate("/employee/clock-in-out")}
        />
        <ActionCard 
          title="Absences" 
          desc="Request time off or view your leave history." 
          icon="📅" 
          color="bg-emerald-600"
          onClick={() => navigate("/employee/absences")}
        />
      </div>
    </div>
  );
}