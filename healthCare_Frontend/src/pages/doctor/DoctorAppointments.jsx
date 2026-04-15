import { useEffect, useState } from "react";
import { getDoctorAppointments, approveAppointment, rejectAppointment } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const STATUS_BADGE = {Pending:"badge badge-pending",Approved:"badge badge-approved",Rejected:"badge badge-rejected"};
const STATUS_ICON  = {Pending:"fa-clock",Approved:"fa-circle-check",Rejected:"fa-circle-xmark"};

export default function DoctorAppointments() {
  const [appts, setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [acting, setActing] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(()=>{
    getDoctorAppointments().then(r=>setAppts(r.data)).finally(()=>setLoading(false));
  },[]);

  const handleApprove = async(id)=>{
    setActing(id);
    try{
      await approveAppointment(id);
      setAppts(prev=>prev.map(a=>a._id===id?{...a,status:"Approved"}:a));
      toast.success("Appointment approved! ✅");
    }catch(err){ toast.error(err.response?.data?.message||"Action failed"); }
    finally{ setActing(null); }
  };

  const handleReject = async(id)=>{
    setActing(id);
    try{
      await rejectAppointment(id);
      setAppts(prev=>prev.map(a=>a._id===id?{...a,status:"Rejected"}:a));
      toast.success("Appointment rejected.");
    }catch(err){ toast.error(err.response?.data?.message||"Action failed"); }
    finally{ setActing(null); }
  };

  const counts={All:appts.length,Pending:appts.filter(a=>a.status==="Pending").length,Approved:appts.filter(a=>a.status==="Approved").length,Rejected:appts.filter(a=>a.status==="Rejected").length};

  const filtered=appts
    .filter(a=>filter==="All"||a.status===filter)
    .filter(a=>!search||(a.patient?.name||"").toLowerCase().includes(search.toLowerCase()));

  if(loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title"><i className="fa-solid fa-calendar-check" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>Patient Appointments</h1>
        <p className="page-sub">Review and respond to appointment requests</p>

        {/* Filter + search */}
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.25rem"}}>
          <div className="filter-bar">
            {["All","Pending","Approved","Rejected"].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} className={`filter-btn ${filter===s?"active":""}`}>
                <i className={`fa-solid ${STATUS_ICON[s]||"fa-list"} text-xs`} style={{fontSize:"0.75rem"}}></i>{s}
                <span style={{fontSize:"0.7rem",padding:"0.1rem 0.375rem",borderRadius:"9999px",background:filter===s?"rgba(255,255,255,0.25)":"var(--color-cream-200)",color:filter===s?"#fff":"var(--color-charcoal-800)",fontWeight:700}}>
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
          <div className="search-wrap" style={{maxWidth:"320px"}}>
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input className="input" placeholder="Search patient name…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length===0 ? (
          <div className="card empty-state">
            <i className="fa-regular fa-calendar-xmark" style={{fontSize:"3rem",display:"block",marginBottom:"1rem"}}></i>
            <p style={{fontWeight:600,fontSize:"1rem"}}>No appointments found</p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:"0.875rem"}}>
            {filtered.map((a,i)=>(
              <div key={a._id} className="card appt-card" style={{animationDelay:`${i*45}ms`}}>
                <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                  {/* Patient info row */}
                  <div style={{display:"flex",alignItems:"flex-start",gap:"0.875rem",flexWrap:"wrap"}}>
                    <div className="avatar avatar-md">{(a.patient?.name||"P")[0].toUpperCase()}</div>
                    <div style={{flex:1,minWidth:"180px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.375rem"}}>
                        <p style={{fontWeight:700,fontSize:"1rem",color:"var(--color-charcoal-900)"}}>{a.patient?.name||"Patient"}</p>
                        <span className={STATUS_BADGE[a.status]}><i className={`fa-solid ${STATUS_ICON[a.status]}`}></i>{a.status}</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:"0.25rem"}}>
                        <p className="info-row">
                          <i className="fa-solid fa-envelope"></i>
                          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"240px"}}>{a.patient?.email}</span>
                        </p>
                        <p className="info-row">
                          <i className="fa-regular fa-calendar"></i>
                          {new Date(a.appointmentDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                          {" · "}
                          {new Date(a.appointmentDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                        </p>
                        {a.patient?.phone&&<p className="info-row"><i className="fa-solid fa-phone"></i>{a.patient.phone}</p>}
                        {a.patient?.bloodGroup&&<p className="info-row"><i className="fa-solid fa-droplet"></i>Blood: {a.patient.bloodGroup}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  {a.reason&&(
                    <div style={{padding:"0.625rem 0.875rem",background:"var(--color-cream-50)",borderRadius:"0.75rem",border:"1px solid var(--color-cream-200)"}}>
                      <p style={{fontSize:"0.75rem",fontWeight:700,color:"var(--color-sage-600)",marginBottom:"0.25rem"}}>
                        <i className="fa-solid fa-notes-medical" style={{marginRight:"0.375rem"}}></i>Reason
                      </p>
                      <p style={{fontSize:"0.875rem",color:"var(--color-charcoal-800)",fontStyle:"italic"}}>"{a.reason}"</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {a.status==="Pending"&&(
                    <div style={{display:"flex",gap:"0.625rem",flexWrap:"wrap"}}>
                      <button onClick={()=>handleApprove(a._id)} disabled={acting===a._id} className="btn-base btn-success btn-sm" style={{flex:1,minWidth:"120px"}}>
                        {acting===a._id?<i className="fa-solid fa-spinner animate-spin-slow"></i>:<i className="fa-solid fa-check"></i>}
                        Approve
                      </button>
                      <button onClick={()=>handleReject(a._id)} disabled={acting===a._id} className="btn-base btn-danger btn-sm" style={{flex:1,minWidth:"120px"}}>
                        {acting===a._id?<i className="fa-solid fa-spinner animate-spin-slow"></i>:<i className="fa-solid fa-xmark"></i>}
                        Reject
                      </button>
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