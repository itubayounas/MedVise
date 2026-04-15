import { useEffect, useState, useCallback } from "react";
import { getPatientAppointments, createAppointment, getAllDoctors, getDoctorBookedSlots } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const SPECIALTY_ICONS = {
  "Cardiologist":"fa-heart-pulse","Dermatologist":"fa-hand-dots",
  "Neurologist":"fa-brain","Orthopedist":"fa-bone","Pediatrician":"fa-baby",
  "Psychiatrist":"fa-head-side-virus","General Physician":"fa-stethoscope",
  "Gynecologist":"fa-venus","ENT Specialist":"fa-ear","Ophthalmologist":"fa-eye",
  "Dentist":"fa-tooth","Oncologist":"fa-ribbon","Gastroenterologist":"fa-stethoscope",
};

const STATUS_COLOR = {
  Pending:  { bg:"#fef3c7", color:"#92400e", border:"#fcd34d", icon:"fa-clock" },
  Approved: { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7", icon:"fa-circle-check" },
  Rejected: { bg:"#fee2e2", color:"#991b1b", border:"#fca5a5", icon:"fa-circle-xmark" },
};

function isAvailableNow(availability = []) {
  if (!availability?.length) return false;
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const now  = new Date();
  const day  = DAYS[now.getDay()];
  const hhmm = now.toTimeString().slice(0, 5);
  return availability.some(sl => sl.day === day && hhmm >= sl.start && hhmm <= sl.end);
}

function isSlotConflict(bookedSlots = [], datetime) {
  if (!datetime) return false;
  const t = new Date(datetime).getTime();
  return bookedSlots.some(sl => Math.abs(t - new Date(sl.appointmentDate).getTime()) < 30 * 60 * 1000);
}

function Stars({ rating = 0 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"2px" }}>
      {[1,2,3,4,5].map(n => (
        <i key={n}
          className={`fa-star ${n <= Math.round(rating) ? "fa-solid" : "fa-regular"}`}
          style={{ fontSize:"11px", color: n <= Math.round(rating) ? "#f59e0b" : "var(--color-border-secondary, #d1d5db)" }}
        />
      ))}
      <span style={{ fontSize:"12px", color:"var(--color-text-secondary)", marginLeft:"4px" }}>
        ({Number(rating).toFixed(1)})
      </span>
    </div>
  );
}

