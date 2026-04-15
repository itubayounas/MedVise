import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../../api";
import toast from "react-hot-toast";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist",
  "Urologist",
  "Oncologist",
  "Endocrinologist",
  "Gastroenterologist",
];
const EMPTY_SLOT = { day: "Monday", start: "09:00", end: "17:00" };

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [slots, setSlots] = useState([{ ...EMPTY_SLOT }]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gender: "",
    specialty: "",
    bio: "",
    experience: "",
    price: "",
    dateOfBirth: "",
    bloodGroup: "",
  });

  const navigate = useNavigate();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addSlot = () => setSlots((s) => [...s, { ...EMPTY_SLOT }]);
  const removeSlot = (i) => setSlots((s) => s.filter((_, j) => j !== i));
  const updateSlot = (i, k, v) =>
    setSlots((s) => s.map((sl, j) => (j === i ? { ...sl, [k]: v } : sl)));

  const validateForm = () => {
    // Basic required fields
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields.");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email format.");
      return false;
    }

    // Password validation
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    // Phone validation (10–13 digits)
    const phoneRegex = /^[0-9]{10,13}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      toast.error("Phone number must be 10–13 digits.");
      return false;
    }

    // Doctor-specific validation
    if (role === "doctor") {
      if (!form.specialty || !form.experience || !form.price) {
        toast.error("Please fill all doctor professional details.");
        return false;
      }

      if (slots.length === 0) {
        toast.error("Please add at least one availability slot.");
        return false;
      }

      for (let sl of slots) {
        if (!sl.day || !sl.start || !sl.end) {
          toast.error("Invalid availability slot.");
          return false;
        }
      }
    }

    return true;
  };
 const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  try {
    await registerApi({ ...form, role, availability: slots });

    if (role === "doctor") {
      setDone(true);
    } else {
      toast.success("Account created! Please log in.");
      navigate("/login");
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  const goToStep3 = (e) => {
  e.preventDefault();

  // ── STEP 2 VALIDATION ──
  if (!form.name || !form.email || !form.password) {
    return toast.error("Please fill name, email and password.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    return toast.error("Invalid email format.");
  }

  if (form.password.length < 6) {
    return toast.error("Password must be at least 6 characters.");
  }

  const phoneRegex = /^[0-9]{10,13}$/;
  if (form.phone && !phoneRegex.test(form.phone)) {
    return toast.error("Phone must be 10–13 digits.");
  }

  if (!form.gender) {
    return toast.error("Please select gender.");
  }

  if (!form.address) {
    return toast.error("Please enter address.");
  }

  setStep(3);
};

  // ── Step 1: Choose role ──
  if (step === 1)
    return (
      <AuthShell title="Join MedVise" sub="Who are you registering as?">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              val: "patient",
              icon: "fa-user-injured",
              label: "Patient",
              desc: "Book appointments & track your health",
            },
            {
              val: "doctor",
              icon: "fa-user-doctor",
              label: "Doctor",
              desc: "Manage patients & appointments",
            },
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => setRole(r.val)}
              style={{
                padding: "16px",
                borderRadius: "12px",
                textAlign: "left",
                cursor: "pointer",
                border:
                  role === r.val ? "2px solid #426542" : "1.5px solid #e8dbc0",
                background: role === r.val ? "#f4f7f4" : "#fff",
                transition: "all .15s",
              }}
            >
              <i
                className={`fa-solid ${r.icon}`}
                style={{
                  fontSize: "22px",
                  display: "block",
                  marginBottom: "8px",
                  color: role === r.val ? "#426542" : "#9ca3af",
                }}
              ></i>
              <p
                style={{ fontWeight: 600, fontSize: "15px", color: "#141814" }}
              >
                {r.label}
              </p>
              <p
                style={{ fontSize: "12px", color: "#6b7280", marginTop: "3px" }}
              >
                {r.desc}
              </p>
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep(2)}
          disabled={!role}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            background: role ? "#426542" : "#9ca3af",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: role ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          Continue as {role || "…"}
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "16px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#426542",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </AuthShell>
    );

  // ── Step 2: Basic info ──
  if (step === 2)
    return (
      <AuthShell
        title="Basic Information"
        sub={`Step 2 of ${role === "doctor" ? "3" : "2"}`}
      >
        <StepIndicator step={2} total={role === "doctor" ? 3 : 2} />
        <form
          onSubmit={role === "patient" ? handleSubmit : goToStep3}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {/* Full name - full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-user" style={iconStyle}></i>Full Name
              </label>
              <input
                className="input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>

            {/* Email - full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-envelope" style={iconStyle}></i>Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>

            {/* Password - full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-lock" style={iconStyle}></i>Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  className="input"
                  placeholder="Min. 6 characters"
                  style={{ paddingRight: "2.5rem" }}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    padding: "4px",
                  }}
                >
                  <i
                    className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

             {/* Phone */}
          <div>
            <label style={labelStyle}>
              <i className="fa-solid fa-phone" style={iconStyle}></i>Phone
            </label>
            <input className="input"
             placeholder="+1 234 567 8900"
             required
              value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>
              <i className="fa-solid fa-venus-mars" style={iconStyle}></i>Gender
            </label>
            <select className="input" value={form.gender} onChange={e => set("gender", e.target.value)}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

            {/* Patient-only fields */}
            {role === "patient" && (
              <>
                <div>
                  <label style={labelStyle}>
                    <i
                      className="fa-solid fa-cake-candles"
                      style={iconStyle}
                    ></i>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <i className="fa-solid fa-droplet" style={iconStyle}></i>
                    Blood Group
                  </label>
                  <select
                    className="input"
                    value={form.bloodGroup}
                    onChange={(e) => set("bloodGroup", e.target.value)}
                  >
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (b) => (
                        <option key={b}>{b}</option>
                      ),
                    )}
                  </select>
                </div>
              </>
            )}

            {/* Address - full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-location-dot" style={iconStyle}></i>
                City / Address
              </label>
              <input
                className="input"
                required
                placeholder="Lahore, Pakistan"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={secondaryBtnStyle}
            >
              <i className="fa-solid fa-arrow-left"></i>Back
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ ...primaryBtnStyle, flex: 1 }}
            >
              {role === "doctor" ? (
                <>
                  Next <i className="fa-solid fa-arrow-right"></i>
                </>
              ) : loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>Creating…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i>Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </AuthShell>
    );

  // ── Step 3: Doctor profile ──
  if (step === 3 && role === "doctor") {
    if (done)
      return (
        <AuthShell title="Application Submitted!" sub="">
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>⏳</div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Pending Admin Approval
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              Your doctor profile has been submitted. An admin will review and
              approve your account. You'll be able to log in after approval.
            </p>
            <Link
              to="/login"
              style={{ ...primaryBtnStyle, display: "inline-flex" }}
            >
              <i className="fa-solid fa-arrow-left"></i>Back to Login
            </Link>
          </div>
        </AuthShell>
      );

    return (
      <AuthShell
        title="Doctor Profile"
        sub="Step 3 of 3 — Professional Details"
      >
        <StepIndicator step={3} total={3} />
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {/* Specialty - full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-stethoscope" style={iconStyle}></i>
                Specialty
              </label>
              <select
                className="input"
                value={form.specialty}
                onChange={(e) => set("specialty", e.target.value)}
                required
              >
                <option value="">Select specialty</option>
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label style={labelStyle}>
                <i
                  className="fa-solid fa-briefcase-medical"
                  style={iconStyle}
                ></i>
                Experience (yrs)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                className="input"
                placeholder="5"
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                required
              />
            </div>

            {/* Fee */}
            <div>
              <label style={labelStyle}>
                <i className="fa-solid fa-dollar-sign" style={iconStyle}></i>Fee
                per Appointment ($)
              </label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="50"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
              />
            </div>

            {/* Bio - full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-pen-to-square" style={iconStyle}></i>
                Bio / About
              </label>
              <textarea
                className="input"
                rows={3}
                style={{ resize: "none" }}
                placeholder="Brief professional description..."
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
              />
            </div>
          </div>

          {/* Availability slots */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label style={{ ...labelStyle, margin: 0 }}>
                <i className="fa-solid fa-clock" style={iconStyle}></i>
                Availability
              </label>
              <button
                type="button"
                onClick={addSlot}
                style={{
                  fontSize: "13px",
                  color: "#426542",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <i
                  className="fa-solid fa-plus"
                  style={{ marginRight: "4px" }}
                ></i>
                Add slot
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {slots.map((sl, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    className="input"
                    style={{ flex: 1, minWidth: "120px" }}
                    value={sl.day}
                    onChange={(e) => updateSlot(i, "day", e.target.value)}
                  >
                    {DAYS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="input"
                    style={{ width: "110px" }}
                    value={sl.start}
                    onChange={(e) => updateSlot(i, "start", e.target.value)}
                  />
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>to</span>
                  <input
                    type="time"
                    className="input"
                    style={{ width: "110px" }}
                    value={sl.end}
                    onChange={(e) => updateSlot(i, "end", e.target.value)}
                  />
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                        padding: "4px 8px",
                      }}
                    >
                      <i
                        className="fa-solid fa-trash"
                        style={{ fontSize: "13px" }}
                      ></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Approval notice */}
          <div
            style={{
              padding: "10px 14px",
              background: "#fefce8",
              border: "0.5px solid #fde68a",
              borderRadius: "10px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <i
              className="fa-solid fa-circle-info"
              style={{ color: "#d97706", marginTop: "1px", flexShrink: 0 }}
            ></i>
            <p style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.5 }}>
              Your account requires admin approval before you can log in.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={secondaryBtnStyle}
            >
              <i className="fa-solid fa-arrow-left"></i>Back
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ ...primaryBtnStyle, flex: 1 }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>Submitting…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return null;
}

// ── Shared styles ──────────────────────────────────────────
const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#1e2420",
  marginBottom: "6px",
};
const iconStyle = { color: "#9ca3af", fontSize: "11px" };

const primaryBtnStyle = {
  padding: "9px 20px",
  borderRadius: "10px",
  border: "none",
  background: "#426542",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};
const secondaryBtnStyle = {
  padding: "9px 16px",
  borderRadius: "10px",
  border: "0.5px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

// ── AuthShell ──────────────────────────────────────────────
function AuthShell({ title, sub, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg, #e8f5e8 0%, #f0f7f0 40%, #fdf6ed 100%)",
      }}
    >
      {/* Blob 1 — top left — strong sage green */}
      <div
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #779f77 0%, #558055 60%, transparent 100%)",
          top: "-150px",
          left: "-150px",
          opacity: 0.35,
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "drift 18s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — bottom right — warm cream/amber */}
      <div
        style={{
          position: "fixed",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #d4a853 0%, #c8956b 60%, transparent 100%)",
          bottom: "-100px",
          right: "-100px",
          opacity: 0.3,
          filter: "blur(55px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "drift 25s ease-in-out infinite reverse",
        }}
      />

      {/* Blob 3 — center right — lighter sage */}
      <div
        style={{
          position: "fixed",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #a5c1a5 0%, #779f77 70%, transparent 100%)",
          top: "35%",
          right: "5%",
          opacity: 0.25,
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "float 9s ease-in-out infinite",
        }}
      />

      {/* Blob 4 — top right — blue-teal accent */}
      <div
        style={{
          position: "fixed",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #5ba4a4 0%, #3d7a7a 70%, transparent 100%)",
          top: "10%",
          right: "20%",
          opacity: 0.2,
          filter: "blur(45px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "pulse2 4s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "68px",
              height: "68px",
              background: "linear-gradient(135deg, #426542, #558055)",
              borderRadius: "18px",
              boxShadow: "0 8px 24px rgba(66,101,66,.4)",
              marginBottom: "14px",
              fontSize: "30px",
            }}
          >
            🏥
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem,4vw,2.1rem)",
              fontWeight: 700,
              color: "#1a2e1a",
              marginBottom: "4px",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>

          {sub && (
            <p
              style={{
                color: "#4a6b4a",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {sub}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(119,159,119,0.25)",
            padding: "28px",
            boxShadow:
              "0 20px 60px rgba(66,101,66,.15), 0 4px 16px rgba(0,0,0,.06)",
          }}
        >
          {children}
        </div>

        {/* <p style={{
          textAlign:"center",
          fontSize:"12px",
          color:"#6b8f6b",
          marginTop:"16px",
          fontWeight:500,
        }}>
          🔒 Secured with JWT · Your data is safe with MedVise
        </p> */}
      </div>
    </div>
  );
}

// ── StepIndicator ──────────────────────────────────────────
function StepIndicator({ step, total }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "20px",
      }}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              transition: "all .2s",
              background:
                n < step ? "#426542" : n === step ? "#426542" : "#e8dbc0",
              color: n <= step ? "#fff" : "#9ca3af",
              boxShadow: n === step ? "0 0 0 4px rgba(66,101,66,.2)" : "none",
            }}
          >
            {n < step ? (
              <i className="fa-solid fa-check" style={{ fontSize: "10px" }}></i>
            ) : (
              n
            )}
          </div>
          {n < total && (
            <div
              style={{
                height: "3px",
                flex: 1,
                borderRadius: "2px",
                transition: "background .3s",
                background: n < step ? "#426542" : "#e8dbc0",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
