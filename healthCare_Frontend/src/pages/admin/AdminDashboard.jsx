import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats, getPendingDoctors } from "../../api";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getPendingDoctors()])
      .then(([s, p]) => { setStats(s.data); setPending(p.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  const barData = {
    labels: ["Patients","Approved Doctors","Pending Doctors"],
    datasets: [{
      label: "Count",
      data:  [stats.patients, stats.doctors - stats.pendingDoctors, stats.pendingDoctors],
      backgroundColor: ["rgba(85,128,85,0.75)","rgba(59,130,246,0.75)","rgba(251,191,36,0.75)"],
      borderRadius: 10,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels:   ["Patients","Approved Doctors","Pending Doctors"],
    datasets: [{ data:[stats.patients, stats.doctors - stats.pendingDoctors, stats.pendingDoctors], backgroundColor:["#558055","#3b82f6","#f59e0b"], borderWidth:2, borderColor:"#fff" }],
  };

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title"><i className="fa-solid fa-shield-halved text-purple-500 mr-2"></i>Admin Dashboard</h1>
        <p className="page-sub">Platform overview and management</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users"       value={stats.totalUsers}     icon="fa-solid fa-users"          color="sage"   delay={0}   />
          <StatCard label="Patients"          value={stats.patients}       icon="fa-solid fa-user-injured"   color="blue"   delay={75}  />
          <StatCard label="Doctors"           value={stats.doctors}        icon="fa-solid fa-user-doctor"    color="purple" delay={150} />
          <StatCard label="Pending Approval"  value={stats.pendingDoctors} icon="fa-solid fa-user-clock"     color="amber"  delay={225} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Bar chart */}
          <div className="card">
            <h2 className="section-title"><i className="fa-solid fa-chart-bar text-sage-500 mr-2"></i>User Distribution</h2>
            <div className="h-52">
              <Bar data={barData} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } } }} />
            </div>
          </div>

          {/* Doughnut */}
          <div className="card">
            <h2 className="section-title"><i className="fa-solid fa-chart-pie text-sage-500 mr-2"></i>Role Breakdown</h2>
            <div className="h-52 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ plugins:{ legend:{ position:"right", labels:{ font:{ family:"DM Sans" } } } }, maintainAspectRatio:false }} />
            </div>
          </div>
        </div>

        {/* Pending doctors alert */}
        {pending.length > 0 && (
          <div className="card mb-6 border-amber-200 bg-amber-50/50 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0 text-amber-800">
                <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>
                {pending.length} Doctor{pending.length>1?"s":""} Awaiting Approval
              </h2>
              <Link to="/admin/doctors" className="btn-primary btn-sm">
                <i className="fa-solid fa-arrow-right mr-1.5"></i>Review All
              </Link>
            </div>
            <div className="space-y-2">
              {pending.slice(0,3).map(d => (
                <div key={d._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">
                      {(d.name||"D")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-charcoal-900">{d.name}</p>
                      <p className="text-xs text-sage-500">{d.email}</p>
                    </div>
                  </div>
                  <span className="badge-pending"><i className="fa-solid fa-clock"></i>Pending</span>
                </div>
              ))}
              {pending.length > 3 && (
                <p className="text-sm text-amber-700 text-center font-medium">+{pending.length-3} more waiting…</p>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="section-title"><i className="fa-solid fa-bolt text-amber-400 mr-2"></i>Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/doctors" className="btn-primary">
              <i className="fa-solid fa-user-doctor mr-2"></i>Manage Doctors
            </Link>
            {pending.length > 0 && (
              <Link to="/admin/doctors" className="btn-secondary">
                <i className="fa-solid fa-user-clock mr-2"></i>Approve Pending ({pending.length})
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}