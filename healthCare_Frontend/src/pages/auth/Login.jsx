import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login as loginApi } from "../../api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const DASH = { patient: "/patient", doctor: "/doctor", admin: "/admin" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.token, data.role, { name: data.name, id: data.id });
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate(DASH[data.role] || "/");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Blobs */}
      <div
        className="blob animate-drift"
        style={{
          width: "500px",
          height: "500px",
          background: "var(--color-sage-300)",
          top: "-120px",
          left: "-180px",
        }}
      />
      <div
        className="blob animate-drift-slow"
        style={{
          width: "380px",
          height: "380px",
          background: "var(--color-cream-300)",
          bottom: "-60px",
          right: "-100px",
        }}
      />
      <div
        className="blob animate-float"
        style={{
          width: "250px",
          height: "250px",
          background: "var(--color-sage-200)",
          top: "40%",
          right: "10%",
        }}
      />

      <div className="auth-box animate-fade-up">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "4.5rem",
              height: "4.5rem",
              background: "#fff",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 20px rgba(0,0,0,.1)",
              marginRight: "1rem",
              fontSize: "2rem",
              border: "1px solid var(--color-cream-200)",
            }}
          >
            🏥
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem,5vw,2.25rem)",
                fontWeight: 700,
                color: "var(--color-charcoal-900)",
                margin: 0,
              }}
            >
              MedVise
            </h1>
            <p
              style={{
                color: "var(--color-sage-600)",
                marginTop: "0.25rem",
                fontSize: "0.9375rem",
              }}
            >
              Your smart healthcare companion
            </p>
          </div>
        </div>

        <div className="auth-card">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.375rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              color: "var(--color-charcoal-900)",
            }}
          >
            Welcome back
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="form-group">
              <label className="label">
                <i className="fa-solid fa-envelope"></i>Email address
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">
                <i className="fa-solid fa-lock"></i>Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  style={{ paddingRight: "2.75rem" }}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-sage-400)",
                    padding: "0.25rem",
                  }}
                >
                  <i
                    className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-base btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: "0.5rem", padding: "0.75rem" }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin-slow"></i>
                  Signing in…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>Sign in
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--color-sage-600)",
              marginTop: "1.25rem",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--color-sage-700)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Register here
            </Link>
          </p>
        </div>

        {/* <p style={{textAlign:"center",fontSize:"0.75rem",color:"var(--color-sage-400)",marginTop:"1rem"}}>
          <i className="fa-solid fa-shield-halved mr-1"></i>Secured with JWT · HIPAA-compliant design
        </p> */}
      </div>
    </div>
  );
}
