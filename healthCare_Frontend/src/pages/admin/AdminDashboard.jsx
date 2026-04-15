import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats, getPendingDoctors, getAllUsers } from "../../api";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([getStats(), getPendingDoctors(), getAllUsers()])
      .then(([s,p,u])=>{ setStats(s.data); setPending(p.data); setUsers(u.data); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <Layout><Spinner /></Layout>;

  const approvedDocs = stats.doctors - stats.pendingDoctors;
  const barData={
    labels:["Patients","Approved Doctors","Pending Doctors"],
    datasets:[{label:"Count",data:[stats.patients,approvedDocs,stats.pendingDoctors],backgroundColor:["rgba(85,128,85,0.8)","rgba(37,99,235,0.8)","rgba(245,158,11,0.8)"],borderRadius:8,borderSkipped:false}],
  };
  const doughnutData={
    labels:["Patients","Approved Doctors","Pending"],
    datasets:[{data:[stats.patients,approvedDocs,stats.pendingDoctors],backgroundColor:["#558055","#2563eb","#f59e0b"],borderWidth:2,borderColor:"#fff"}],
  };

  const recentUsers = users.slice(0,5);

  return (
    <Layout>
      <div className="animate-fade-up">
        <div style={{marginBottom:"1.5rem"}}>
          <h1 className="page-title">
            <i className="fa-solid fa-shield-halved" style={{color:"#7c3aed",marginRight:"0.5rem"}}></i>
            Admin Dashboard
          </h1>
          <p className="page-sub">MedVise platform overview — {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
        </div>

        <div className="grid-4" style={{marginBottom:"1.5rem"}}>
          <StatCard label="Total Users"      value={stats.totalUsers}     icon="fa-users"          colorClass="sage"   delay={0}   />
          <StatCard label="Patients"         value={stats.patients}       icon="fa-user-injured"   colorClass="blue"   delay={80}  />
          <StatCard label="Active Doctors"   value={approvedDocs}         icon="fa-user-doctor"    colorClass="teal"   delay={160} />
          <StatCard label="Pending Approval" value={stats.pendingDoctors} icon="fa-user-clock"     colorClass="amber"  delay={240} />
        </div>

        <div className="grid-2" style={{marginBottom:"1.5rem"}}>
          <div className="card">
            <h2 className="section-title"><i className="fa-solid fa-chart-bar" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>User Distribution</h2>
            <div className="chart-container chart-sm">
              <Bar data={barData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}} />
            </div>
          </div>
          <div className="card">
            <h2 className="section-title"><i className="fa-solid fa-chart-pie" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>Role Breakdown</h2>
            <div className="chart-container chart-sm" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Doughnut data={doughnutData} options={{plugins:{legend:{position:"right",labels:{font:{family:"DM Sans",size:11},boxWidth:10,padding:8}}},maintainAspectRatio:false}} />
            </div>
          </div>
        </div>

        {/* Pending alert */}
        {pending.length>0&&(
          <div className="card" style={{marginBottom:"1.5rem",background:"#fffbeb",border:"1px solid #fcd34d"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.75rem",marginBottom:"1rem"}}>
              <h2 className="section-title" style={{margin:0,color:"#92400e"}}>
                <i className="fa-solid fa-triangle-exclamation" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>
                {pending.length} Doctor{pending.length>1?"s":""} Awaiting Approval
              </h2>
              <Link to="/admin/doctors" className="btn-base btn-primary btn-sm">
                <i className="fa-solid fa-arrow-right"></i>Review All
              </Link>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {pending.slice(0,3).map(d=>(
                <div key={d._id} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem",background:"#fff",borderRadius:"0.875rem",border:"1px solid #fcd34d"}}>
                  <div className="avatar avatar-sm" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)"}}>{(d.name||"D")[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:"0.875rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p>
                    <p style={{fontSize:"0.75rem",color:"var(--color-sage-500)"}}>{d.email} · {d.specialty||"No specialty"}</p>
                  </div>
                  <span className="badge badge-pending"><i className="fa-solid fa-clock"></i>Pending</span>
                </div>
              ))}
              {pending.length>3&&<p style={{fontSize:"0.8125rem",color:"#92400e",textAlign:"center",fontWeight:600}}>+{pending.length-3} more waiting</p>}
            </div>
          </div>
        )}

        {/* Recent users */}
        <div className="card" style={{marginBottom:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <h2 className="section-title" style={{margin:0}}>
              <i className="fa-solid fa-users" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
              Recent Registrations
            </h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u=>(
                  <tr key={u._id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                        <div className="avatar avatar-sm">{(u.name||"U")[0]}</div>
                        <div>
                          <p style={{fontWeight:600,fontSize:"0.875rem"}}>{u.name}</p>
                          <p style={{fontSize:"0.75rem",color:"var(--color-sage-500)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"160px"}}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role==="doctor"?"badge-blue":u.role==="admin"?"badge-purple":"badge-approved"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role==="doctor"
                        ? <span className={`badge ${u.isApproved?"badge-approved":"badge-pending"}`}>{u.isApproved?"Approved":"Pending"}</span>
                        : <span className="badge badge-approved">Active</span>}
                    </td>
                    <td style={{fontSize:"0.8125rem",color:"var(--color-sage-600)",whiteSpace:"nowrap"}}>
                      {new Date(u.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{background:"linear-gradient(135deg,var(--color-sage-50),var(--color-cream-100))",border:"1px solid var(--color-sage-200)"}}>
          <h2 className="section-title"><i className="fa-solid fa-bolt" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>Quick Actions</h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.75rem"}}>
            <Link to="/admin/doctors" className="btn-base btn-primary"><i className="fa-solid fa-user-doctor"></i>Manage Doctors</Link>
            {pending.length>0&&<Link to="/admin/doctors" className="btn-base btn-ghost"><i className="fa-solid fa-user-clock"></i>Approve Pending ({pending.length})</Link>}
          </div>
        </div>
      </div>
    </Layout>
  );
}