import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Employees", path: "/admin/employees" },
    { name: "Create Employee", path: "/admin/employees/create" },
    { name: "Absences", path: "/admin/absences" },
    { name: "Create Absence", path: "/admin/absences/create" },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 transform md:translate-x-0 transition-transform duration-300 z-50 ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:relative`}
    >
      <div className="p-6 text-2xl font-bold border-b border-gray-700">Time Tracker</div>

      <nav className="mt-4 flex flex-col">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`px-6 py-3 hover:bg-gray-700 transition-colors ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
