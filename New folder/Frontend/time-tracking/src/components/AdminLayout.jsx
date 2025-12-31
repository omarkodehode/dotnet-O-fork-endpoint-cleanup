import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 1. Render Sidebar Fixed on Left */}
      <Sidebar />

      {/* 2. Main Content Area (pushed right by 64 tailwind units to clear sidebar) */}
      <div className="ml-64 flex flex-col min-h-screen">
        <Navbar />
        
        {/* 3. The Outlet is where the actual Page (Dashboard/Employees) appears */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}