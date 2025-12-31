import React from "react";

export default function Navbar({ setSidebarOpen }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between bg-white shadow px-6 h-16">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="text-xl font-bold">Admin Panel</div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
      >
        Logout
      </button>
    </div>
  );
}
