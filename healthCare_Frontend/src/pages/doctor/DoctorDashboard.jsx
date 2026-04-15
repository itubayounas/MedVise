import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDoctorAppointments } from "../../api";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appts, setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getDoctorAppointments().then(r=>setAppts(r.data)).finally(()=>setLoading(false));
  },[]);

  if (loading) return <Layout><Spinner /></Layout>;

  const pending  = appts.filter(a=>a.status==="Pending").length;
  const approved = appts.filter(a=>a.status==="Approved").length;
  const rejected = appts.filter(a=>a.status==="Rejected").length;

  const today = new Date();
  const todayAppts = appts.filter(a=>{
    const d=new Date(a.appointmentDate);
    return d.toDateString()===today.toDateString()&&a.status==="Approved";
  });
  const thisWeek = appts.filter(a=>{
    const d=new Date(a.appointmentDate);
    const diff=(d-today)/(1000*60*60*24);
    return diff>=-0 && diff<=7 && a.status==="Approved";
  });

  const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dayCounts=Array(7).fill(0);
  appts.forEach(a=>dayCounts[new Date(a.appointmentDate).getDay()]++);

  const barData={
    labels:DAYS,
    datasets:[{label:"Appointments",data:dayCounts,backgroundColor:"rgba(85,128,85,0.75)",borderRadius:6,borderSkipped:false}],
  };
  const doughnutData={
    labels:["Pending","Approved","Rejected"],
    datasets:[{data:[pending,approved,rejected],backgroundColor:["#fbbf24","#558055","#ef4444"],borderWidth:2,borderColor:"#fff"}],
  };

  const pendingList = appts.filter(a=>a.status==="Pending").slice(0,5);

  return (
    <Layout>
      <div className="animate-fade-up">
        <div style={{marginBottom:"1.5rem"}}>
          <h1 className="page-title">
            <i className="fa-solid fa-stethoscope" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
            Doctor Dashboard
          </h1>
          <p className="page-sub">Good {new Date().getHours()<12?"morning":"afternoon"}, {user?.name?`Dr. ${user.name}`:"Doctor"} 🩺 — {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
        </div>

        <div className="grid-4" style={{marginBottom:"1.5rem"}}>
          <StatCard label="Total Patients"    value={appts.length}    icon="fa-clipboard-list" colorClass="sage"   delay={0}   />
          <StatCard label="Pending Review"    value={pending}         icon="fa-clock"           colorClass="amber"  delay={80}  />
          <StatCard label="Approved"          value={approved}        icon="fa-circle-check"    colorClass="blue"   delay={160} />
          <StatCard label="Today's Patients"  value={todayAppts.length} icon="fa-user-group"   colorClass="purple" delay={240} />
        </div>

        <div className="grid-2" style={{marginBottom:"1.5rem"}}>
          {/* Pending appointments */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
              <h2 className="section-title" style={{margin:0}}>
                <i className="fa-solid fa-bell" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>
                Needs Attention
                {pending>0&&<span style={{marginLeft:"0.5rem",background:"#ef4444",color:"#fff",borderRadius:"9999px",fontSize:"0.7rem",padding:"0.1rem 0.5rem",fontFamily:"var(--font-body)"}}>{pending}</span>}
              </h2>
              <Link to="/doctor/appointments" style={{fontSize:"0.8125rem",color:"var(--color-sage-600)",fontWeight:600,textDecoration:"none"}}>Manage all</Link>
            </div>
            {pendingList.length===0 ? (
              <div className="empty-state" style={{padding:"2rem 0.5rem"}}>
                <i className="fa-solid fa-circle-check" style={{fontSize:"2.5rem",display:"block",marginBottom:"0.75rem",color:"var(--color-sage-400)"}}></i>
                <p style={{fontSize:"0.875rem",fontWeight:500}}>All caught up! No pending requests.</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
                {pendingList.map(a=>(
                  <div key={a._id} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem",background:"#fffbeb",borderRadius:"0.875rem",border:"1px solid #fcd34d"}}>
                    <div className="avatar avatar-sm" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)"}}>{(a.patient?.name||"P")[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:600,fontSize:"0.875rem",color:"var(--color-charcoal-900)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patient?.name||"Patient"}</p>
                      <p style={{fontSize:"0.75rem",color:"var(--color-sage-600)",marginTop:"0.125rem"}}>
                        <i className="fa-regular fa-calendar" style={{marginRight:"0.375rem"}}></i>
                        {new Date(a.appointmentDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                        {a.reason&&` · ${a.reason.slice(0,28)}…`}
                      </p>
                    </div>
                    <Link to="/doctor/appointments" className="btn-base btn-primary btn-xs">Review</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doughnut chart */}
          <div className="card">
            <h2 className="section-title">
              <i className="fa-solid fa-chart-pie" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
              Status Breakdown
            </h2>
            {appts.length===0 ? (
              <div className="empty-state" style={{padding:"2rem 0.5rem"}}>No appointment data yet</div>
            ) : (
              <div className="chart-container chart-md">
                <Doughnut data={doughnutData} options={{plugins:{legend:{position:"right",labels:{font:{family:"DM Sans",size:11},boxWidth:10,padding:8}}},maintainAspectRatio:false}} />
              </div>
            )}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card" style={{marginBottom:"1.5rem"}}>
          <h2 className="section-title">
            <i className="fa-solid fa-chart-bar" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
            Appointments by Day of Week
          </h2>
          <div className="chart-container chart-sm">
            <Bar data={barData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}} />
          </div>
        </div>

        {/* This week preview */}
        <div className="card" style={{marginBottom:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <h2 className="section-title" style={{margin:0}}>
              <i className="fa-solid fa-calendar-week" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
              This Week ({thisWeek.length} patients)
            </h2>
          </div>
          {thisWeek.length===0 ? (
            <p style={{fontSize:"0.875rem",color:"var(--color-sage-500)",textAlign:"center",padding:"1rem"}}>No appointments scheduled this week</p>
          ) : (
            <div className="grid-2">
              {thisWeek.slice(0,4).map(a=>(
                <div key={a._id} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem",background:"var(--color-sage-50)",borderRadius:"0.875rem",border:"1px solid var(--color-sage-200)"}}>
                  <div className="avatar avatar-sm">{(a.patient?.name||"P")[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:"0.875rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patient?.name}</p>
                    <p style={{fontSize:"0.75rem",color:"var(--color-sage-600)"}}>
                      {new Date(a.appointmentDate).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{background:"linear-gradient(135deg,var(--color-sage-50),var(--color-cream-100))",border:"1px solid var(--color-sage-200)"}}>
          <h2 className="section-title"><i className="fa-solid fa-bolt" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>Quick Actions</h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.75rem"}}>
            <Link to="/doctor/appointments" className="btn-base btn-primary">
              <i className="fa-solid fa-calendar-check"></i>Manage Appointments
            </Link>
            {pending>0&&(
              <Link to="/doctor/appointments" className="btn-base btn-ghost">
                <i className="fa-solid fa-clock"></i>Review Pending ({pending})
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}