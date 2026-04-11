import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDoctorAppointments } from "../../api";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DoctorDashboard() {
  const { user }              = useAuth();
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorAppointments()
      .then((r) => setAppts(r.data))
      .catch(() => setAppts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  const pending  = appts.filter((a) => a.status === "Pending").length;
  const approved = appts.filter((a) => a.status === "Approved").length;
  const rejected = appts.filter((a) => a.status === "Rejected").length;
  const today    = appts.filter((a) => {
    const d = new Date(a.appointmentDate);
    const n = new Date();
    return d.toDateString() === n.toDateString() && a.status === "Approved";
  });

  const doughnutData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        data: [pending, approved, rejected],
        backgroundColor: ["#fbbf24", "#558055", "#ef4444"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = Array(7).fill(0);
  appts.forEach((a) => {
    dayCounts[new Date(a.appointmentDate).getDay()]++;
  });

  const barData = {
    labels: days,
    datasets: [
      {
        label: "Appointments",
        data: dayCounts,
        backgroundColor: "rgba(85,128,85,0.75)",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const pendingList = appts.filter((a) => a.status === "Pending").slice(0, 5);

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title">
          <i className="fa-solid fa-stethoscope mr-2" style={{ color: "var(--color-sage-500)" }}></i>
          Doctor Dashboard
        </h1>
        <p className="page-sub">
          Good day, {user?.name ? `Dr. ${user.name}` : "Doctor"} 🩺
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard label="Total"            value={appts.length}  icon="fa-solid fa-clipboard-list" color="sage"   delay={0}   />
          <StatCard label="Pending Review"   value={pending}       icon="fa-solid fa-clock"           color="amber"  delay={75}  />
          <StatCard label="Approved"         value={approved}      icon="fa-solid fa-circle-check"    color="blue"   delay={150} />
          <StatCard label="Today's Patients" value={today.length}  icon="fa-solid fa-user-group"      color="purple" delay={225} />
        </div>

        {/* Two column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Pending appointments */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                <i className="fa-solid fa-bell mr-2" style={{ color: "#f59e0b" }}></i>
                Needs Attention
              </h2>
              <Link
                to="/doctor/appointments"
                style={{ fontSize: "0.875rem", color: "var(--color-sage-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Manage all
              </Link>
            </div>

            {pendingList.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: "2.5rem", marginBottom: "0.75rem", display: "block", color: "var(--color-sage-400)" }}></i>
                All caught up! No pending requests.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {pendingList.map((a) => (
                  <div
                    key={a._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      background: "#fffbeb",
                      borderRadius: "0.75rem",
                      border: "1px solid #fcd34d",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-charcoal-900)" }}>
                        <i className="fa-solid fa-user mr-1" style={{ color: "#f59e0b" }}></i>
                        {a.patient?.name || "Patient"}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-sage-600)", marginTop: "0.2rem" }}>
                        <i className="fa-regular fa-calendar mr-1"></i>
                        {new Date(a.appointmentDate).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                        {a.reason ? ` · ${a.reason.slice(0, 35)}…` : ""}
                      </p>
                    </div>
                    <Link to="/doctor/appointments" className="btn-primary btn-sm" style={{ flexShrink: 0 }}>
                      <i className="fa-solid fa-arrow-right mr-1"></i>Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doughnut chart */}
          <div className="card">
            <h2 className="section-title">
              <i className="fa-solid fa-chart-pie mr-2" style={{ color: "var(--color-sage-500)" }}></i>
              Status Breakdown
            </h2>
            {appts.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem" }}>No data yet</div>
            ) : (
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: { font: { family: "DM Sans", size: 12 } },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title">
            <i className="fa-solid fa-chart-bar mr-2" style={{ color: "var(--color-sage-500)" }}></i>
            Appointments by Day of Week
          </h2>
          <div style={{ height: "200px" }}>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="section-title">
            <i className="fa-solid fa-bolt mr-2" style={{ color: "#f59e0b" }}></i>
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <Link to="/doctor/appointments" className="btn-primary">
              <i className="fa-solid fa-calendar-check mr-2"></i>Manage Appointments
            </Link>
            <Link to="/doctor/appointments" className="btn-secondary">
              <i className="fa-solid fa-clock mr-2"></i>View Pending ({pending})
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}