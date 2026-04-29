import { useEffect, useState } from "react";
import { getAllDoctorsAdmin, approveDoctor, rejectDoctor } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function AdminDoctors() {
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [acting, setActing]       = useState(null); // id being approved/rejected
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("pending");
  const [confirmReject, setConfirmReject] = useState(null); // doctor to reject

  const fetchDoctors = async () => {
    try {
      const { data } = await getAllDoctorsAdmin();
      setDoctors(data);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await approveDoctor(id);
      toast.success("Doctor approved! They can now log in. ✅");
      setDoctors(prev => prev.map(d =>
        d._id === id ? { ...d, isApproved: true } : d
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed.");
    } finally { setActing(null); }
  };

  const handleReject = async (id) => {
    setActing(id);
    try {
      await rejectDoctor(id);
      toast.success("Doctor rejected and removed.");
      setDoctors(prev => prev.filter(d => d._id !== id));
      setConfirmReject(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed.");
    } finally { setActing(null); }
  };

  const pending  = doctors.filter(d => !d.isApproved);
  const approved = doctors.filter(d =>  d.isApproved);
  const list     = (tab === "pending" ? pending : approved).filter(d =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 16px" }}>

        {/* Page header */}
        <div style={{ marginBottom:"28px" }}>
          <h1 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(1.4rem,3vw,2rem)",
            fontWeight:700, color:"#141814", marginBottom:"4px",
          }}>
            <i className="fa-solid fa-user-doctor"
              style={{ color:"#558055", marginRight:"10px" }}></i>
            Doctor Management
          </h1>
          <p style={{ fontSize:"14px", color:"#6b8f6b" }}>
            Review registrations, approve or reject doctor accounts
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))",
          gap:"12px", marginBottom:"24px",
        }}>
          {[
            { label:"Total Doctors",    value:doctors.length, icon:"fa-user-doctor",  bg:"#f0fdf4", color:"#166534" },
            { label:"Pending Approval", value:pending.length, icon:"fa-clock",         bg:"#fefce8", color:"#854d0e" },
            { label:"Approved",         value:approved.length,icon:"fa-circle-check",  bg:"#eff6ff", color:"#1e40af" },
          ].map((s,i) => (
            <div key={i} style={{
              background:"#fff", borderRadius:"12px",
              border:"0.5px solid #e8dbc0", padding:"16px",
              display:"flex", alignItems:"center", gap:"12px",
            }}>
              <div style={{
                width:"40px", height:"40px", borderRadius:"10px",
                background:s.bg, display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0,
              }}>
                <i className={`fa-solid ${s.icon}`}
                  style={{ color:s.color, fontSize:"16px" }}></i>
              </div>
              <div>
                <p style={{ fontSize:"11px", color:"#6b7280", fontWeight:600, textTransform:"uppercase", letterSpacing:".04em" }}>
                  {s.label}
                </p>
                <p style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", fontWeight:700, color:"#141814", lineHeight:1 }}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending alert */}
        {pending.length > 0 && tab === "pending" && (
          <div style={{
            padding:"14px 18px", marginBottom:"20px",
            background:"#fefce8", borderRadius:"10px",
            border:"0.5px solid #fde68a",
            display:"flex", alignItems:"center", gap:"10px",
          }}>
            <i className="fa-solid fa-triangle-exclamation"
              style={{ color:"#d97706", flexShrink:0 }}></i>
            <p style={{ fontSize:"13px", color:"#92400e", fontWeight:500 }}>
              <strong>{pending.length} doctor{pending.length > 1 ? "s" : ""}</strong> waiting
              for approval — they cannot log in until approved or rejected.
            </p>
          </div>
        )}

        {/* Tabs + search */}
        <div style={{
          display:"flex", gap:"12px", marginBottom:"20px",
          flexWrap:"wrap", alignItems:"center",
        }}>
          <div style={{
            display:"flex", gap:"4px", background:"#f3f4f6",
            padding:"4px", borderRadius:"10px",
            border:"0.5px solid #e5e7eb",
          }}>
            {[
              { key:"pending",  label:`Pending (${pending.length})`  },
              { key:"approved", label:`Approved (${approved.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:"6px 16px", borderRadius:"7px", border:"none",
                fontSize:"13px", fontWeight:600, cursor:"pointer",
                background: tab === t.key ? "#fff"       : "transparent",
                color:      tab === t.key ? "#1a2e1a"    : "#6b7280",
                boxShadow:  tab === t.key ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                transition:"all .15s",
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{
            display:"flex", alignItems:"center", gap:"8px",
            background:"#fff", border:"0.5px solid #d1d5db",
            borderRadius:"8px", padding:"0 12px", height:"36px",
            flex:1, minWidth:"180px", maxWidth:"320px",
          }}>
            <i className="fa-solid fa-magnifying-glass"
              style={{ color:"#9ca3af", fontSize:"12px" }}></i>
            <input
              type="text"
              placeholder="Search name, email, specialty…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border:"none", outline:"none", background:"transparent",
                fontSize:"13px", color:"#1f2937", width:"100%",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ border:"none", background:"none", cursor:"pointer", padding:0 }}>
                <i className="fa-solid fa-xmark"
                  style={{ fontSize:"12px", color:"#9ca3af" }}></i>
              </button>
            )}
          </div>
        </div>

        {/* Doctor list */}
        {list.length === 0 ? (
          <div style={{
            background:"#fff", borderRadius:"14px",
            border:"0.5px solid #e8dbc0", padding:"60px 24px",
            textAlign:"center",
          }}>
            <i className="fa-solid fa-user-doctor"
              style={{ fontSize:"40px", color:"#d1d5db", display:"block", marginBottom:"12px" }}></i>
            <p style={{ fontSize:"16px", fontWeight:600, color:"#374151", marginBottom:"6px" }}>
              {search
                ? "No doctors match your search"
                : tab === "pending"
                  ? "No pending approvals 🎉"
                  : "No approved doctors yet"}
            </p>
            <p style={{ fontSize:"13px", color:"#9ca3af" }}>
              {search
                ? "Try adjusting your search"
                : tab === "pending"
                  ? "All doctor applications have been reviewed"
                  : "Approve pending doctors to see them here"}
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {list.map((d, i) => (
              <DoctorRow
                key={d._id}
                doctor={d}
                index={i}
                acting={acting}
                onApprove={handleApprove}
                onRejectClick={setConfirmReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject confirmation modal */}
      {confirmReject && (
        <RejectModal
          doctor={confirmReject}
          acting={acting === confirmReject._id}
          onConfirm={() => handleReject(confirmReject._id)}
          onCancel={() => setConfirmReject(null)}
        />
      )}
    </Layout>
  );
}

// ── Doctor row card ────────────────────────────────────────
function DoctorRow({ doctor: d, index: i, acting, onApprove, onRejectClick }) {
  const [expanded, setExpanded] = useState(false);
  const isBusy = acting === d._id;

  return (
    <div style={{
      background:"#fff", borderRadius:"14px",
      border: d.isApproved ? "0.5px solid #e8dbc0" : "0.5px solid #fde68a",
      boxShadow:"0 1px 6px rgba(0,0,0,.05)", overflow:"hidden",
      animation:`fadeUp .4s ease ${i * 50}ms forwards`, opacity:0,
    }}>
      {/* Stripe */}
      <div style={{ height:"3px", background: d.isApproved ? "#16a34a" : "#f59e0b" }} />

      <div style={{ padding:"20px" }}>
        {/* Main row */}
        <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", flexWrap:"wrap" }}>

          {/* Avatar */}
          <div style={{
            width:"52px", height:"52px", borderRadius:"12px", flexShrink:0,
            background:"linear-gradient(135deg,#558055,#2c402c)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:"20px", fontWeight:700,
          }}>
            {(d.name || "D")[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:"200px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap", marginBottom:"8px" }}>
              <p style={{ fontWeight:700, fontSize:"16px", color:"#141814" }}>{d.name}</p>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:"4px",
                padding:"3px 10px", borderRadius:"20px",
                fontSize:"11px", fontWeight:700,
                background: d.isApproved ? "#dcfce7" : "#fef3c7",
                color:      d.isApproved ? "#15803d" : "#92400e",
                border:     d.isApproved ? "0.5px solid #86efac" : "0.5px solid #fcd34d",
              }}>
                <i className={`fa-solid ${d.isApproved ? "fa-circle-check" : "fa-clock"}`}
                  style={{ fontSize:"9px" }}></i>
                {d.isApproved ? "Approved" : "Pending"}
              </span>
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:"12px" }}>
              {[
                { icon:"fa-stethoscope",      val: d.specialty  || "No specialty"     },
                { icon:"fa-envelope",          val: d.email                             },
                d.phone && { icon:"fa-phone",  val: d.phone                             },
                d.experience != null && { icon:"fa-briefcase-medical", val:`${d.experience} yrs` },
                d.price != null && { icon:"fa-dollar-sign", val:`$${d.price}/visit`     },
                d.address && { icon:"fa-location-dot", val: d.address                   },
              ].filter(Boolean).map((item, idx) => (
                <span key={idx} style={{
                  fontSize:"13px", color:"#6b7280",
                  display:"flex", alignItems:"center", gap:"5px",
                }}>
                  <i className={`fa-solid ${item.icon}`}
                    style={{ color:"#9ca3af", fontSize:"11px", width:"12px" }}></i>
                  {item.val}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:"8px", flexShrink:0, flexWrap:"wrap", alignItems:"flex-start" }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              display:"flex", alignItems:"center", gap:"6px",
              padding:"8px 14px", borderRadius:"8px",
              border:"0.5px solid #d1d5db", background:"#fff",
              fontSize:"13px", fontWeight:600, color:"#374151", cursor:"pointer",
            }}>
              <i className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`}
                style={{ fontSize:"10px" }}></i>
              {expanded ? "Less" : "Details"}
            </button>

            {!d.isApproved && (
              <>
                <button
                  onClick={() => onApprove(d._id)}
                  disabled={isBusy}
                  style={{
                    display:"flex", alignItems:"center", gap:"6px",
                    padding:"8px 18px", borderRadius:"8px", border:"none",
                    background: isBusy ? "#9ca3af" : "#426542",
                    color:"#fff", fontSize:"13px", fontWeight:600,
                    cursor: isBusy ? "not-allowed" : "pointer",
                  }}>
                  {isBusy
                    ? <><i className="fa-solid fa-spinner fa-spin"></i>Working…</>
                    : <><i className="fa-solid fa-check"></i>Approve</>}
                </button>

                <button
                  onClick={() => onRejectClick(d)}
                  disabled={isBusy}
                  style={{
                    display:"flex", alignItems:"center", gap:"6px",
                    padding:"8px 16px", borderRadius:"8px",
                    border:"0.5px solid #fca5a5", background:"#fff1f2",
                    color:"#dc2626", fontSize:"13px", fontWeight:600,
                    cursor: isBusy ? "not-allowed" : "pointer",
                  }}>
                  <i className="fa-solid fa-xmark"></i>Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div style={{
            marginTop:"16px", paddingTop:"16px",
            borderTop:"0.5px solid #f2ebda",
            display:"flex", flexDirection:"column", gap:"12px",
            animation:"fadeIn .2s ease forwards",
          }}>
            {/* Bio */}
            {d.bio && (
              <div style={{
                padding:"12px 16px", background:"#f0f9ff",
                borderRadius:"10px", border:"0.5px solid #bae6fd",
              }}>
                <p style={{ fontSize:"11px", fontWeight:700, color:"#0369a1", marginBottom:"4px", textTransform:"uppercase", letterSpacing:".04em" }}>
                  About
                </p>
                <p style={{ fontSize:"13px", color:"#0c4a6e", lineHeight:1.6, fontStyle:"italic" }}>
                  "{d.bio}"
                </p>
              </div>
            )}

            {/* Schedule */}
            {d.availability?.length > 0 && (
              <div>
                <p style={{ fontSize:"11px", fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:".04em", marginBottom:"8px" }}>
                  <i className="fa-solid fa-calendar-days" style={{ marginRight:"5px" }}></i>
                  Weekly Schedule
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {d.availability.map((sl, idx) => (
                    <span key={idx} style={{
                      fontSize:"12px", padding:"5px 12px", borderRadius:"8px",
                      background:"#f4f7f4", border:"0.5px solid #ccdccc",
                      color:"#364f36", fontWeight:600,
                    }}>
                      {sl.day.slice(0,3)} · {sl.start}–{sl.end}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extra info */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"16px" }}>
              {d.gender && (
                <span style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"5px" }}>
                  <i className="fa-solid fa-venus-mars" style={{ color:"#9ca3af", fontSize:"11px" }}></i>
                  {d.gender}
                </span>
              )}
              <span style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"5px" }}>
                <i className="fa-regular fa-calendar" style={{ color:"#9ca3af", fontSize:"11px" }}></i>
                Registered {new Date(d.createdAt).toLocaleDateString("en-US",{
                  month:"long", day:"numeric", year:"numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reject confirmation modal ──────────────────────────────
function RejectModal({ doctor, acting, onConfirm, onCancel }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onCancel()}
      style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.45)",
        backdropFilter:"blur(4px)",
        zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px",
      }}>
      <div style={{
        background:"#fff", borderRadius:"16px",
        padding:"32px 28px", maxWidth:"420px", width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,.15)",
        animation:"fadeUp .25s ease forwards",
      }}>
        <div style={{ textAlign:"center", marginBottom:"24px" }}>
          <div style={{
            width:"60px", height:"60px", borderRadius:"50%",
            background:"#fee2e2", margin:"0 auto 16px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <i className="fa-solid fa-user-xmark"
              style={{ color:"#dc2626", fontSize:"24px" }}></i>
          </div>
          <h3 style={{
            fontFamily:"var(--font-display)",
            fontSize:"1.2rem", fontWeight:700,
            color:"#141814", marginBottom:"8px",
          }}>
            Reject this doctor?
          </h3>
          <p style={{ fontSize:"14px", color:"#6b7280", lineHeight:1.6 }}>
            You are about to reject and permanently delete
            <strong style={{ color:"#374151" }}> {doctor.name}</strong>'s account.
            This action cannot be undone.
          </p>

          {/* Doctor info */}
          <div style={{
            marginTop:"16px", padding:"12px 16px",
            background:"#fef2f2", borderRadius:"10px",
            border:"0.5px solid #fecaca",
            display:"flex", alignItems:"center", gap:"12px", textAlign:"left",
          }}>
            <div style={{
              width:"40px", height:"40px", borderRadius:"10px", flexShrink:0,
              background:"linear-gradient(135deg,#ef4444,#b91c1c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:"16px", fontWeight:700,
            }}>
              {(doctor.name||"D")[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight:600, fontSize:"14px", color:"#141814" }}>{doctor.name}</p>
              <p style={{ fontSize:"12px", color:"#6b7280" }}>{doctor.email}</p>
              <p style={{ fontSize:"12px", color:"#6b7280" }}>{doctor.specialty || "No specialty"}</p>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onCancel} disabled={acting} style={{
            flex:1, padding:"11px", borderRadius:"10px",
            border:"0.5px solid #d1d5db", background:"#fff",
            color:"#374151", fontSize:"14px", fontWeight:600,
            cursor: acting ? "not-allowed" : "pointer",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={acting} style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center",
            gap:"8px", padding:"11px", borderRadius:"10px",
            border:"none",
            background: acting ? "#9ca3af" : "#dc2626",
            color:"#fff", fontSize:"14px", fontWeight:600,
            cursor: acting ? "not-allowed" : "pointer",
          }}>
            {acting
              ? <><i className="fa-solid fa-spinner fa-spin"></i>Rejecting…</>
              : <><i className="fa-solid fa-user-xmark"></i>Yes, Reject</>}
          </button>
        </div>
      </div>
    </div>
  );
}