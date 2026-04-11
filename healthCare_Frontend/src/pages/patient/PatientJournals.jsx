import { useEffect, useState } from "react";
import { getJournals, createJournal, updateJournal, deleteJournal } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const MOODS = ["Happy","Sad","Stressed","Anxious","Calm","Angry","Unwell"];
const MOOD_EMOJI  = { Happy:"😊", Sad:"😔", Stressed:"😤", Anxious:"😰", Calm:"😌", Angry:"😠", Unwell:"🤒" };
const MOOD_COLORS = {
  Happy:"bg-yellow-100 text-yellow-800 border-yellow-300",
  Sad:"bg-blue-100 text-blue-800 border-blue-300",
  Stressed:"bg-red-100 text-red-800 border-red-300",
  Anxious:"bg-orange-100 text-orange-800 border-orange-300",
  Calm:"bg-sage-100 text-sage-700 border-sage-300",
  Angry:"bg-red-200 text-red-900 border-red-400",
  Unwell:"bg-purple-100 text-purple-800 border-purple-300",
};
const EMPTY = { title:"", content:"", mood:"" };

export default function PatientJournals() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("list"); // list | form | detail
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = async () => {
    const { data } = await getJournals();
    setJournals(data); setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openNew    = () => { setForm(EMPTY); setSelected(null); setView("form"); };
  const openEdit   = (j) => { setForm({ title:j.title, content:j.content, mood:j.mood||"" }); setSelected(j); setView("form"); };
  const openDetail = (j) => { setSelected(j); setView("detail"); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (selected) { await updateJournal(selected._id, form); toast.success("Journal updated! ✏️"); }
      else          { await createJournal(form); toast.success("Journal entry saved! 📓"); }
      await fetch(); setView("list");
    } catch { toast.error("Failed to save journal"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    await deleteJournal(id);
    toast.success("Journal deleted.");
    setDeleteId(null);
    if (view === "detail") setView("list");
    fetch();
  };

  if (loading) return <Layout><Spinner /></Layout>;

  // ── Detail ──
  if (view === "detail" && selected) {
    const j = journals.find(x => x._id === selected._id) || selected;
    return (
      <Layout>
        <div className="animate-fade-up max-w-2xl mx-auto">
          <button onClick={() => setView("list")} className="text-sage-600 hover:underline text-sm mb-4 flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i>Back to journals
          </button>
          <div className="card shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-charcoal-900">{j.title}</h1>
                <p className="text-sm text-sage-500 mt-1">
                  <i className="fa-regular fa-calendar mr-1.5"></i>
                  {new Date(j.createdAt).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
                </p>
              </div>
              {j.mood && (
                <span className={`text-sm px-3 py-1 rounded-full border font-semibold flex-shrink-0 ${MOOD_COLORS[j.mood]||""}`}>
                  {MOOD_EMOJI[j.mood]} {j.mood}
                </span>
              )}
            </div>
            <div className="bg-cream-50 rounded-xl p-4 border border-cream-200">
              <p className="text-charcoal-800 leading-relaxed whitespace-pre-wrap text-sm">{j.content}</p>
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t border-cream-200">
              <button onClick={() => openEdit(j)} className="btn-secondary btn-sm">
                <i className="fa-solid fa-pen mr-1.5"></i>Edit
              </button>
              <button onClick={() => setDeleteId(j._id)} className="btn-danger btn-sm">
                <i className="fa-solid fa-trash mr-1.5"></i>Delete
              </button>
            </div>
          </div>
        </div>
        {deleteId && <DeleteModal onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />}
      </Layout>
    );
  }

  // ── Form ──
  if (view === "form") {
    return (
      <Layout>
        <div className="animate-fade-up max-w-2xl mx-auto">
          <button onClick={() => setView("list")} className="text-sage-600 hover:underline text-sm mb-4 flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i>Back to journals
          </button>
          <div className="card shadow-md">
            <h2 className="font-display text-2xl font-semibold text-charcoal-900 mb-6">
              <i className={`fa-solid ${selected ? "fa-pen" : "fa-plus"} text-sage-500 mr-2`}></i>
              {selected ? "Edit Entry" : "New Journal Entry"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input className="input" placeholder="What's on your mind today?" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})} required />
              </div>
              <div>
                <label className="label"><i className="fa-solid fa-face-smile text-amber-400 mr-1.5"></i>How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button type="button" key={m} onClick={() => setForm({...form, mood: form.mood===m ? "" : m})}
                      className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                        form.mood===m ? (MOOD_COLORS[m]||"bg-sage-100 text-sage-700 border-sage-300") : "bg-white border-cream-300 text-charcoal-700 hover:border-sage-300"
                      }`}>
                      {MOOD_EMOJI[m]} {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Your thoughts</label>
                <textarea className="input resize-none" rows={10} placeholder="Write freely — this is your private space..."
                  value={form.content} onChange={e => setForm({...form, content:e.target.value})} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving…</> : <><i className="fa-solid fa-floppy-disk mr-2"></i>{selected ? "Update" : "Save Entry"}</>}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setView("list")}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  // ── List ──
  const moodCounts = {};
  journals.forEach(j => { if (j.mood) moodCounts[j.mood] = (moodCounts[j.mood]||0)+1; });
  const topMood = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0];

  return (
    <Layout>
      <div className="animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <h1 className="page-title"><i className="fa-solid fa-book-open text-sage-500 mr-2"></i>My Journal</h1>
          <button onClick={openNew} className="btn-primary">
            <i className="fa-solid fa-plus mr-2"></i>New Entry
          </button>
        </div>
        <p className="page-sub">Your private mental wellness diary</p>

        {/* Summary banner */}
        {journals.length > 0 && (
          <div className="card mb-6 bg-gradient-to-r from-sage-50 to-cream-100 border-sage-200 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-sm text-sage-600 font-medium">Total entries</p>
              <p className="text-3xl font-display font-bold text-charcoal-900">{journals.length}</p>
            </div>
            {topMood && (
              <div>
                <p className="text-sm text-sage-600 font-medium">Most frequent mood</p>
                <p className="text-2xl font-display font-bold text-charcoal-900">
                  {MOOD_EMOJI[topMood[0]]} {topMood[0]}
                  <span className="text-base font-body font-normal text-sage-500 ml-1">({topMood[1]}×)</span>
                </p>
              </div>
            )}
          </div>
        )}

        {journals.length === 0 ? (
          <div className="card empty-state py-16">
            <i className="fa-solid fa-book-medical text-5xl mb-4 block"></i>
            <p className="font-display text-xl font-semibold text-charcoal-900 mb-1">Start your wellness journey</p>
            <p className="text-sm text-sage-500 mb-4">Regular journaling helps you understand your emotional patterns.</p>
            <button onClick={openNew} className="btn-primary">
              <i className="fa-solid fa-pen mr-2"></i>Write your first entry
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journals.map((j, i) => (
              <div key={j._id} className="card card-hover cursor-pointer group animate-fade-up"
                style={{ animationDelay:`${i*50}ms`, opacity:0, animationFillMode:"forwards" }}
                onClick={() => openDetail(j)}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-charcoal-900 line-clamp-1 group-hover:text-sage-700 transition-colors">{j.title}</h3>
                  {j.mood && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${MOOD_COLORS[j.mood]||""}`}>
                      {MOOD_EMOJI[j.mood]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-charcoal-600 line-clamp-3 leading-relaxed mb-3">{j.content}</p>
                <div className="flex items-center justify-between pt-2 border-t border-cream-100 mt-auto">
                  <p className="text-xs text-sage-400">
                    <i className="fa-regular fa-calendar mr-1"></i>
                    {new Date(j.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); openEdit(j); }}
                      className="text-xs text-sage-600 hover:text-sage-800 font-semibold">
                      <i className="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteId(j._id); }}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold">
                      <i className="fa-solid fa-trash mr-1"></i>Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteId && <DeleteModal onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />}
    </Layout>
  );
}

function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        <div className="text-center mb-4">
          <i className="fa-solid fa-triangle-exclamation text-red-400 text-4xl mb-2 block"></i>
          <h3 className="font-display text-lg font-bold text-charcoal-900">Delete this entry?</h3>
          <p className="text-sm text-sage-500 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="btn-danger flex-1"><i className="fa-solid fa-trash mr-1.5"></i>Yes, delete</button>
          <button onClick={onCancel}  className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}