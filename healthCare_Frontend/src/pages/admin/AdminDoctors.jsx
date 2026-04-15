import { useEffect, useState } from "react";
import { getPendingDoctors, approveDoctor } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

export default function AdminDoctors() {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [approving, setApproving] = useState(null);
  const [search, setSearch]     = useState("");

  const fetch = async()=>{
    const { data } = await getPendingDoctors();
    setDoctors(data); setLoading(false);
  };
  useEffect(()=>{ fetch(); },[]);

  const handleApprove = async(id)=>{
    setApproving(id);
    try{
      await approveDoctor(id);
      toast.success("Doctor approved! They can now log in. ✅");
      setDoctors(prev=>prev.filter(d=>d._id!==id));
    }catch{ toast.error("Approval failed. Please try again."); }
    finally{ setApproving(null); }
  };

  const filtered = doctors.filter(d=>!search||(d.name||"").toLowerCase().includes(search.toLowerCase())||(d.specialty||"").toLowerCase().includes(search.toLowerCase()));

  if(loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title"><i className="fa-solid fa-user-doctor" style={{color:"var(--color-sage-500)",marginRight:"0.5rem"}}></i>Doctor Approvals</h1>
        <p className="page-sub">Review and approve doctor registration requests</p>

        {/* Summary cards */}
        <div className="grid-4" style={{marginBottom:"1.5rem"}}>
          <div className="stat-card" style={{animationDelay:"0ms"}}>
            <div className="stat-icon" style={{background:"#fffbeb",color:"#d97706",border:"1px solid #fcd34d"}}>
              <i className="fa-solid fa-user-clock"></i>
            </div>
            <div>
              <div className="stat-label">Pending Approval</div>
              <div className="stat-value">{doctors.length}</div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div style={{padding:"1rem",background:"#eff6ff",borderRadius:"1rem",border:"1px solid #bfdbfe",marginBottom:"1.25rem",display:"flex",alignItems:"flex-start",gap:"0.75rem"}}>
          <i className="fa-solid fa-circle-info" style={{color:"#2563eb",marginTop:"0.1rem",flexShrink:0}}></i>
          <p style={{fontSize:"0.875rem",color:"#1d4ed8",lineHeight:1.5}}>
            Doctors cannot log in until approved. Review their specialty, experience, and fee carefully before approving.
          </p>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{maxWidth:"320px",marginBottom:"1.25rem"}}>
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input className="input" placeholder="Search by name or specialty…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {filtered.length===0 ? (
          <div className="card empty-state" style={{padding:"4rem 1rem"}}>
            <i className="fa-solid fa-circle-check" style={{fontSize:"3.5rem",display:"block",marginBottom:"1rem",color:"var(--color-sage-400)"}}></i>
            <p style={{fontFamily:"var(--font-display)",fontSize:"1.25rem",fontWeight:600,color:"var(--color-charcoal-900)",marginBottom:"0.5rem"}}>
              {search?"No matching doctors":"All caught up!"}
            </p>
            <p style={{fontSize:"0.875rem"}}>
              {search?"Try a different search term":"No doctors are waiting for approval."}
            </p>
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map((d,i)=>(
              <div key={d._id} className="card card-hover animate-fade-up" style={{animationDelay:`${i*60}ms`}}>
                {/* Header */}
                <div style={{display:"flex",alignItems:"flex-start",gap:"0.875rem",marginBottom:"1rem"}}>
                  <div className="avatar avatar-lg">{(d.name||"D")[0].toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:700,fontSize:"1rem",color:"var(--color-charcoal-900)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p>
                    <p style={{fontSize:"0.8125rem",color:"var(--color-sage-600)",marginTop:"0.125rem"}}>{d.specialty||"No specialty listed"}</p>
                    <span className="badge badge-pending" style={{marginTop:"0.375rem"}}>
                      <i className="fa-solid fa-clock"></i>Pending
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{display:"flex",flexDirection:"column",gap:"0.375rem",marginBottom:"1rem",padding:"0.75rem",background:"var(--color-cream-50)",borderRadius:"0.75rem",border:"1px solid var(--color-cream-200)"}}>
                  <p className="info-row"><i className="fa-solid fa-envelope"></i><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.email}</span></p>
                  {d.phone&&<p className="info-row"><i className="fa-solid fa-phone"></i>{d.phone}</p>}
                  {d.experience!=null&&<p className="info-row"><i className="fa-solid fa-briefcase-medical"></i>{d.experience} years experience</p>}
                  {d.price!=null&&<p className="info-row"><i className="fa-solid fa-dollar-sign"></i>${d.price} per appointment</p>}
                  {d.address&&<p className="info-row"><i className="fa-solid fa-location-dot"></i>{d.address}</p>}
                  {d.gender&&<p className="info-row"><i className="fa-solid fa-venus-mars"></i>{d.gender}</p>}
                </div>

                {/* Bio */}
                {d.bio&&(
                  <div style={{padding:"0.625rem",background:"#f0f9ff",borderRadius:"0.75rem",border:"1px solid #bae6fd",marginBottom:"0.875rem"}}>
                    <p style={{fontSize:"0.8125rem",color:"#0c4a6e",lineHeight:1.5,fontStyle:"italic"}}>"{d.bio}"</p>
                  </div>
                )}

                {/* Availability */}
                {d.availability?.length>0&&(
                  <div style={{marginBottom:"0.875rem"}}>
                    <p style={{fontSize:"0.75rem",fontWeight:700,color:"var(--color-sage-700)",marginBottom:"0.375rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>
                      <i className="fa-solid fa-clock" style={{marginRight:"0.375rem"}}></i>Schedule
                    </p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"0.375rem"}}>
                      {d.availability.map((sl,i)=>(
                        <span key={i} style={{fontSize:"0.7rem",background:"var(--color-sage-50)",color:"var(--color-sage-700)",border:"1px solid var(--color-sage-200)",padding:"0.2rem 0.5rem",borderRadius:"0.5rem",fontWeight:600}}>
                          {sl.day.slice(0,3)} {sl.start}–{sl.end}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={()=>handleApprove(d._id)} disabled={approving===d._id} className="btn-base btn-primary btn-full">
                  {approving===d._id
                    ?<><i className="fa-solid fa-spinner animate-spin-slow"></i>Approving…</>
                    :<><i className="fa-solid fa-check"></i>Approve Doctor</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}