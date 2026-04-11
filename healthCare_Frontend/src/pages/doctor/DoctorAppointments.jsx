import { useEffect, useState } from "react";
import { getDoctorAppointments, approveAppointment, rejectAppointment } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const STATUS_BADGE = { Pending:"badge-pending", Approved:"badge-approved", Rejected:"badge-rejected" };
const STATUS_ICON  = { Pending:"fa-clock", Approved:"fa-circle-check", Rejected:"fa-circle-xmark" };

export default function DoctorAppointments() {
  const [appts, setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [acting, setActing] = useState(null);

  useEffect(() => {
    getDoctorAppointments().then(r => setAppts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await approveAppointment(id);
      setAppts(prev => prev.map(a => a._id===id ? {...a, status:"Approved"} : a));
      toast.success("Appointment approved! ✅");
    } catch { toast.error("Action failed"); }
    finally { setActing(null); }
  };

  const handleReject = async (id) => {
    setActing(id);
    try {
      await rejectAppointment(id);
      setAppts(prev => prev.map(a => a._id===id ? {...a, status:"Rejected"} : a));
      toast.success("Appointment rejected.");
    } catch { toast.error("Action failed"); }
    finally { setActing(null); }
  };

  const filtered = filter === "All" ? appts : appts.filter(a => a.status === filter);
  const counts   = { All:appts.length, Pending:appts.filter(a=>a.status==="Pending").length, Approved:appts.filter(a=>a.status==="Approved").length, Rejected:appts.filter(a=>a.status==="Rejected").length };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title"><i className="fa-solid fa-calendar-check text-sage-500 mr-2"></i>Patient Appointments</h1>
        <p className="page-sub">Review and respond to appointment requests</p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["All","Pending","Approved","Rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                filter===s ? "bg-sage-600 text-white shadow-sm" : "bg-white text-charcoal-800 border border-cream-300 hover:bg-cream-100"
              }`}>
              <i className={`fa-solid ${STATUS_ICON[s]||"fa-list"} text-xs`}></i>{s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter===s?"bg-white/25 text-white":"bg-cream-200 text-charcoal-700"}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state py-16">
            <i className="fa-regular fa-calendar-xmark text-5xl mb-4 block"></i>
            <p className="font-semibold">No {filter !== "All" ? filter.toLowerCase() : ""} appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a, i) => (
              <div key={a._id} className="card card-hover animate-fade-up" style={{animationDelay:`${i*50}ms`,opacity:0,animationFillMode:"forwards"}}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage-200 to-sage-400 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                        {(a.patient?.name||"P")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-charcoal-900">{a.patient?.name || "Patient"}</p>
                        <p className="text-xs text-sage-500">{a.patient?.email}</p>
                      </div>
                      <span className={STATUS_BADGE[a.status]}>
                        <i className={`fa-solid ${STATUS_ICON[a.status]}`}></i>{a.status}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-charcoal-700">
                      <span className="flex items-center gap-2">
                        <i className="fa-regular fa-calendar text-sage-400 w-4"></i>
                        {new Date(a.appointmentDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="fa-regular fa-clock text-sage-400 w-4"></i>
                        {new Date(a.appointmentDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                      </span>
                    </div>

                    {a.reason && (
                      <div className="mt-3 px-3 py-2 bg-cream-50 rounded-xl border border-cream-200">
                        <p className="text-xs font-semibold text-sage-500 mb-0.5">
                          <i className="fa-solid fa-notes-medical mr-1"></i>Reason
                        </p>
                        <p className="text-sm text-charcoal-800 italic">"{a.reason}"</p>
                      </div>
                    )}

                    <p className="text-xs text-sage-400 mt-2">
                      <i className="fa-regular fa-clock mr-1"></i>
                      Requested {new Date(a.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </p>
                  </div>

                  {/* Action buttons */}
                  {a.status === "Pending" && (
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleApprove(a._id)} disabled={acting===a._id}
                        className="btn-success btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5">
                        {acting===a._id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                        Approve
                      </button>
                      <button onClick={() => handleReject(a._id)} disabled={acting===a._id}
                        className="btn-danger btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5">
                        {acting===a._id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-xmark"></i>}
                        Reject
                      </button>
                    </div>
                  )}
                  {a.status !== "Pending" && (
                    <div className={`text-4xl flex-shrink-0 ${a.status==="Approved"?"text-sage-500":"text-red-400"}`}>
                      <i className={`fa-solid ${STATUS_ICON[a.status]}`}></i>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}