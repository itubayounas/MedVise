import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPatientAppointments, getJournals } from "../../api";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const MOOD_EMOJI  = {Happy:"😊",Sad:"😔",Stressed:"😤",Anxious:"😰",Calm:"😌",Angry:"😠",Unwell:"🤒"};
const MOOD_COLOR  = {Happy:"#fef08a",Sad:"#bfdbfe",Stressed:"#fecaca",Anxious:"#fed7aa",Calm:"#bbf7d0",Angry:"#fca5a5",Unwell:"#e9d5ff"};
const STATUS_COLOR = {Pending:"#f59e0b",Approved:"var(--color-sage-500)",Rejected:"#ef4444"};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appts, setAppts]     = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatientAppointments(), getJournals()])
      .then(([a,j]) => { setAppts(a.data); setJournals(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  const pending  = appts.filter(a=>a.status==="Pending").length;
  const approved = appts.filter(a=>a.status==="Approved").length;
  const rejected = appts.filter(a=>a.status==="Rejected").length;
  const upcoming = appts
    .filter(a=>a.status==="Approved" && new Date(a.appointmentDate)>new Date())
    .sort((a,b)=>new Date(a.appointmentDate)-new Date(b.appointmentDate));

  const moodCounts = {};
  journals.forEach(j=>{ if(j.mood) moodCounts[j.mood]=(moodCounts[j.mood]||0)+1; });
  const moodKeys = Object.keys(moodCounts);
  const topMood  = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0];

  const doughnutData = {
    labels: moodKeys.map(m=>`${MOOD_EMOJI[m]} ${m}`),
    datasets:[{
      data: moodKeys.map(m=>moodCounts[m]),
      backgroundColor: moodKeys.map(m=>MOOD_COLOR[m]||"#e5e7eb"),
      borderWidth:2, borderColor:"#fff",
    }],
  };

  return (
    <Layout>
      <div className="animate-fade-up">
        {/* Header */}
        <div style={{marginBottom:"1.5rem"}}>
          <h1 className="page-title">
            <i className="fa-solid fa-hand-wave" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>
            Hello{user?.name?`, ${user.name}`:""}!
          </h1>
          <p className="page-sub">Here's your health overview for today — {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{marginBottom:"1.5rem"}}>
          <StatCard label="Total Appointments" value={appts.length}    icon="fa-calendar-days"  colorClass="sage"   delay={0}   />
          <StatCard label="Pending"             value={pending}         icon="fa-clock"           colorClass="amber"  delay={80}  />
          <StatCard label="Confirmed"           value={approved}        icon="fa-circle-check"    colorClass="blue"   delay={160} />
          <StatCard label="Journal Entries"     value={journals.length} icon="fa-book-open"       colorClass="purple" delay={240} />
        </div>

        <div className="grid-2" style={{marginBottom:"1.5rem"}}>
          {/* Upcoming appointments */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
              <h2 className="section-title" style={{margin:0}}>
                <i className="fa-solid fa-calendar-check" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
                Upcoming Appointments
              </h2>
              <Link to="/patient/appointments" style={{fontSize:"0.8125rem",color:"var(--color-sage-600)",fontWeight:600,textDecoration:"none"}}>View all</Link>
            </div>

            {upcoming.length===0 ? (
              <div className="empty-state" style={{padding:"2rem 0.5rem"}}>
                <i className="fa-regular fa-calendar-xmark" style={{fontSize:"2.5rem",display:"block",marginBottom:"0.75rem"}}></i>
                <p style={{fontSize:"0.875rem",fontWeight:500}}>No upcoming appointments</p>
                <Link to="/patient/appointments" className="btn-base btn-primary btn-sm" style={{marginTop:"1rem",display:"inline-flex"}}>
                  <i className="fa-solid fa-plus"></i>Book Now
                </Link>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
                {upcoming.slice(0,4).map(a=>(
                  <div key={a._id} 
                    onMouseEnter={(e) => { e.currentTarget.style.background="var(--color-cream-100)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background="var(--color-cream-50)"; e.currentTarget.style.boxShadow="none"; }}
                    style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem",background:"var(--color-cream-50)",borderRadius:"0.875rem",border:"1px solid var(--color-cream-200)",transition:"all .15s ease",cursor:"pointer"}}>
                    <div className="avatar avatar-sm">{(a.doctor?.name||"D")[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:600,fontSize:"0.875rem",color:"var(--color-charcoal-900)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        Dr. {a.doctor?.name||"Unknown"}
                      </p>
                      <p style={{fontSize:"0.75rem",color:"var(--color-sage-600)",marginTop:"0.125rem"}}>
                        <i className="fa-regular fa-clock" style={{marginRight:"0.375rem"}}></i>
                        {new Date(a.appointmentDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                        {" · "}
                        {new Date(a.appointmentDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                      </p>
                    </div>
                    <span className="badge badge-approved"><i className="fa-solid fa-check"></i>Confirmed</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mood chart */}
          <div className="card">
            <h2 className="section-title">
              <i className="fa-solid fa-face-smile" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>
              Mood Overview
            </h2>
            {moodKeys.length===0 ? (
              <div className="empty-state" style={{padding:"2rem 0.5rem"}}>
                <i className="fa-solid fa-face-meh" style={{fontSize:"2.5rem",display:"block",marginBottom:"0.75rem"}}></i>
                <p style={{fontSize:"0.875rem"}}>Write journals to see your mood trends</p>
                <Link to="/patient/journals" className="btn-base btn-primary btn-sm" style={{marginTop:"1rem",display:"inline-flex"}}>
                  <i className="fa-solid fa-pen"></i>Write Entry
                </Link>
              </div>
            ) : (
              <div>
                <div className="chart-container chart-md" style={{marginBottom:"0.75rem"}}>
                  <Doughnut data={doughnutData} options={{plugins:{legend:{position:"right",labels:{font:{family:"DM Sans",size:11},boxWidth:10,padding:8}}},maintainAspectRatio:false}} />
                </div>
                {topMood && (
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.625rem",background:"var(--color-cream-50)",borderRadius:"0.75rem",border:"1px solid var(--color-cream-200)"}}>
                    <span style={{fontSize:"1.25rem"}}>{MOOD_EMOJI[topMood[0]]}</span>
                    <div>
                      <p style={{fontSize:"0.75rem",color:"var(--color-sage-600)",fontWeight:600}}>Most frequent</p>
                      <p style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-charcoal-900)"}}>{topMood[0]} <span style={{fontWeight:400,color:"var(--color-sage-500)"}}>({topMood[1]}×)</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent journals */}
        <div className="card" style={{marginBottom:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <h2 className="section-title" style={{margin:0}}>
              <i className="fa-solid fa-book-open" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>
              Recent Journal Entries
            </h2>
            <Link to="/patient/journals" style={{fontSize:"0.8125rem",color:"var(--color-sage-600)",fontWeight:600,textDecoration:"none"}}>View all</Link>
          </div>

          {journals.length===0 ? (
            <div className="empty-state" style={{padding:"1.5rem 0.5rem"}}>
              <p style={{fontSize:"0.875rem"}}>No entries yet. Start your wellness journal today.</p>
            </div>
          ) : (
            <div className="grid-3">
              {journals.slice(0,3).map(j=>(
                <div key={j._id} 
                  onMouseEnter={(e) => { e.currentTarget.style.background="var(--color-cream-100)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.08)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background="var(--color-cream-50)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}
                  style={{padding:"0.875rem",background:"var(--color-cream-50)",borderRadius:"0.875rem",border:"1px solid var(--color-cream-200)",transition:"all .15s ease",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.5rem",marginBottom:"0.375rem"}}>
                    <p style={{fontWeight:600,fontSize:"0.875rem",color:"var(--color-charcoal-900)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.title}</p>
                    {j.mood&&<span style={{fontSize:"1.125rem",flexShrink:0}}>{MOOD_EMOJI[j.mood]}</span>}
                  </div>
                  <p className="truncate-2" style={{fontSize:"0.8125rem",color:"#6b7280",lineHeight:1.5}}>{j.content}</p>
                  <p style={{fontSize:"0.7rem",color:"var(--color-sage-400)",marginTop:"0.5rem"}}>
                    <i className="fa-regular fa-clock" style={{marginRight:"0.25rem"}}></i>
                    {new Date(j.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health tips */}
        <div className="card" style={{background:"linear-gradient(135deg,var(--color-sage-50),var(--color-cream-100))",border:"1px solid var(--color-sage-200)"}}>
          <h2 className="section-title">
            <i className="fa-solid fa-lightbulb" style={{color:"#f59e0b",marginRight:"0.5rem"}}></i>
            Daily Health Tips
          </h2>
          <div className="grid-3">
            {[
              {icon:"fa-glass-water",    color:"#2563eb",tip:"Drink 8 glasses of water daily to stay hydrated"},
              {icon:"fa-person-walking", color:"var(--color-sage-500)",tip:"30 minutes of walking boosts mood and energy"},
              {icon:"fa-moon",           color:"#7c3aed",tip:"7–9 hours of sleep is essential for recovery"},
            ].map((t,i)=>(
              <div key={i} 
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.08)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}
                style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",padding:"0.75rem",background:"rgba(255,255,255,0.6)",borderRadius:"0.875rem",border:"1px solid var(--color-cream-200)",transition:"all .15s ease",cursor:"pointer"}}>
                <div style={{width:"2.25rem",height:"2.25rem",borderRadius:"0.625rem",background:`${t.color}15`,display:"flex",alignItems:"center",justifyContent:"center",color:t.color,flexShrink:0}}>
                  <i className={`fa-solid ${t.icon}`}></i>
                </div>
                <p style={{fontSize:"0.8125rem",color:"var(--color-charcoal-800)",lineHeight:1.5}}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}