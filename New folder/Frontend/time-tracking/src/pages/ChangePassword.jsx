import { useState } from "react";
import { changePassword } from "../api/auth";

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(form);
      setMsg({ type: "success", text: "Password changed successfully!" });
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMsg({ type: "error", text: "Failed to change password. Check current password." });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow border border-slate-200 mt-10">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      {msg.text && (
        <div className={`p-3 mb-4 rounded ${msg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input type="password" required className="w-full p-2 border rounded"
            value={form.currentPassword}
            onChange={e => setForm({...form, currentPassword: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input type="password" required className="w-full p-2 border rounded"
            value={form.newPassword}
            onChange={e => setForm({...form, newPassword: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Update Password
        </button>
      </form>
    </div>
  );
}