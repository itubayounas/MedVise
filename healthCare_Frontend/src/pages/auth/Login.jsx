import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login as loginApi } from "../../api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [show, setShow]       = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const dashMap               = { patient: "/patient", doctor: "/doctor", admin: "/admin" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.token, data.role, { name: data.name });
      toast.success("Welcome back! 👋");
      navigate(dashMap[data.role] || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="blob w-[500px] h-[500px] bg-sage-300   top-[-100px] left-[-150px] animate-drift"      style={{position:"fixed"}} />
      <div className="blob w-[400px] h-[400px] bg-cream-300  bottom-[-50px] right-[-100px] animate-drift-slow" style={{position:"fixed"}} />
      <div className="blob w-[300px] h-[300px] bg-sage-200   bottom-1/3 left-1/3 animate-float"             style={{position:"fixed"}} />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-4 text-4xl border border-cream-200">
            🌿
          </div>
          <h1 className="font-display text-4xl font-bold text-charcoal-900">MedVise</h1>
          <p className="text-sage-600 mt-1 font-body">Your healthcare & wellness companion</p>
        </div>

        <div className="card shadow-xl border-cream-200">
          <h2 className="font-display text-2xl font-semibold text-charcoal-900 mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <i className="fa-solid fa-envelope text-sage-400 mr-1.5"></i>Email address
              </label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">
                <i className="fa-solid fa-lock text-sage-400 mr-1.5"></i>Password
              </label>
              <div className="relative">
                <input type={show ? "text" : "password"} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600">
                  <i className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Signing in…</>
                : <><i className="fa-solid fa-right-to-bracket mr-2"></i>Sign in</>}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-sage-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-sage-700 font-semibold hover:underline">Register here</Link>
          </p>
        </div>

        <p className="text-center text-xs text-sage-400 mt-4">
          🔒 Secured with JWT authentication
        </p>
      </div>
    </div>
  );
}