function DoctorCard({ doctor, onBook }) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = isAvailableNow(doctor.availability);
  const icon   = SPECIALTY_ICONS[doctor.specialty] || "fa-user-doctor";

  return (
    <div style={{
      background:"var(--color-background-primary, #fff)",
      border:"0.5px solid var(--color-border-tertiary)",
      borderRadius:"12px",
      overflow:"hidden",
      display:"flex",
      flexDirection:"column",
      transition:"all .2s ease",
      boxShadow:"0 1px 6px rgba(0,0,0,.06)",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.12)"; e.currentTarget.style.transform="translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow="0 1px 6px rgba(0,0,0,.06)"; e.currentTarget.style.transform="translateY(0)"; }}>
      {/* Availability stripe */}
      <div style={{ height:"3px", background: isOpen ? "#16a34a" : "#dc2626", flexShrink:0 }} />

      <div style={{ padding:"16px", flex:1, display:"flex", flexDirection:"column", gap:"12px" }}>
        {/* Header */}
        <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
          <div style={{
            width:"52px", height:"52px", borderRadius:"10px", flexShrink:0,
            background:"linear-gradient(135deg, #558055, #2c402c)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:"18px", fontWeight:500,
          }}>
            {doctor.name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:500, fontSize:"15px", marginBottom:"3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {doctor.name}
            </p>
            <p style={{ fontSize:"12px", color:"var(--color-text-secondary)", display:"flex", alignItems:"center", gap:"4px", marginBottom:"4px" }}>
              <i className={`fa-solid ${icon}`} style={{ fontSize:"10px" }}></i>
              {doctor.specialty || "General Physician"}
            </p>
            <Stars rating={doctor.rating} />
            <span style={{
              display:"inline-flex", alignItems:"center", gap:"4px",
              fontSize:"11px", fontWeight:500, marginTop:"5px",
              padding:"2px 8px", borderRadius:"20px",
              background: isOpen ? "#dcfce7" : "#fee2e2",
              color: isOpen ? "#15803d" : "#dc2626",
            }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: isOpen ? "#16a34a" : "#dc2626", display:"inline-block" }} />
              {isOpen ? "Available now" : "Not available"}
            </span>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
          {[
            { val: `${doctor.experience || 0}`, lbl:"Yrs exp" },
            { val: `$${doctor.price || 0}`,     lbl:"Per visit" },
            { val: isOpen ? "Open" : "Closed",  lbl:"Status",
              bg: isOpen ? "#dcfce7" : "#fee2e2",
              color: isOpen ? "#15803d" : "#dc2626" },
          ].map((m, i) => (
            <div key={i} style={{
              background: m.bg || "var(--color-background-secondary, #f9fafb)",
              borderRadius:"8px", padding:"8px", textAlign:"center",
            }}>
              <div style={{ fontSize:"14px", fontWeight:500, color: m.color || "var(--color-text-primary)" }}>
                {m.val}
              </div>
              <div style={{ fontSize:"11px", color:"var(--color-text-secondary)", marginTop:"1px" }}>{m.lbl}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {doctor.bio && (
          <p style={{
            fontSize:"13px", color:"var(--color-text-secondary)", lineHeight:1.55,
            overflow:"hidden", display:"-webkit-box",
            WebkitLineClamp: expanded ? "none" : 2,
            WebkitBoxOrient:"vertical",
          }}>
            {doctor.bio}
          </p>
        )}

        {/* Expanded details */}
        {expanded && (
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {doctor.address && (
              <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"var(--color-text-secondary)" }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize:"10px", width:"12px" }}></i>
                {doctor.address}
              </div>
            )}
            {doctor.phone && (
              <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"var(--color-text-secondary)" }}>
                <i className="fa-solid fa-phone" style={{ fontSize:"10px", width:"12px" }}></i>
                {doctor.phone}
              </div>
            )}
            {doctor.availability?.length > 0 && (
              <div style={{ marginTop:"4px" }}>
                <p style={{ fontSize:"11px", fontWeight:500, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:"6px" }}>
                  Weekly schedule
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                  {doctor.availability.map((sl, i) => (
                    <span key={i} style={{
                      fontSize:"11px", padding:"3px 8px", borderRadius:"6px",
                      background:"var(--color-background-secondary, #f9fafb)",
                      border:"0.5px solid var(--color-border-tertiary)",
                      color:"var(--color-text-secondary)",
                    }}>
                      {sl.day.slice(0, 3)} · {sl.start}–{sl.end}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={(e) => { e.currentTarget.style.background="var(--color-cream-50)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="var(--color-background-primary, #fff)"; }}
            style={{
              flex:1, height:"34px", borderRadius:"8px",
              border:"0.5px solid var(--color-border-secondary)",
              background:"var(--color-background-primary, #fff)",
              color:"var(--color-text-secondary)", fontSize:"13px",
              fontWeight:500, cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center", gap:"5px",
              transition:"all .15s ease",
            }}>
            <i className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`} style={{ fontSize:"10px" }}></i>
            {expanded ? "Less" : "Details"}
          </button>
          <button
            onClick={() => onBook(doctor)}
            onMouseEnter={(e) => { e.currentTarget.style.background="#364f36"; e.currentTarget.style.boxShadow="0 4px 12px rgba(66,101,66,.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="#426542"; e.currentTarget.style.boxShadow="none"; }}
            style={{
              flex:2, height:"34px", borderRadius:"8px",
              border:"none", background:"#426542", color:"#fff",
              fontSize:"13px", fontWeight:500, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
              transition:"all .15s ease",
            }}>
            <i className="fa-solid fa-calendar-plus" style={{ fontSize:"11px" }}></i>
            Book appointment
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ doctor, onClose, onSuccess }) {
  const [form, setForm]         = useState({ appointmentDate:"", reason:"" });
  const [bookedSlots, setSlots] = useState([]);
  const [loadingSlots, setLS]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const conflict = isSlotConflict(bookedSlots, form.appointmentDate);
  const today    = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    getDoctorBookedSlots(doctor._id)
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setLS(false));
  }, [doctor._id]);

  // Check if selected time is within availability
  const getHint = () => {
    if (!form.appointmentDate || !doctor.availability?.length) return null;
    const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d    = new Date(form.appointmentDate);
    const day  = DAYS[d.getDay()];
    const slot = doctor.availability.find(s => s.day === day);
    const time = form.appointmentDate.slice(11, 16);
    if (!slot) return { type:"warn", msg:`Doctor is not available on ${day}s` };
    if (time < slot.start || time > slot.end)
      return { type:"warn", msg:`Doctor's hours on ${day}: ${slot.start}–${slot.end}` };
    return { type:"ok", msg:`Within available hours (${slot.start}–${slot.end})` };
  };
  const hint = getHint();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (conflict) { toast.error("That slot is already booked. Pick another time."); return; }
    setSub(true);
    try {
      await createAppointment({ doctor: doctor._id, ...form });
      toast.success(`Appointment booked with ${doctor.name}!`);
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed.");
    } finally { setSub(false); }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
        backdropFilter:"blur(4px)", zIndex:100,
        display:"flex", alignItems:"flex-end", justifyContent:"center",
      }}>
      <div style={{
        background:"#fff", width:"100%", maxWidth:"480px",
        borderRadius:"16px 16px 0 0", maxHeight:"92vh", overflowY:"auto",
      }}>
        {/* Header */}
        <div style={{
          position:"sticky", top:0, background:"#fff", zIndex:1,
          borderBottom:"0.5px solid #e5e7eb",
          padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <p style={{ fontSize:"16px", fontWeight:500 }}>Book appointment</p>
          <button onClick={onClose} style={{
            width:"28px", height:"28px", borderRadius:"50%", border:"0.5px solid #e5e7eb",
            background:"#f9fafb", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <i className="fa-solid fa-xmark" style={{ fontSize:"12px" }}></i>
          </button>
        </div>

        <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* Doctor summary */}
          <div style={{
            display:"flex", gap:"12px", alignItems:"center",
            padding:"14px", background:"#f0fdf4",
            borderRadius:"10px", border:"0.5px solid #bbf7d0",
          }}>
            <div style={{
              width:"48px", height:"48px", borderRadius:"10px", flexShrink:0,
              background:"linear-gradient(135deg,#558055,#2c402c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:"16px", fontWeight:500,
            }}>
              {doctor.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:500, fontSize:"15px" }}>{doctor.name}</p>
              <p style={{ fontSize:"12px", color:"#6b7280", marginTop:"2px" }}>{doctor.specialty}</p>
              <div style={{ display:"flex", gap:"12px", marginTop:"4px", fontSize:"12px", color:"#374151" }}>
                <span><i className="fa-solid fa-dollar-sign" style={{ color:"#558055", marginRight:"3px" }}></i>${doctor.price}/visit</span>
                <span><i className="fa-solid fa-briefcase-medical" style={{ color:"#558055", marginRight:"3px" }}></i>{doctor.experience} yrs</span>
              </div>
            </div>
          </div>

          {/* Booked slots */}
          {!loadingSlots && bookedSlots.length > 0 && (
            <div style={{ padding:"12px", background:"#fefce8", borderRadius:"10px", border:"0.5px solid #fde68a" }}>
              <p style={{ fontSize:"12px", fontWeight:500, color:"#92400e", marginBottom:"8px" }}>
                <i className="fa-solid fa-calendar-xmark" style={{ marginRight:"5px" }}></i>
                Already booked (unavailable)
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {bookedSlots.map((sl, i) => (
                  <span key={i} style={{
                    fontSize:"11px", padding:"3px 8px", borderRadius:"6px",
                    background:"#fef3c7", color:"#92400e", border:"0.5px solid #fcd34d",
                  }}>
                    <i className="fa-solid fa-ban" style={{ marginRight:"4px", fontSize:"9px" }}></i>
                    {new Date(sl.appointmentDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                    {" "}
                    {new Date(sl.appointmentDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                  </span>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:500, marginBottom:"6px", color:"#374151" }}>
                <i className="fa-regular fa-calendar" style={{ color:"#558055", marginRight:"6px" }}></i>
                Date & time
              </label>
              <input
                type="datetime-local" min={today} required
                value={form.appointmentDate}
                onChange={e => setForm({ ...form, appointmentDate:e.target.value })}
                style={{
                  width:"100%", padding:"9px 12px", borderRadius:"8px", fontSize:"14px",
                  border: conflict ? "1.5px solid #ef4444" : "0.5px solid #d1d5db",
                  outline:"none", background:"#fff",
                }}
              />
              {form.appointmentDate && (
                <p style={{ fontSize:"12px", marginTop:"5px", color: conflict ? "#dc2626" : hint?.type==="warn" ? "#d97706" : "#16a34a", display:"flex", alignItems:"center", gap:"4px" }}>
                  <i className={`fa-solid ${conflict ? "fa-circle-xmark" : hint?.type==="warn" ? "fa-triangle-exclamation" : "fa-circle-check"}`}></i>
                  {conflict ? "This slot is already taken — choose a different time" : hint?.msg}
                </p>
              )}
            </div>

            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:500, marginBottom:"6px", color:"#374151" }}>
                <i className="fa-solid fa-notes-medical" style={{ color:"#558055", marginRight:"6px" }}></i>
                Reason for visit <span style={{ fontWeight:400, color:"#9ca3af" }}>(optional)</span>
              </label>
              <textarea
                rows={3} placeholder="Describe your symptoms or concern…"
                value={form.reason} onChange={e => setForm({ ...form, reason:e.target.value })}
                style={{
                  width:"100%", padding:"9px 12px", borderRadius:"8px", fontSize:"13px",
                  border:"0.5px solid #d1d5db", outline:"none", background:"#fff",
                  resize:"none", lineHeight:1.5, fontFamily:"inherit",
                }}
              />
            </div>

            {/* Fee */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 14px", background:"#f0fdf4",
              borderRadius:"10px", border:"0.5px solid #bbf7d0",
            }}>
              <div>
                <p style={{ fontSize:"13px", fontWeight:500, color:"#374151" }}>
                  <i className="fa-solid fa-receipt" style={{ color:"#558055", marginRight:"6px" }}></i>
                  Consultation fee
                </p>
                <p style={{ fontSize:"11px", color:"#6b7280", marginTop:"2px" }}>Payable at clinic</p>
              </div>
              <p style={{ fontSize:"22px", fontWeight:500, color:"#1a2e1a" }}>${doctor.price}</p>
            </div>

            <div style={{ display:"flex", gap:"10px" }}>
              <button type="button" onClick={onClose}
                onMouseEnter={(e) => { e.currentTarget.style.background="#f9fafb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background="#fff"; }}
                style={{
                  flex:1, height:"38px", borderRadius:"8px",
                  border:"0.5px solid #d1d5db", background:"#fff",
                  fontSize:"13px", fontWeight:500, cursor:"pointer", color:"#374151",
                  transition:"all .15s ease",
                }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting || conflict}
                onMouseEnter={(e) => { if (!submitting && !conflict) { e.currentTarget.style.background="#364f36"; e.currentTarget.style.boxShadow="0 4px 12px rgba(66,101,66,.25)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background="#426542"; e.currentTarget.style.boxShadow="none"; }}
                style={{
                  flex:2, height:"38px", borderRadius:"8px", border:"none",
                  background: submitting || conflict ? "#9ca3af" : "#426542",
                  color:"#fff", fontSize:"13px", fontWeight:500, cursor: submitting || conflict ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                  transition:"all .15s ease",
                }}>
                {submitting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Booking…</>
                  : <><i className="fa-solid fa-calendar-check"></i> Confirm booking</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointments() {
  const [tab, setTab]         = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [spec, setSpec]       = useState("All");
  const [sort, setSort]       = useState("rating");
  const [apptFilter, setApptFilter] = useState("All");
  const [bookingDoc, setBookingDoc] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [d, a] = await Promise.all([getAllDoctors(), getPatientAppointments()]);
      setDoctors(d.data);
      setAppts(a.data);
    } catch { toast.error("Failed to load. Please refresh."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const specialties = ["All", ...new Set(doctors.map(d => d.specialty).filter(Boolean))];

  const filtered = doctors
    .filter(d => {
      const q = search.toLowerCase();
      return (
        (!q || d.name.toLowerCase().includes(q) || (d.specialty||"").toLowerCase().includes(q) || (d.address||"").toLowerCase().includes(q)) &&
        (spec === "All" || d.specialty === spec)
      );
    })
    .sort((a, b) => {
      if (sort === "rating")     return (b.rating||0) - (a.rating||0);
      if (sort === "price_asc")  return (a.price||0)  - (b.price||0);
      if (sort === "price_desc") return (b.price||0)  - (a.price||0);
      if (sort === "exp")        return (b.experience||0) - (a.experience||0);
      return 0;
    });

  const filteredAppts = apptFilter === "All" ? appts : appts.filter(a => a.status === apptFilter);
  const counts = {
    All:appts.length,
    Pending:appts.filter(a=>a.status==="Pending").length,
    Approved:appts.filter(a=>a.status==="Approved").length,
    Rejected:appts.filter(a=>a.status==="Rejected").length,
  };
  const availNow = doctors.filter(d => isAvailableNow(d.availability)).length;

  if (loading) return <Layout><Spinner /></Layout>;

  const tabStyle = (active) => ({
    display:"flex", alignItems:"center", gap:"6px",
    padding:"7px 16px", borderRadius:"8px", border:"none",
    fontSize:"13px", fontWeight:500, cursor:"pointer",
    transition:"all .15s",
    background: active ? "#fff" : "transparent",
    color: active ? "#1a2e1a" : "#6b7280",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,.08)" : "none",
  });

  const filterBtnStyle = (active) => ({
    display:"flex", alignItems:"center", gap:"6px",
    padding:"6px 14px", borderRadius:"8px", border:"none",
    fontSize:"13px", fontWeight:500, cursor:"pointer",
    background: active ? "#426542" : "#fff",
    color: active ? "#fff" : "#374151",
    // border: active ? "none" : "0.5px solid #d1d5db",
  });

  return (
    <Layout>
      <div style={{ animation:"fadeUp .45s ease forwards", opacity:0 }}>
        {/* Page header */}
        <div style={{ marginBottom:"20px" }}>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:700, marginBottom:"4px" }}>
            <i className="fa-solid fa-calendar-days" style={{ color:"#558055", marginRight:"10px" }}></i>
            Appointments
          </h1>
          <p style={{ color:"#6b7280", fontSize:"14px" }}>Browse doctors and manage your appointments</p>
        </div>

        {/* Tab bar */}
        <div style={{
          display:"flex", gap:"4px", background:"#f3f4f6",
          padding:"4px", borderRadius:"10px", width:"fit-content",
          border:"0.5px solid #e5e7eb", marginBottom:"20px",
          maxWidth:"100%", overflowX:"auto",
        }}>
          <button onClick={() => setTab("doctors")} style={tabStyle(tab === "doctors")}>
            <i className="fa-solid fa-user-doctor" style={{ fontSize:"12px" }}></i>
            Find doctors
          </button>
          <button onClick={() => setTab("appts")} style={tabStyle(tab === "appts")}>
            <i className="fa-solid fa-calendar-check" style={{ fontSize:"12px" }}></i>
            My appointments
            {appts.length > 0 && (
              <span style={{
                minWidth:"18px", height:"18px", borderRadius:"9px",
                background:"#fef3c7", color:"#92400e",
                fontSize:"11px", fontWeight:600, padding:"0 5px",
                display:"inline-flex", alignItems:"center", justifyContent:"center",
              }}>{appts.length}</span>
            )}
          </button>
        </div>

        {/* ── DOCTORS TAB ── */}
        {tab === "doctors" && (
          <>
            {/* Controls */}
            <div style={{ display:"flex", gap:"10px", marginBottom:"12px", flexWrap:"wrap", alignItems:"center" }}>
              {/* Search */}
              <div style={{
                display:"flex", alignItems:"center", gap:"8px",
                background:"#fff", border:"0.5px solid #d1d5db",
                borderRadius:"8px", padding:"0 12px", height:"36px",
                flex:1, minWidth:"180px", maxWidth:"320px",
              }}>
                <i className="fa-solid fa-magnifying-glass" style={{ color:"#9ca3af", fontSize:"13px" }}></i>
                <input
                  type="text" placeholder="Search name, specialty, city…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ border:"none", outline:"none", background:"transparent", fontSize:"13px", color:"#1f2937", width:"100%" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ border:"none", background:"none", cursor:"pointer", padding:0 }}>
                    <i className="fa-solid fa-xmark" style={{ fontSize:"12px", color:"#9ca3af" }}></i>
                  </button>
                )}
              </div>

              {/* Specialty */}
              <select
                value={spec} onChange={e => setSpec(e.target.value)}
                style={{
                  height:"36px", padding:"0 12px", border:"0.5px solid #d1d5db",
                  borderRadius:"8px", fontSize:"13px", background:"#fff",
                  color:"#374151", cursor:"pointer", outline:"none",
                }}>
                {specialties.map(s => <option key={s}>{s}</option>)}
              </select>

              {/* Sort */}
              <select
                value={sort} onChange={e => setSort(e.target.value)}
                style={{
                  height:"36px", padding:"0 12px", border:"0.5px solid #d1d5db",
                  borderRadius:"8px", fontSize:"13px", background:"#fff",
                  color:"#374151", cursor:"pointer", outline:"none",
                }}>
                <option value="rating">Top rated</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="exp">Most experienced</option>
              </select>
            </div>

            {/* Stats bar */}
            <div style={{ display:"flex", gap:"16px", marginBottom:"16px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"6px" }}>
                <i className="fa-solid fa-user-doctor" style={{ color:"#9ca3af", fontSize:"11px" }}></i>
                <strong>{filtered.length}</strong> doctor{filtered.length !== 1 ? "s" : ""}
              </span>
              <span style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#16a34a", display:"inline-block" }} />
                <strong>{availNow}</strong> available now
              </span>
            </div>

            {/* Doctor grid */}
            {filtered.length === 0 ? (
              <div style={{
                textAlign:"center", padding:"60px 20px",
                background:"#fff", borderRadius:"12px",
                border:"0.5px solid #e5e7eb",
              }}>
                <i className="fa-solid fa-user-doctor" style={{ fontSize:"40px", color:"#d1d5db", display:"block", marginBottom:"12px" }}></i>
                <p style={{ fontSize:"16px", fontWeight:500, marginBottom:"6px" }}>No doctors found</p>
                <p style={{ fontSize:"13px", color:"#9ca3af" }}>Try adjusting your filters</p>
                {(search || spec !== "All") && (
                  <button
                    onClick={() => { setSearch(""); setSpec("All"); }}
                    style={{ marginTop:"14px", padding:"7px 16px", borderRadius:"8px", border:"0.5px solid #d1d5db", background:"#fff", fontSize:"13px", cursor:"pointer" }}>
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                gap:"14px",
              }}>
                {filtered.map(doc => (
                  <DoctorCard key={doc._id} doctor={doc} onBook={setBookingDoc} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MY APPOINTMENTS TAB ── */}
        {tab === "appts" && (
          <>
            {/* Filter */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"16px", flexWrap:"wrap" }}>
              {["All","Pending","Approved","Rejected"].map(s => (
                <button key={s} onClick={() => setApptFilter(s)} style={filterBtnStyle(apptFilter === s)}>
                  {s !== "All" && (
                    <i className={`fa-solid ${STATUS_COLOR[s]?.icon || "fa-list"}`} style={{ fontSize:"10px" }}></i>
                  )}
                  {s}
                  <span style={{
                    fontSize:"11px", fontWeight:600, padding:"1px 5px", borderRadius:"8px",
                    background: apptFilter === s ? "rgba(255,255,255,.25)" : "#f3f4f6",
                    color: apptFilter === s ? "#fff" : "#374151",
                  }}>{counts[s]}</span>
                </button>
              ))}
            </div>

            {filteredAppts.length === 0 ? (
              <div style={{
                textAlign:"center", padding:"60px 20px",
                background:"#fff", borderRadius:"12px",
                border:"0.5px solid #e5e7eb",
              }}>
                <i className="fa-regular fa-calendar-xmark" style={{ fontSize:"40px", color:"#d1d5db", display:"block", marginBottom:"12px" }}></i>
                <p style={{ fontSize:"16px", fontWeight:500, marginBottom:"6px" }}>No appointments yet</p>
                <button onClick={() => setTab("doctors")}
                  style={{ marginTop:"12px", padding:"8px 20px", borderRadius:"8px", border:"none", background:"#426542", color:"#fff", fontSize:"13px", fontWeight:500, cursor:"pointer" }}>
                  <i className="fa-solid fa-user-doctor" style={{ marginRight:"6px" }}></i>Find a doctor
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {filteredAppts.map((a, i) => {
                  const sc = STATUS_COLOR[a.status] || STATUS_COLOR.Pending;
                  return (
                  <div key={a._id} 
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow="0 1px 6px rgba(0,0,0,.06)"; e.currentTarget.style.transform="translateY(0)"; }}
                    style={{
                    background:"#fff", border:"0.5px solid #e5e7eb",
                    borderRadius:"12px", padding:"16px",
                    animation:`fadeUp .4s ease ${i * 50}ms forwards`, opacity:0,
                    boxShadow:"0 1px 6px rgba(0,0,0,.06)",
                    transition:"all .2s ease",
                    }}>
                      <div style={{ display:"flex", gap:"12px", alignItems:"flex-start", flexWrap:"wrap" }}>
                        <div style={{
                          width:"44px", height:"44px", borderRadius:"10px", flexShrink:0,
                          background:"linear-gradient(135deg,#558055,#2c402c)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:"#fff", fontSize:"16px", fontWeight:500,
                        }}>
                          {(a.doctor?.name||"D")[0].toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:"160px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"4px" }}>
                            <p style={{ fontWeight:500, fontSize:"15px" }}>{a.doctor?.name || "Doctor"}</p>
                            {a.doctor?.specialty && (
                              <span style={{ fontSize:"11px", padding:"2px 7px", borderRadius:"6px", background:"#f0fdf4", color:"#15803d", border:"0.5px solid #bbf7d0" }}>
                                {a.doctor.specialty}
                              </span>
                            )}
                            <span style={{
                              display:"inline-flex", alignItems:"center", gap:"4px",
                              fontSize:"11px", fontWeight:600, padding:"2px 8px", borderRadius:"20px",
                              background:sc.bg, color:sc.color, border:`0.5px solid ${sc.border}`,
                            }}>
                              <i className={`fa-solid ${sc.icon}`} style={{ fontSize:"9px" }}></i>
                              {a.status}
                            </span>
                          </div>
                          <p style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
                            <i className="fa-regular fa-calendar" style={{ color:"#9ca3af" }}></i>
                            {new Date(a.appointmentDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                            <span style={{ color:"#d1d5db" }}>·</span>
                            {new Date(a.appointmentDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                          </p>
                          {a.reason && (
                            <p style={{ fontSize:"13px", color:"#6b7280", marginTop:"6px", fontStyle:"italic" }}>
                              <i className="fa-solid fa-quote-left" style={{ color:"#d1d5db", marginRight:"4px", fontSize:"10px" }}></i>
                              {a.reason}
                            </p>
                          )}
                          {a.doctor?.price && (
                            <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"4px" }}>
                              <i className="fa-solid fa-dollar-sign" style={{ marginRight:"3px" }}></i>
                              Consultation fee: ${a.doctor.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {bookingDoc && (
        <BookingModal
          doctor={bookingDoc}
          onClose={() => setBookingDoc(null)}
          onSuccess={fetchAll}
        />
      )}
    </Layout>
  );
}