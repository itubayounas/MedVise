import { useEffect, useState } from "react";
import { getJournals, createJournal, updateJournal, deleteJournal } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const MOODS = ["Happy","Sad","Stressed","Anxious","Calm","Angry","Unwell"];

const MOOD_EMOJI = {
  Happy:"😊", Sad:"😔", Stressed:"😤",
  Anxious:"😰", Calm:"😌", Angry:"😠", Unwell:"🤒",
};

const MOOD_STYLE = {
  Happy:   { background:"#fef9c3", color:"#854d0e", border:"#fde047" },
  Sad:     { background:"#dbeafe", color:"#1e40af", border:"#93c5fd" },
  Stressed:{ background:"#fee2e2", color:"#991b1b", border:"#fca5a5" },
  Anxious: { background:"#ffedd5", color:"#9a3412", border:"#fdba74" },
  Calm:    { background:"#dcfce7", color:"#166534", border:"#86efac" },
  Angry:   { background:"#fecaca", color:"#7f1d1d", border:"#f87171" },
  Unwell:  { background:"#f3e8ff", color:"#6b21a8", border:"#d8b4fe" },
};

const EMPTY = { title:"", content:"", mood:"" };

export default function PatientJournals() {
  const [journals, setJournals]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState("list");
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await getJournals();
      setJournals(data);
    } catch { toast.error("Failed to load journals"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openNew    = () => { setForm(EMPTY); setSelected(null); setView("form"); };
  const openEdit   = (j) => { setForm({ title:j.title, content:j.content, mood:j.mood||"" }); setSelected(j); setView("form"); };
  const openDetail = (j) => { setSelected(j); setView("detail"); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selected) {
        await updateJournal(selected._id, form);
        toast.success("Journal updated!");
      } else {
        await createJournal(form);
        toast.success("Journal entry saved!");
      }
      await fetchData();
      setView("list");
    } catch { toast.error("Failed to save. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJournal(id);
      toast.success("Entry deleted.");
      setDeleteId(null);
      if (view === "detail") setView("list");
      fetchData();
    } catch { toast.error("Failed to delete."); }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  // ── DETAIL VIEW ────────────────────────────────────
  if (view === "detail" && selected) {
    const j = journals.find(x => x._id === selected._id) || selected;
    const ms = j.mood ? MOOD_STYLE[j.mood] : null;

    return (
      <Layout>
        <div style={{ maxWidth:"720px", margin:"0 auto", padding:"0 16px" }}>
          {/* Back */}
          <button onClick={() => setView("list")} style={{
            display:"flex", alignItems:"center", gap:"8px",
            background:"none", border:"none", cursor:"pointer",
            color:"#558055", fontSize:"14px", fontWeight:500,
            marginBottom:"24px", padding:"4px 0",
          }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize:"12px" }}></i>
            Back to journals
          </button>

          {/* Card */}
          <div style={{
            background:"#fff", borderRadius:"16px",
            border:"0.5px solid #e8dbc0",
            boxShadow:"0 4px 24px rgba(0,0,0,0.07)",
            overflow:"hidden",
          }}>
            {/* Card header */}
            <div style={{
              background:"linear-gradient(135deg, #f4f7f4, #f9f6ed)",
              padding:"28px 28px 24px",
              borderBottom:"0.5px solid #e8dbc0",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <h1 style={{
                    fontFamily:"var(--font-display)",
                    fontSize:"clamp(1.25rem,3vw,1.75rem)",
                    fontWeight:700, color:"#141814",
                    marginBottom:"10px", lineHeight:1.25,
                    wordBreak:"break-word",
                  }}>{j.title}</h1>
                  <p style={{ fontSize:"13px", color:"#558055", display:"flex", alignItems:"center", gap:"6px" }}>
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(j.createdAt).toLocaleDateString("en-US",{
                      weekday:"long", year:"numeric", month:"long", day:"numeric",
                    })}
                  </p>
                </div>
                {j.mood && ms && (
                  <span style={{
                    display:"inline-flex", alignItems:"center", gap:"6px",
                    padding:"6px 14px", borderRadius:"20px",
                    fontSize:"13px", fontWeight:600, flexShrink:0,
                    background:ms.background, color:ms.color,
                    border:`1.5px solid ${ms.border}`,
                  }}>
                    <span style={{ fontSize:"16px" }}>{MOOD_EMOJI[j.mood]}</span>
                    {j.mood}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding:"28px" }}>
              <div style={{
                background:"#fdfcf8", borderRadius:"12px",
                padding:"20px 24px", border:"0.5px solid #f2ebda",
                minHeight:"140px",
              }}>
                <p style={{
                  fontSize:"15px", color:"#1e2420",
                  lineHeight:1.75, whiteSpace:"pre-wrap",
                }}>
                  {j.content}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:"12px", marginTop:"24px", paddingTop:"20px", borderTop:"0.5px solid #f2ebda" }}>
                <button onClick={() => openEdit(j)} style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                  gap:"8px", padding:"11px 20px", borderRadius:"10px",
                  border:"1.5px solid #ccdccc", background:"#f4f7f4",
                  color:"#426542", fontSize:"14px", fontWeight:600, cursor:"pointer",
                  transition:"all .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background="#e6ede6"}
                  onMouseLeave={e => e.currentTarget.style.background="#f4f7f4"}>
                  <i className="fa-solid fa-pen" style={{ fontSize:"12px" }}></i>
                  Edit Entry
                </button>
                <button onClick={() => setDeleteId(j._id)} style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                  gap:"8px", padding:"11px 20px", borderRadius:"10px",
                  border:"1.5px solid #fca5a5", background:"#fff1f2",
                  color:"#dc2626", fontSize:"14px", fontWeight:600, cursor:"pointer",
                  transition:"all .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
                  onMouseLeave={e => e.currentTarget.style.background="#fff1f2"}>
                  <i className="fa-solid fa-trash" style={{ fontSize:"12px" }}></i>
                  Delete Entry
                </button>
              </div>
            </div>
          </div>
        </div>

        {deleteId && (
          <DeleteModal
            onConfirm={() => handleDelete(deleteId)}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </Layout>
    );
  }

  // ── FORM VIEW ──────────────────────────────────────
  if (view === "form") {
    return (
      <Layout>
        <div style={{ maxWidth:"680px", margin:"0 auto", padding:"0 16px" }}>
          {/* Back */}
          <button onClick={() => setView("list")} style={{
            display:"flex", alignItems:"center", gap:"8px",
            background:"none", border:"none", cursor:"pointer",
            color:"#558055", fontSize:"14px", fontWeight:500,
            marginBottom:"24px", padding:"4px 0",
          }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize:"12px" }}></i>
            Back to journals
          </button>

          <div style={{
            background:"#fff", borderRadius:"16px",
            border:"0.5px solid #e8dbc0",
            boxShadow:"0 4px 24px rgba(0,0,0,0.07)",
            overflow:"hidden",
          }}>
            {/* Form header */}
            <div style={{
              background:"linear-gradient(135deg, #f4f7f4, #f9f6ed)",
              padding:"22px 28px",
              borderBottom:"0.5px solid #e8dbc0",
              display:"flex", alignItems:"center", gap:"14px",
            }}>
              <div style={{
                width:"40px", height:"40px", borderRadius:"50%", flexShrink:0,
                background: selected ? "#fef3c7" : "#e6ede6",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <i className={`fa-solid ${selected ? "fa-pen" : "fa-plus"}`}
                  style={{ color: selected ? "#d97706" : "#426542", fontSize:"15px" }}></i>
              </div>
              <h2 style={{
                fontFamily:"var(--font-display)",
                fontSize:"1.4rem", fontWeight:700, color:"#141814",
              }}>
                {selected ? "Edit Journal Entry" : "New Journal Entry"}
              </h2>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} style={{ padding:"28px", display:"flex", flexDirection:"column", gap:"20px" }}>

              {/* Title */}
              <div>
                <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:600, color:"#1e2420", marginBottom:"8px" }}>
                  <i className="fa-solid fa-heading" style={{ color:"#779f77", fontSize:"11px" }}></i>
                  Entry Title
                </label>
                <input
                  style={{
                    width:"100%", padding:"11px 14px", borderRadius:"10px",
                    border:"1.5px solid #e8dbc0", outline:"none",
                    fontSize:"14px", color:"#141814", background:"#fdfcf8",
                    transition:"border-color .15s",
                  }}
                  placeholder="What's on your mind today?"
                  value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})}
                  onFocus={e => e.target.style.borderColor="#779f77"}
                  onBlur={e => e.target.style.borderColor="#e8dbc0"}
                  required
                />
              </div>

              {/* Mood picker */}
              <div>
                <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:600, color:"#1e2420", marginBottom:"10px" }}>
                  <i className="fa-solid fa-face-smile" style={{ color:"#f59e0b", fontSize:"12px" }}></i>
                  How are you feeling?
                </label>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",
                  gap:"8px",
                }}>
                  {MOODS.map(m => {
                    const ms = MOOD_STYLE[m];
                    const isSelected = form.mood === m;
                    return (
                      <button type="button" key={m}
                        onClick={() => setForm({...form, mood: form.mood === m ? "" : m})}
                        style={{
                          display:"flex", alignItems:"center", gap:"7px",
                          padding:"9px 12px", borderRadius:"10px",
                          fontSize:"13px", fontWeight:600, cursor:"pointer",
                          transition:"all .15s",
                          background: isSelected ? ms.background : "#fff",
                          color:       isSelected ? ms.color    : "#6b7280",
                          border:      isSelected ? `1.5px solid ${ms.border}` : "1.5px solid #e8dbc0",
                          transform:   isSelected ? "scale(1.03)" : "scale(1)",
                        }}>
                        <span style={{ fontSize:"16px" }}>{MOOD_EMOJI[m]}</span>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:600, color:"#1e2420", marginBottom:"8px" }}>
                  <i className="fa-solid fa-pen-fancy" style={{ color:"#779f77", fontSize:"11px" }}></i>
                  Your Thoughts
                </label>
                <textarea
                  rows={9}
                  style={{
                    width:"100%", padding:"11px 14px", borderRadius:"10px",
                    border:"1.5px solid #e8dbc0", outline:"none",
                    fontSize:"14px", color:"#141814", background:"#fdfcf8",
                    resize:"vertical", lineHeight:1.7, fontFamily:"inherit",
                    transition:"border-color .15s",
                  }}
                  placeholder="Write freely — this is your private space..."
                  value={form.content}
                  onChange={e => setForm({...form, content:e.target.value})}
                  onFocus={e => e.target.style.borderColor="#779f77"}
                  onBlur={e => e.target.style.borderColor="#e8dbc0"}
                  required
                />
              </div>

              {/* Buttons */}
              <div style={{ display:"flex", gap:"12px", paddingTop:"8px", borderTop:"0.5px solid #f2ebda" }}>
                <button type="submit" disabled={submitting} style={{
                  flex:2, display:"flex", alignItems:"center", justifyContent:"center",
                  gap:"8px", padding:"12px 20px", borderRadius:"10px",
                  border:"none", background: submitting ? "#9ca3af" : "#426542",
                  color:"#fff", fontSize:"14px", fontWeight:600,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}>
                  {submitting
                    ? <><i className="fa-solid fa-spinner fa-spin"></i>Saving…</>
                    : <><i className="fa-solid fa-floppy-disk"></i>{selected ? "Update Entry" : "Save Entry"}</>
                  }
                </button>
                <button type="button" onClick={() => setView("list")} style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                  padding:"12px 20px", borderRadius:"10px",
                  border:"1.5px solid #e8dbc0", background:"#fff",
                  color:"#374151", fontSize:"14px", fontWeight:600, cursor:"pointer",
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────
  const moodCounts = {};
  journals.forEach(j => { if (j.mood) moodCounts[j.mood] = (moodCounts[j.mood]||0)+1; });
  const topMood = Object.entries(moodCounts).sort((a,b) => b[1]-a[1])[0];

  return (
    <Layout>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 16px" }}>

        {/* Page header */}
        <div style={{
          display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:"16px",
          marginBottom:"28px", flexWrap:"wrap",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <div style={{
              width:"46px", height:"46px", borderRadius:"12px", flexShrink:0,
              background:"linear-gradient(135deg,#e6ede6,#ccdccc)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <i className="fa-solid fa-book-open" style={{ color:"#426542", fontSize:"18px" }}></i>
            </div>
            <div>
              <h1 style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(1.4rem,3vw,2rem)",
                fontWeight:700, color:"#141814", lineHeight:1.2,
              }}>My Journal</h1>
              <p style={{ fontSize:"13px", color:"#6b8f6b", marginTop:"2px" }}>
                Your private mental wellness diary
              </p>
            </div>
          </div>

          <button onClick={openNew} style={{
            display:"flex", alignItems:"center", gap:"8px",
            padding:"10px 20px", borderRadius:"10px",
            border:"none", background:"#426542", color:"#fff",
            fontSize:"14px", fontWeight:600, cursor:"pointer",
            boxShadow:"0 2px 8px rgba(66,101,66,.3)",
            flexShrink:0,
          }}
            onMouseEnter={e => e.currentTarget.style.background="#364f36"}
            onMouseLeave={e => e.currentTarget.style.background="#426542"}>
            <i className="fa-solid fa-plus" style={{ fontSize:"12px" }}></i>
            New Entry
          </button>
        </div>

        {/* Summary banner */}
        {journals.length > 0 && (
          <div style={{
            background:"linear-gradient(135deg, #f4f7f4, #f9f6ed)",
            borderRadius:"14px", padding:"20px 24px",
            border:"0.5px solid #ccdccc",
            marginBottom:"24px",
            display:"flex", flexWrap:"wrap", gap:"32px", alignItems:"center",
          }}>
            <div>
              <p style={{ fontSize:"11px", fontWeight:700, color:"#779f77", textTransform:"uppercase", letterSpacing:".05em", marginBottom:"4px" }}>
                Total entries
              </p>
              <p style={{ fontFamily:"var(--font-display)", fontSize:"2.25rem", fontWeight:700, color:"#141814", lineHeight:1 }}>
                {journals.length}
              </p>
            </div>
            {topMood && (
              <div>
                <p style={{ fontSize:"11px", fontWeight:700, color:"#779f77", textTransform:"uppercase", letterSpacing:".05em", marginBottom:"4px" }}>
                  Most frequent mood
                </p>
                <p style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem", fontWeight:700, color:"#141814", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"1.75rem" }}>{MOOD_EMOJI[topMood[0]]}</span>
                  {topMood[0]}
                  <span style={{ fontSize:"14px", fontWeight:400, color:"#779f77" }}>
                    ({topMood[1]}×)
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {journals.length === 0 ? (
          <div style={{
            background:"#fff", borderRadius:"16px",
            border:"0.5px solid #e8dbc0",
            padding:"64px 24px",
            display:"flex", flexDirection:"column",
            alignItems:"center", textAlign:"center", gap:"16px",
          }}>
            <div style={{
              width:"72px", height:"72px", borderRadius:"50%",
              background:"linear-gradient(135deg,#e6ede6,#ccdccc)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <i className="fa-solid fa-book-medical" style={{ color:"#426542", fontSize:"28px" }}></i>
            </div>
            <div>
              <h2 style={{
                fontFamily:"var(--font-display)",
                fontSize:"1.4rem", fontWeight:700, color:"#141814", marginBottom:"8px",
              }}>
                Start your wellness journey
              </h2>
              <p style={{ fontSize:"14px", color:"#6b7280", lineHeight:1.6, maxWidth:"340px" }}>
                Regular journaling helps you understand your emotional patterns and track your mental wellness over time.
              </p>
            </div>
            <button onClick={openNew} style={{
              marginTop:"8px", display:"flex", alignItems:"center", gap:"8px",
              padding:"12px 28px", borderRadius:"10px",
              border:"none", background:"#426542", color:"#fff",
              fontSize:"14px", fontWeight:600, cursor:"pointer",
            }}>
              <i className="fa-solid fa-pen" style={{ fontSize:"12px" }}></i>
              Write your first entry
            </button>
          </div>

        ) : (
          /* Journal card grid */
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            gap:"16px",
          }}>
            {journals.map((j, i) => {
              const ms = j.mood ? MOOD_STYLE[j.mood] : null;
              return (
                <div key={j._id}
                  onClick={() => openDetail(j)}
                  style={{
                    background:"#fff", borderRadius:"14px",
                    border:"0.5px solid #e8dbc0",
                    padding:"20px",
                    cursor:"pointer",
                    transition:"all .2s",
                    animation:`fadeUp .4s ease ${i*50}ms forwards`,
                    opacity:0,
                    display:"flex", flexDirection:"column", gap:"10px",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.1)";
                    e.currentTarget.style.transform="translateY(-2px)";
                    e.currentTarget.style.borderColor="#ccdccc";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow="none";
                    e.currentTarget.style.transform="translateY(0)";
                    e.currentTarget.style.borderColor="#e8dbc0";
                  }}>

                  {/* Card top row */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"10px" }}>
                    <h3 style={{
                      fontFamily:"var(--font-display)",
                      fontSize:"1rem", fontWeight:700, color:"#141814",
                      lineHeight:1.3, flex:1,
                      overflow:"hidden", display:"-webkit-box",
                      WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                    }}>
                      {j.title}
                    </h3>
                    {j.mood && ms && (
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:"4px",
                        padding:"4px 10px", borderRadius:"20px", flexShrink:0,
                        fontSize:"11px", fontWeight:700,
                        background:ms.background, color:ms.color,
                        border:`1px solid ${ms.border}`,
                      }}>
                        <span style={{ fontSize:"13px" }}>{MOOD_EMOJI[j.mood]}</span>
                        {j.mood}
                      </span>
                    )}
                  </div>

                  {/* Preview */}
                  <p style={{
                    fontSize:"13px", color:"#6b7280", lineHeight:1.6,
                    overflow:"hidden", display:"-webkit-box",
                    WebkitLineClamp:3, WebkitBoxOrient:"vertical",
                    flex:1,
                  }}>
                    {j.content}
                  </p>

                  {/* Footer row */}
                  <div style={{
                    display:"flex", alignItems:"center",
                    justifyContent:"space-between",
                    paddingTop:"10px",
                    borderTop:"0.5px solid #f2ebda",
                    marginTop:"auto",
                  }}>
                    <p style={{ fontSize:"12px", color:"#9cae9c", display:"flex", alignItems:"center", gap:"5px" }}>
                      <i className="fa-regular fa-calendar" style={{ fontSize:"11px" }}></i>
                      {new Date(j.createdAt).toLocaleDateString("en-US",{
                        month:"short", day:"numeric", year:"numeric",
                      })}
                    </p>
                    <div style={{ display:"flex", gap:"4px" }}>
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(j); }}
                        style={{
                          width:"28px", height:"28px", borderRadius:"7px",
                          border:"0.5px solid #e8dbc0", background:"#f4f7f4",
                          cursor:"pointer", display:"flex",
                          alignItems:"center", justifyContent:"center",
                          color:"#558055",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background="#e6ede6"}
                        onMouseLeave={e => e.currentTarget.style.background="#f4f7f4"}>
                        <i className="fa-solid fa-pen" style={{ fontSize:"10px" }}></i>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteId(j._id); }}
                        style={{
                          width:"28px", height:"28px", borderRadius:"7px",
                          border:"0.5px solid #fca5a5", background:"#fff1f2",
                          cursor:"pointer", display:"flex",
                          alignItems:"center", justifyContent:"center",
                          color:"#dc2626",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
                        onMouseLeave={e => e.currentTarget.style.background="#fff1f2"}>
                        <i className="fa-solid fa-trash" style={{ fontSize:"10px" }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteId && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </Layout>
  );
}

// ── Delete Modal ───────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,0.45)",
      backdropFilter:"blur(4px)",
      zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
    }}>
      <div style={{
        background:"#fff", borderRadius:"16px",
        padding:"32px 28px", maxWidth:"400px", width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,.15)",
        animation:"fadeUp .25s ease forwards",
      }}>
        <div style={{ textAlign:"center", marginBottom:"24px" }}>
          <div style={{
            width:"56px", height:"56px", borderRadius:"50%",
            background:"#fee2e2", margin:"0 auto 16px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <i className="fa-solid fa-triangle-exclamation"
              style={{ color:"#dc2626", fontSize:"22px" }}></i>
          </div>
          <h3 style={{
            fontFamily:"var(--font-display)",
            fontSize:"1.2rem", fontWeight:700, color:"#141814", marginBottom:"8px",
          }}>
            Delete this entry?
          </h3>
          <p style={{ fontSize:"13px", color:"#6b7280", lineHeight:1.6 }}>
            This action cannot be undone and will permanently remove your journal entry.
          </p>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onConfirm} style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center",
            gap:"8px", padding:"11px", borderRadius:"10px",
            border:"none", background:"#dc2626", color:"#fff",
            fontSize:"14px", fontWeight:600, cursor:"pointer",
          }}>
            <i className="fa-solid fa-trash" style={{ fontSize:"12px" }}></i>
            Yes, delete
          </button>
          <button onClick={onCancel} style={{
            flex:1, padding:"11px", borderRadius:"10px",
            border:"1.5px solid #e8dbc0", background:"#fff",
            color:"#374151", fontSize:"14px", fontWeight:600, cursor:"pointer",
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}