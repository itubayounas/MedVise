import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../../api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "patient" });
  const [loading, setLoading] = useState(false);
  const [show, setShow]       = useState(false);
  const [done, setDone]       = useState(false);
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      if (form.role === "doctor") {
        setDone(true);
      } else {
        toast.success("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="blob w-[500px] h-[500px] bg-sage-300   top-[-100px] right-[-150px] animate-drift-slow" style={{position:"fixed"}} />
      <div className="blob w-[350px] h-[350px] bg-cream-300  bottom-[-50px] left-[-80px]  animate-drift"     style={{position:"fixed"}} />
      <div className="blob w-[250px] h-[250px] bg-sage-200   top-1/2 left-1/2 animate-float"                 style={{position:"fixed"}} />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-4 text-4xl border border-cream-200">🌿</div>
          <h1 className="font-display text-4xl font-bold text-charcoal-900">MedVise</h1>
          <p className="text-sage-600 mt-1">Create your account</p>
        </div>

        <div className="card shadow-xl">
          {done ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="font-display text-xl font-semibold text-charcoal-900 mb-2">Pending Approval</h2>
              <p className="text-sm text-sage-600 mb-4">Your doctor account has been created. An admin must approve it before you can log in.</p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold text-charcoal-900 mb-6">Get started</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label"><i className="fa-solid fa-user text-sage-400 mr-1.5"></i>Full name</label>
                  <input className="input" placeholder="Jane Doe" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label"><i className="fa-solid fa-envelope text-sage-400 mr-1.5"></i>Email address</label>
                  <input type="email" className="input" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="label"><i className="fa-solid fa-lock text-sage-400 mr-1.5"></i>Password</label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} className="input pr-10" placeholder="Min. 8 characters"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600">
                      <i className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label"><i className="fa-solid fa-id-card text-sage-400 mr-1.5"></i>I am registering as</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val:"patient", icon:"fa-solid fa-user-injured", label:"Patient" },
                      { val:"doctor",  icon:"fa-solid fa-user-doctor",  label:"Doctor"  },
                    ].map(r => (
                      <button type="button" key={r.val} onClick={() => setForm({ ...form, role: r.val })}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2
                          ${form.role === r.val
                            ? "border-sage-500 bg-sage-50 text-sage-700"
                            : "border-cream-300 bg-white text-charcoal-700 hover:border-sage-300"}`}>
                        <i className={r.icon}></i>{r.label}
                      </button>
                    ))}
                  </div>
                  {form.role === "doctor" && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-start gap-1.5">
                      <i className="fa-solid fa-circle-info mt-0.5"></i>
                      Doctor accounts require admin approval before you can log in.
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Creating account…</>
                    : <><i className="fa-solid fa-user-plus mr-2"></i>Create account</>}
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-sage-600">
                Already have an account?{" "}
                <Link to="/login" className="text-sage-700 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}