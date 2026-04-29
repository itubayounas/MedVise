import { useEffect, useState } from "react";
import { getMe, updateProfile } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SPECIALTIES = [
  "General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedist",
  "Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Ophthalmologist",
  "Dentist","Urologist","Oncologist","Endocrinologist","Gastroenterologist",
];
const EMPTY_SLOT = { day:"Monday", start:"09:00", end:"17:00" };

export default function DoctorProfile() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState("info"); // info | schedule | security
  const [slots, setSlots]       = useState([]);
  const [form, setForm]         = useState({
    name:"", phone:"", address:"", gender:"",
    specialty:"", bio:"", experience:"", price:"",
  });

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setProfile(data);
        setForm({
          name:       data.name        || "",
          phone:      data.phone       || "",
          address:    data.address     || "",
          gender:     data.gender      || "",
          specialty:  data.specialty   || "",
          bio:        data.bio         || "",
          experience: data.experience  ?? "",
          price:      data.price       ?? "",
        });
        setSlots(data.availability?.length ? data.availability : [{ ...EMPTY_SLOT }]);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSlot    = () => setSlots(s => [...s, { ...EMPTY_SLOT }]);
  const removeSlot = (i) => setSlots(s => s.filter((_, j) => j !== i));
  const updateSlot = (i, k, v) => setSlots(s => s.map((sl, j) => j === i ? { ...sl, [k]: v } : sl));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile({
        ...form,
        experience:   Number(form.experience) || 0,
        price:        Number(form.price)       || 0,
        availability: slots,
      });
      setProfile(data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth:"820px", margin:"0 auto", padding:"0 16px" }}>

        {/* Header */}
        <div style={{ marginBottom:"28px" }}>
          <h1 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(1.4rem,3vw,2rem)",
            fontWeight:700, color:"#141814", marginBottom:"4px",
          }}>
            <i className="fa-solid fa-circle-user"
              style={{ color:"#558055", marginRight:"10px" }}></i>
            My Profile
          </h1>
          <p style={{ fontSize:"14px", color:"#6b8f6b" }}>
            Manage your professional information and availability
          </p>
        </div>

        {/* Profile summary card */}
        <div style={{
          background:"linear-gradient(135deg,#f4f7f4,#f9f6ed)",
          borderRadius:"14px", border:"0.5px solid #ccdccc",
          padding:"20px 24px", marginBottom:"24px",
          display:"flex", alignItems:"center", gap:"18px", flexWrap:"wrap",
        }}>
          <div style={{
            width:"68px", height:"68px", borderRadius:"16px", flexShrink:0,
            background:"linear-gradient(135deg,#558055,#2c402c)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:"26px", fontWeight:700,
          }}>
            {(profile?.name || "D")[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:"180px" }}>
            <p style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:700, color:"#141814" }}>
              {profile?.name}
            </p>
            <p style={{ fontSize:"13px", color:"#558055", marginTop:"3px" }}>
              <i className="fa-solid fa-stethoscope" style={{ marginRight:"6px" }}></i>
              {profile?.specialty || "No specialty set"}
            </p>
            <p style={{ fontSize:"13px", color:"#6b7280", marginTop:"3px" }}>
              <i className="fa-solid fa-envelope" style={{ marginRight:"6px", color:"#9ca3af" }}></i>
              {profile?.email}
            </p>
          </div>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            <div style={{ textAlign:"center", padding:"10px 16px", background:"#fff", borderRadius:"10px", border:"0.5px solid #e8dbc0" }}>
              <p style={{ fontSize:"18px", fontWeight:700, color:"#141814" }}>${profile?.price || 0}</p>
              <p style={{ fontSize:"11px", color:"#9ca3af" }}>Per visit</p>
            </div>
            <div style={{ textAlign:"center", padding:"10px 16px", background:"#fff", borderRadius:"10px", border:"0.5px solid #e8dbc0" }}>
              <p style={{ fontSize:"18px", fontWeight:700, color:"#141814" }}>{profile?.experience || 0}</p>
              <p style={{ fontSize:"11px", color:"#9ca3af" }}>Yrs exp</p>
            </div>
            <div style={{
              textAlign:"center", padding:"10px 16px", borderRadius:"10px",
              background: profile?.isApproved ? "#dcfce7" : "#fef3c7",
              border: profile?.isApproved ? "0.5px solid #86efac" : "0.5px solid #fcd34d",
            }}>
              <p style={{ fontSize:"13px", fontWeight:700, color: profile?.isApproved ? "#15803d" : "#92400e" }}>
                <i className={`fa-solid ${profile?.isApproved ? "fa-circle-check" : "fa-clock"}`}
                  style={{ marginRight:"4px" }}></i>
                {profile?.isApproved ? "Approved" : "Pending"}
              </p>
              <p style={{ fontSize:"11px", color:"#9ca3af" }}>Status</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display:"flex", gap:"4px", background:"#f3f4f6",
          padding:"4px", borderRadius:"10px", border:"0.5px solid #e5e7eb",
          marginBottom:"20px", width:"fit-content",
        }}>
          {[
            { key:"info",     icon:"fa-user",          label:"Personal Info"  },
            { key:"schedule", icon:"fa-calendar-days",  label:"Schedule & Fee" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display:"flex", alignItems:"center", gap:"7px",
              padding:"7px 18px", borderRadius:"7px", border:"none",
              fontSize:"13px", fontWeight:600, cursor:"pointer",
              background: tab === t.key ? "#fff" : "transparent",
              color:      tab === t.key ? "#1a2e1a" : "#6b7280",
              boxShadow:  tab === t.key ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition:"all .15s",
            }}>
              <i className={`fa-solid ${t.icon}`} style={{ fontSize:"11px" }}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div style={{
          background:"#fff", borderRadius:"14px",
          border:"0.5px solid #e8dbc0",
          boxShadow:"0 2px 12px rgba(0,0,0,.06)",
          overflow:"hidden",
        }}>
          <form onSubmit={handleSave}>

            {/* ── INFO TAB ── */}
            {tab === "info" && (
              <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:"16px" }}>
                <h2 style={{
                  fontFamily:"var(--font-display)",
                  fontSize:"1.1rem", fontWeight:600, color:"#141814",
                  marginBottom:"4px",
                }}>
                  <i className="fa-solid fa-user" style={{ color:"#558055", marginRight:"8px" }}></i>
                  Personal & Professional Info
                </h2>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>

                  {/* Full name */}
                  <div style={{ gridColumn:"1 / -1" }}>
                    <FieldLabel icon="fa-user">Full Name</FieldLabel>
                    <StyledInput
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>

                  {/* Specialty */}
                  <div style={{ gridColumn:"1 / -1" }}>
                    <FieldLabel icon="fa-stethoscope">Specialty</FieldLabel>
                    <StyledSelect
                      value={form.specialty}
                      onChange={e => set("specialty", e.target.value)}>
                      <option value="">Select specialty</option>
                      {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                    </StyledSelect>
                  </div>

                  {/* Experience */}
                  <div>
                    <FieldLabel icon="fa-briefcase-medical">Experience (years)</FieldLabel>
                    <StyledInput
                      type="number" min="0" max="60"
                      value={form.experience}
                      onChange={e => set("experience", e.target.value)}
                      placeholder="5"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <FieldLabel icon="fa-venus-mars">Gender</FieldLabel>
                    <StyledSelect value={form.gender} onChange={e => set("gender", e.target.value)}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </StyledSelect>
                  </div>

                  {/* Phone */}
                  <div>
                    <FieldLabel icon="fa-phone">Phone</FieldLabel>
                    <StyledInput
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <FieldLabel icon="fa-location-dot">City / Address</FieldLabel>
                    <StyledInput
                      value={form.address}
                      onChange={e => set("address", e.target.value)}
                      placeholder="Lahore, Pakistan"
                    />
                  </div>

                  {/* Bio */}
                  <div style={{ gridColumn:"1 / -1" }}>
                    <FieldLabel icon="fa-pen-to-square">Bio / About</FieldLabel>
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={e => set("bio", e.target.value)}
                      placeholder="Brief professional description…"
                      style={{
                        width:"100%", padding:"11px 14px", borderRadius:"10px",
                        border:"1.5px solid #e8dbc0", outline:"none",
                        fontSize:"14px", color:"#141814", background:"#fdfcf8",
                        resize:"vertical", lineHeight:1.6, fontFamily:"inherit",
                        transition:"border-color .15s",
                      }}
                      onFocus={e => e.target.style.borderColor="#779f77"}
                      onBlur={e => e.target.style.borderColor="#e8dbc0"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── SCHEDULE TAB ── */}
            {tab === "schedule" && (
              <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:"16px" }}>
                <h2 style={{
                  fontFamily:"var(--font-display)",
                  fontSize:"1.1rem", fontWeight:600, color:"#141814", marginBottom:"4px",
                }}>
                  <i className="fa-solid fa-calendar-days" style={{ color:"#558055", marginRight:"8px" }}></i>
                  Schedule & Consultation Fee
                </h2>

                {/* Fee */}
                <div style={{ maxWidth:"280px" }}>
                  <FieldLabel icon="fa-dollar-sign">Consultation Fee ($)</FieldLabel>
                  <StyledInput
                    type="number" min="0"
                    value={form.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="50"
                  />
                </div>

                {/* Availability slots */}
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                    <FieldLabel icon="fa-clock" noMargin>Weekly Availability</FieldLabel>
                    <button type="button" onClick={addSlot} style={{
                      display:"flex", alignItems:"center", gap:"5px",
                      fontSize:"13px", color:"#426542", background:"none",
                      border:"none", cursor:"pointer", fontWeight:600,
                    }}>
                      <i className="fa-solid fa-plus" style={{ fontSize:"11px" }}></i>
                      Add time slot
                    </button>
                  </div>

                  {slots.length === 0 ? (
                    <div style={{
                      padding:"20px", textAlign:"center",
                      background:"#f9fafb", borderRadius:"10px",
                      border:"0.5px dashed #d1d5db",
                      fontSize:"13px", color:"#9ca3af",
                    }}>
                      No availability slots added. Click "Add time slot" above.
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      {slots.map((sl, i) => (
                        <div key={i} style={{
                          display:"flex", gap:"10px", alignItems:"center",
                          padding:"12px 14px", background:"#f9fafb",
                          borderRadius:"10px", border:"0.5px solid #e5e7eb",
                          flexWrap:"wrap",
                        }}>
                          <select
                            value={sl.day}
                            onChange={e => updateSlot(i, "day", e.target.value)}
                            style={{
                              flex:1, minWidth:"130px", padding:"8px 10px",
                              borderRadius:"8px", border:"0.5px solid #d1d5db",
                              fontSize:"13px", background:"#fff", outline:"none",
                            }}>
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                          </select>

                          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <input type="time" value={sl.start}
                              onChange={e => updateSlot(i, "start", e.target.value)}
                              style={{
                                padding:"8px 10px", borderRadius:"8px",
                                border:"0.5px solid #d1d5db",
                                fontSize:"13px", background:"#fff", outline:"none",
                              }} />
                            <span style={{ fontSize:"12px", color:"#9ca3af" }}>to</span>
                            <input type="time" value={sl.end}
                              onChange={e => updateSlot(i, "end", e.target.value)}
                              style={{
                                padding:"8px 10px", borderRadius:"8px",
                                border:"0.5px solid #d1d5db",
                                fontSize:"13px", background:"#fff", outline:"none",
                              }} />
                          </div>

                          <button type="button" onClick={() => removeSlot(i)} style={{
                            width:"32px", height:"32px", borderRadius:"8px",
                            border:"0.5px solid #fca5a5", background:"#fff1f2",
                            cursor:"pointer", display:"flex",
                            alignItems:"center", justifyContent:"center",
                            color:"#dc2626", flexShrink:0,
                          }}>
                            <i className="fa-solid fa-trash" style={{ fontSize:"11px" }}></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info note */}
                <div style={{
                  padding:"12px 16px", background:"#f0f9ff",
                  borderRadius:"10px", border:"0.5px solid #bae6fd",
                  display:"flex", alignItems:"flex-start", gap:"8px",
                }}>
                  <i className="fa-solid fa-circle-info"
                    style={{ color:"#0284c7", flexShrink:0, marginTop:"1px" }}></i>
                  <p style={{ fontSize:"12px", color:"#0369a1", lineHeight:1.5 }}>
                    Your availability is shown to patients when they book appointments.
                    Changes take effect immediately after saving.
                  </p>
                </div>
              </div>
            )}

            {/* Save button — always visible */}
            <div style={{
              padding:"16px 24px",
              borderTop:"0.5px solid #f2ebda",
              background:"#fafaf9",
              display:"flex", justifyContent:"flex-end", gap:"10px",
            }}>
              <button type="submit" disabled={saving} style={{
                display:"flex", alignItems:"center", gap:"8px",
                padding:"10px 24px", borderRadius:"10px", border:"none",
                background: saving ? "#9ca3af" : "#426542", color:"#fff",
                fontSize:"14px", fontWeight:600,
                cursor: saving ? "not-allowed" : "pointer",
              }}>
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin"></i>Saving…</>
                  : <><i className="fa-solid fa-floppy-disk"></i>Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

// ── Shared small components ────────────────────────────────
function FieldLabel({ icon, children, noMargin }) {
  return (
    <label style={{
      display:"flex", alignItems:"center", gap:"6px",
      fontSize:"13px", fontWeight:600, color:"#1e2420",
      marginBottom: noMargin ? 0 : "7px",
    }}>
      <i className={`fa-solid ${icon}`} style={{ color:"#9ca3af", fontSize:"11px" }}></i>
      {children}
    </label>
  );
}

function StyledInput({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width:"100%", padding:"11px 14px", borderRadius:"10px",
        border:"1.5px solid #e8dbc0", outline:"none",
        fontSize:"14px", color:"#141814", background:"#fdfcf8",
        transition:"border-color .15s", fontFamily:"inherit",
      }}
      onFocus={e => e.target.style.borderColor="#779f77"}
      onBlur={e => e.target.style.borderColor="#e8dbc0"}
    />
  );
}

function StyledSelect({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width:"100%", padding:"11px 14px", borderRadius:"10px",
        border:"1.5px solid #e8dbc0", outline:"none",
        fontSize:"14px", color:"#141814", background:"#fdfcf8",
        cursor:"pointer", fontFamily:"inherit",
      }}>
      {children}
    </select>
  );
}