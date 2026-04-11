import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPatientAppointments, getJournals } from "../../api";
import Layout from "../../components/Layout";


import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const MOOD_COLORS = {
  Happy:"bg-yellow-100 text-yellow-800", Sad:"bg-blue-100 text-blue-800",
  Stressed:"bg-red-100 text-red-800",    Anxious:"bg-orange-100 text-orange-800",
  Calm:"bg-sage-100 text-sage-700",      Angry:"bg-red-200 text-red-900",
  Unwell:"bg-purple-100 text-purple-800",
};
const MOOD_EMOJI = { Happy:"😊", Sad:"😔", Stressed:"😤", Anxious:"😰", Calm:"😌", Angry:"😠", Unwell:"🤒" };

export default function PatientDashboard() {
  const { user }              = useAuth();
  const [appts, setAppts]     = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatientAppointments(), getJournals()])
      .then(([a, j]) => { setAppts(a.data); setJournals(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner/></Layout>;

  const pending  = appts.filter(a => a.status === "Pending").length;
  const approved = appts.filter(a => a.status === "Approved").length;
  const rejected = appts.filter(a => a.status === "Rejected").length;
  const upcoming = appts.filter(a => a.status === "Approved" && new Date(a.appointmentDate) > new Date());

  // Mood chart data
  const moodCounts = {};
  journals.forEach(j => { if (j.mood) moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1; });
  const moodLabels = Object.keys(moodCounts);
  const chartData  = {
    labels:   moodLabels.map(m => `${MOOD_EMOJI[m] || ""} ${m}`),
    datasets: [{
      data:            moodLabels.map(m => moodCounts[m]),
      backgroundColor: ["#fef08a","#bfdbfe","#fecaca","#fed7aa","#bbf7d0","#fca5a5","#e9d5ff"],
      borderWidth:     2,
      borderColor:     "#fff",
    }],
  };

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title">
          <i className="fa-solid fa-hand-wave text-amber-400 mr-2"></i>
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="page-sub">Here's your health overview for today</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Appointments" value={appts.length}    icon="fa-solid fa-calendar-days" color="sage"   delay={0}   />
          <StatCard label="Pending"             value={pending}         icon="fa-solid fa-clock"          color="amber"  delay={75}  />
          <StatCard label="Approved"            value={approved}        icon="fa-solid fa-circle-check"   color="blue"   delay={150} />
          <StatCard label="Journal Entries"     value={journals.length} icon="fa-solid fa-book-open"      color="purple" delay={225} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upcoming appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">
                <i className="fa-solid fa-calendar-check text-sage-500 mr-2"></i>Upcoming
              </h2>
              <Link to="/patient/appointments" className="text-sm text-sage-600 hover:underline font-semibold">View all</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty-state py-8 text-sm">
                <i className="fa-regular fa-calendar-xmark text-4xl mb-3 block"></i>
                No upcoming appointments
                <Link to="/patient/appointments" className="block text-sage-600 font-semibold mt-2 hover:underline">Book one now →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map(a => (
                  <div key={a._id} className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
                    <div>
                      <p className="font-semibold text-sm text-charcoal-900">
                        <i className="fa-solid fa-user-doctor text-sage-400 mr-1.5"></i>
                        {a.doctor?.name || "Doctor"}
                      </p>
                      <p className="text-xs text-sage-600 mt-0.5">
                        <i className="fa-regular fa-clock mr-1"></i>
                        {new Date(a.appointmentDate).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}
                      </p>
                    </div>
                    <span className="badge-approved"><i className="fa-solid fa-check"></i> Approved</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mood chart */}
          <div className="card">
            <h2 className="section-title">
              <i className="fa-solid fa-face-smile text-amber-400 mr-2"></i>Mood Overview
            </h2>
            {moodLabels.length === 0 ? (
              <div className="empty-state py-8 text-sm">
                <i className="fa-solid fa-face-meh text-4xl mb-3 block"></i>
                Write journals to see your mood chart
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <Doughnut data={chartData} options={{ plugins:{ legend:{ position:"right", labels:{ font:{ family:"DM Sans", size:11 } } } }, maintainAspectRatio:false }} />
              </div>
            )}
          </div>
        </div>

        {/* Recent journals */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">
              <i className="fa-solid fa-book-open text-sage-500 mr-2"></i>Recent Journals
            </h2>
            <Link to="/patient/journals" className="text-sm text-sage-600 hover:underline font-semibold">View all</Link>
          </div>
          {journals.length === 0 ? (
            <div className="empty-state py-6 text-sm">
              <i className="fa-solid fa-pen-to-square text-4xl mb-3 block"></i>
              No journal entries yet.
              <Link to="/patient/journals" className="block text-sage-600 font-semibold mt-2 hover:underline">Write your first entry →</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {journals.slice(0, 3).map(j => (
                <div key={j._id} className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-charcoal-900 truncate">{j.title}</p>
                    {j.mood && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${MOOD_COLORS[j.mood] || "bg-gray-100 text-gray-600"}`}>
                        {MOOD_EMOJI[j.mood]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-700 line-clamp-2 leading-relaxed">{j.content}</p>
                  <p className="text-xs text-sage-400 mt-2">
                    <i className="fa-regular fa-clock mr-1"></i>
                    {new Date(j.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="section-title"><i className="fa-solid fa-bolt text-amber-400 mr-2"></i>Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/patient/appointments" className="btn-primary">
              <i className="fa-solid fa-calendar-plus mr-2"></i>Book Appointment
            </Link>
            <Link to="/patient/journals" className="btn-secondary">
              <i className="fa-solid fa-pen mr-2"></i>Write in Journal
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}