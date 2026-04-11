import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = {
  patient: [
    { to: "/patient",              icon: "fa-solid fa-house",        label: "Dashboard"    },
    { to: "/patient/appointments", icon: "fa-solid fa-calendar-days",label: "Appointments" },
    { to: "/patient/journals",     icon: "fa-solid fa-book-open",    label: "My Journal"   },
  ],
  doctor: [
    { to: "/doctor",              icon: "fa-solid fa-house",         label: "Dashboard"    },
    { to: "/doctor/appointments", icon: "fa-solid fa-calendar-check",label: "Appointments" },
  ],
  admin: [
    { to: "/admin",         icon: "fa-solid fa-chart-line",  label: "Dashboard" },
    { to: "/admin/doctors", icon: "fa-solid fa-user-doctor", label: "Doctors"   },
  ],
};

const roleStyle = {
  patient: "bg-sage-100   text-sage-700",
  doctor:  "bg-blue-100   text-blue-700",
  admin:   "bg-purple-100 text-purple-700",
};

export default function Navbar() {
  const { role, logout, user } = useAuth();
  const navigate               = useNavigate();
  const { pathname }           = useLocation();
  const [open, setOpen]        = useState(false);
  const links                  = navLinks[role] || [];

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cream-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <span className="text-2xl">🌿</span>
          <span className="font-display text-xl font-bold text-charcoal-900">MindBridge</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                ${pathname === to
                  ? "bg-sage-100 text-sage-700 shadow-sm"
                  : "text-charcoal-700 hover:bg-cream-100"}`}>
              <i className={`${icon} text-xs`}></i>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user?.name && (
            <span className="text-sm font-medium text-charcoal-700">
              <i className="fa-solid fa-circle-user text-sage-400 mr-1"></i>
              {user.name}
            </span>
          )}
          {role && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${roleStyle[role]}`}>
              {role}
            </span>
          )}
          <button onClick={handleLogout} className="btn-secondary btn-sm">
            <i className="fa-solid fa-right-from-bracket mr-1.5"></i>Sign out
          </button>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-cream-100">
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-charcoal-800`}></i>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-cream-200 px-4 py-3 space-y-1 animate-fade-in">
          {links.map(({ to, icon, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${pathname === to ? "bg-sage-100 text-sage-700" : "text-charcoal-700 hover:bg-cream-100"}`}>
              <i className={`${icon} w-4 text-center`}></i>{label}
            </Link>
          ))}
          <div className="border-t border-cream-200 pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm text-sage-600">{user?.name}</span>
            <button onClick={handleLogout} className="btn-danger btn-sm">
              <i className="fa-solid fa-right-from-bracket mr-1"></i>Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}