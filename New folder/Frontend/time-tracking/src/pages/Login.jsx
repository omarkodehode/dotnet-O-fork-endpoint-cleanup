import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Perform Login
      await login(form.username, form.password);
      
      // 2. Check Role directly from storage (since state updates are async)
      const user = JSON.parse(localStorage.getItem("user"));
      
      // 3. Redirect based on Role
      if (user?.role === "employee") {
        navigate("/employee/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side (Dark) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Enterprise<br/>Time Tracking.</h1>
          <p className="text-slate-400 text-lg">Streamline attendance, manage shifts, and boost productivity with our next-gen platform.</p>
        </div>
      </div>
      
      {/* Right Side (Light) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                className="input-field" 
                autoFocus 
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
            <button className="w-full btn-primary py-3">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}