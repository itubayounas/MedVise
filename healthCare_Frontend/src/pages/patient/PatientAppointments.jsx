import { useEffect, useState } from "react";
import { getPatientAppointments, createAppointment, getAllDoctors } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const STATUS_BADGE = { Pending:"badge-pending", Approved:"badge-approved", Rejected:"badge-rejected" };
const STATUS_ICON  = { Pending:"fa-clock", Approved:"fa-circle-check", Rejected:"fa-circle-xmark" };

export default function PatientAppointments() {
  const [appts, setAppts]     = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ doctor:"", appointmentDate:"", reason:"" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter]   = useState("All");

  const fetchAll = async () => {
    try {
      const [a, d] = await Promise.all([getPatientAppointments(), getAllDoctors()]);
      setAppts(a.data);
      setDoctors(d.data);
    } catch {
      try {
        const a = await getPatientAppointments();
        setAppts(a.data);
      } catch { toast.error("Failed to load appointments"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAppointment(form);
      toast.success("Appointment booked! Awaiting doctor approval. ✅");
      setForm({ doctor:"", appointmentDate:"", reason:"" });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book");
    } finally { setSubmitting(false); }
  };

  const filtered = filter === "All" ? appts : appts.filter(a => a.status === filter);
  const counts = { All:appts.length, Pending:appts.filter(a=>a.status==="Pending").length, Approved:appts.filter(a=>a.status==="Approved").length, Rejected:appts.filter(a=>a.status==="Rejected").length };
  const today  = new Date().toISOString().slice(0, 16);

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <h1 className="page-title">
            <i className="fa-solid fa-calendar-days text-sage-500 mr-2"></i>Appointments
          </h1>
          <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-secondary" : "btn-primary"}>
            <i className={`fa-solid ${showForm ? "fa-xmark" : "fa-plus"} mr-2`}></i>
            {showForm ? "Cancel" : "Book Appointment"}
          </button>
        </div>
        <p className="page-sub">Manage all your doctor appointments</p>

        {/* Booking form */}
        {showForm && (
          <div className="card mb-6 border-sage-200 animate-fade-in bg-sage-50/50">
            <h2 className="section-title"><i className="fa-solid fa-calendar-plus text-sage-500 mr-2"></i>Book New Appointment</h2>
            <form onSubmit={handleBook} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label"><i className="fa-solid fa-user-doctor text-sage-400 mr-1.5"></i>Select Doctor</label>
                {doctors.length > 0 ? (
                  <select className="input" value={form.doctor} onChange={e => setForm({...form, doctor:e.target.value})} required>
                    <option value="">-- Choose a doctor --</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.email}</option>)}
                  </select>
                ) : (
                  <input className="input" placeholder="Paste Doctor ID"
                    value={form.doctor} onChange={e => setForm({...form, doctor:e.target.value})} required />
                )}
              </div>
              <div>
                <label className="label"><i className="fa-regular fa-clock text-sage-400 mr-1.5"></i>Date & Time</label>
                <input type="datetime-local" className="input" min={today}
                  value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate:e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <label className="label"><i className="fa-solid fa-notes-medical text-sage-400 mr-1.5"></i>Reason for Visit</label>
                <textarea className="input resize-none" rows={3} placeholder="Describe your symptoms or concern..."
                  value={form.reason} onChange={e => setForm({...form, reason:e.target.value})} />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Booking…</> : <><i className="fa-solid fa-paper-plane mr-2"></i>Book Appointment</>}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {["All","Pending","Approved","Rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                filter === s ? "bg-sage-600 text-white shadow-sm" : "bg-white text-charcoal-800 border border-cream-300 hover:bg-cream-100"
              }`}>
              <i className={`fa-solid ${STATUS_ICON[s] || "fa-list"} text-xs`}></i>{s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter===s ? "bg-white/25 text-white" : "bg-cream-200 text-charcoal-700"}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state py-16">
            <i className="fa-regular fa-calendar-xmark text-5xl mb-4 block"></i>
            <p className="font-semibold text-charcoal-700">No {filter !== "All" ? filter.toLowerCase() : ""} appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a, i) => (
              <div key={a._id} className="card card-hover animate-fade-up" style={{ animationDelay:`${i*50}ms`, opacity:0, animationFillMode:"forwards" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-bold text-sage-700 flex-shrink-0">
                        {(a.doctor?.name||"D")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-charcoal-900">{a.doctor?.name || "Doctor"}</p>
                        <p className="text-xs text-sage-500">{a.doctor?.email}</p>
                      </div>
                      <span className={STATUS_BADGE[a.status]}>
                        <i className={`fa-solid ${STATUS_ICON[a.status]}`}></i>{a.status}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-700 flex items-center gap-2 mt-1">
                      <i className="fa-regular fa-calendar text-sage-400"></i>
                      {new Date(a.appointmentDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
                      {" · "}
                      {new Date(a.appointmentDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                    </p>
                    {a.reason && (
                      <p className="text-sm text-charcoal-600 mt-2 italic px-3 py-1.5 bg-cream-50 rounded-lg border border-cream-200">
                        <i className="fa-solid fa-quote-left text-sage-300 mr-1"></i>{a.reason}
                      </p>
                    )}
                  </div>
                  <div className={`text-3xl ${a.status==="Approved"?"text-sage-500":a.status==="Rejected"?"text-red-400":"text-amber-400"}`}>
                    <i className={`fa-solid ${STATUS_ICON[a.status]}`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}