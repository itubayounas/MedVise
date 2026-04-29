import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  patient: [
    { to:"/patient",              icon:"fa-house",         label:"Dashboard"    },
    { to:"/patient/appointments", icon:"fa-calendar-days", label:"Appointments" },
    { to:"/patient/journals",     icon:"fa-book-open",     label:"Journal"      },
  ],
  doctor: [
    { to:"/doctor",              icon:"fa-house",          label:"Dashboard"    },
    { to:"/doctor/appointments", icon:"fa-calendar-check", label:"Appointments" },
    { to:"/doctor/profile",      icon:"fa-circle-user",    label:"My Profile"   },
  ],
  admin: [
    { to:"/admin",         icon:"fa-chart-line",  label:"Dashboard" },
    { to:"/admin/doctors", icon:"fa-user-doctor", label:"Doctors"   },
  ],
};

const ROLE_STYLE = {
  patient: { background:"#e8f5e8", color:"#2d5a2d" },
  doctor:  { background:"#e8f0fe", color:"#1a3d8f" },
  admin:   { background:"#f0e8fe", color:"#4a1d8f" },
};

export default function Navbar() {
  const { role, logout, user } = useAuth();
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const links = NAV[role] || [];

  const doLogout = () => { setOpen(false); logout(); navigate("/login"); };

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:50,
      background:"rgba(255,255,255,0.88)",
      backdropFilter:"blur(16px)",
      borderBottom:"0.5px solid rgba(119,159,119,0.25)",
      boxShadow:"0 1px 12px rgba(0,0,0,0.06)",
    }}>
      {/* ── Main row ── */}
      <div style={{
        maxWidth:"1200px", margin:"0 auto",
        padding:"0 16px", height:"60px",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:"12px",
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display:"flex", alignItems:"center", gap:"8px",
          textDecoration:"none", flexShrink:0,
        }}>
          <span style={{ fontSize:"22px" }}>🏥</span>
          <span style={{
            fontFamily:"var(--font-display)",
            fontSize:"20px", fontWeight:700, color:"#1a2e1a",
          }}>MedVise</span>
        </Link>

        {/* Desktop nav links */}
        <div style={{
          display:"flex", alignItems:"center", gap:"4px",
          flex:1, justifyContent:"center",
        }}
          className="desktop-nav">
          {links.map(({ to, icon, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link key={to} to={to} style={{
                display:"flex", alignItems:"center", gap:"6px",
                padding:"6px 14px", borderRadius:"8px",
                fontSize:"14px", fontWeight: isActive ? 600 : 500,
                textDecoration:"none", transition:"all .15s",
                background: isActive ? "#e8f5e8" : "transparent",
                color: isActive ? "#2d5a2d" : "#4a5568",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f5f5f5"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize:"12px" }}></i>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          {/* Username — hidden on small screens */}
          {user?.name && (
            <span style={{
              fontSize:"13px", color:"#374151", fontWeight:500,
              maxWidth:"130px", overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}
              className="hide-sm">
              <i className="fa-solid fa-circle-user"
                style={{ color:"#558055", marginRight:"5px" }}></i>
              {user.name}
            </span>
          )}

          {/* Role pill */}
          {role && (
            <span style={{
              fontSize:"11px", fontWeight:700, padding:"3px 10px",
              borderRadius:"20px", textTransform:"capitalize",
              ...(ROLE_STYLE[role] || { background:"#f0f0f0", color:"#333" }),
            }}
              className="hide-sm">
              {role}
            </span>
          )}

          {/* Sign out — desktop */}
          <button onClick={doLogout}
            className="hide-xs"
            style={{
              display:"flex", alignItems:"center", gap:"6px",
              padding:"7px 14px", borderRadius:"8px",
              border:"0.5px solid #d1d5db", background:"#fff",
              fontSize:"13px", fontWeight:600, color:"#374151",
              cursor:"pointer", transition:"all .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize:"11px" }}></i>
            Sign out
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(!open)}
            className="show-mobile-only"
            style={{
              width:"36px", height:"36px", borderRadius:"8px",
              border:"0.5px solid #d1d5db", background:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer",
            }}>
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`}
              style={{ fontSize:"15px", color:"#374151" }}></i>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div style={{
          borderTop:"0.5px solid rgba(119,159,119,0.2)",
          background:"rgba(255,255,255,0.97)",
          padding:"12px 16px 16px",
          animation:"fadeIn .2s ease forwards",
        }}>
          {/* Nav links */}
          <div style={{ display:"flex", flexDirection:"column", gap:"4px", marginBottom:"12px" }}>
            {links.map(({ to, icon, label }) => {
              const isActive = pathname === to;
              return (
                <Link key={to} to={to} onClick={() => setOpen(false)} style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  padding:"10px 12px", borderRadius:"8px",
                  fontSize:"14px", fontWeight: isActive ? 600 : 500,
                  textDecoration:"none", transition:"background .15s",
                  background: isActive ? "#e8f5e8" : "transparent",
                  color: isActive ? "#2d5a2d" : "#374151",
                }}>
                  <i className={`fa-solid ${icon}`}
                    style={{ width:"16px", textAlign:"center", fontSize:"13px" }}></i>
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User info + logout */}
          <div style={{
            borderTop:"0.5px solid #e5e7eb", paddingTop:"12px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              {user?.name && (
                <p style={{ fontSize:"14px", fontWeight:600, color:"#1a2e1a" }}>
                  {user.name}
                </p>
              )}
              {role && (
                <span style={{
                  fontSize:"11px", fontWeight:700, padding:"2px 8px",
                  borderRadius:"20px", marginTop:"3px", display:"inline-block",
                  ...(ROLE_STYLE[role] || {}),
                }}>
                  {role}
                </span>
              )}
            </div>
            <button onClick={doLogout} style={{
              display:"flex", alignItems:"center", gap:"6px",
              padding:"8px 14px", borderRadius:"8px",
              border:"none", background:"#ef4444", color:"#fff",
              fontSize:"13px", fontWeight:600, cursor:"pointer",
            }}>
              <i className="fa-solid fa-right-from-bracket" style={{ fontSize:"11px" }}></i>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}