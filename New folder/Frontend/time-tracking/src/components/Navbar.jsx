import { useAuth } from "../context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Left side (Breadcrumb or Title placeholder) */}
      <div className="text-slate-400 text-sm font-medium">
        Application / <span className="text-slate-800">Overview</span>
      </div>

      {/* Right side (User Profile & Logout) */}
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-900">{user?.username || "User"}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role || "Guest"}</p>
        </div>
        <button 
          onClick={logout} 
          className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-rose-200"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}