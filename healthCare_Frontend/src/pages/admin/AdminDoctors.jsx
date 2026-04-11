import { useEffect, useState } from "react";
import { getPendingDoctors, approveDoctor } from "../../api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [tab, setTab] = useState("pending"); // pending | approved

  const fetch = async () => {
    const { data } = await getPendingDoctors();
    setDoctors(data);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await approveDoctor(id);
      toast.success("Doctor approved! They can now log in. ✅");
      setDoctors(prev => prev.filter(d => d._id !== id));
    } catch { toast.error("Approval failed"); }
    finally { setApproving(null); }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="animate-fade-up">
        <h1 className="page-title"><i className="fa-solid fa-user-doctor text-sage-500 mr-2"></i>Doctor Management</h1>
        <p className="page-sub">Review and approve doctor registration requests</p>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-display font-bold text-amber-600">{doctors.length}</p>
            <p className="text-sm text-sage-600 mt-1 font-medium"><i className="fa-solid fa-clock mr-1"></i>Pending Approval</p>
          </div>
          <div className="card sm:col-span-2 flex items-center gap-4 bg-amber-50/50 border-amber-200">
            <i className="fa-solid fa-circle-info text-amber-500 text-2xl flex-shrink-0"></i>
            <p className="text-sm text-amber-800">
              Doctors cannot log in until their account is approved. Review their details carefully before approving.
            </p>
          </div>
        </div>

        {doctors.length === 0 ? (
          <div className="card empty-state py-16">
            <i className="fa-solid fa-circle-check text-5xl mb-4 block text-sage-400"></i>
            <p className="font-display text-xl font-semibold text-charcoal-900 mb-1">All caught up!</p>
            <p className="text-sm text-sage-500">No doctors are waiting for approval.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((d, i) => (
              <div key={d._id} className="card card-hover animate-fade-up"
                style={{animationDelay:`${i*60}ms`, opacity:0, animationFillMode:"forwards"}}>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center font-display font-bold text-white text-2xl flex-shrink-0">
                    {(d.name||"D")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal-900 truncate">{d.name}</p>
                    <p className="text-xs text-sage-500 truncate">{d.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-charcoal-700">
                    <i className="fa-solid fa-user-doctor text-sage-400 w-4"></i>
                    <span>Doctor</span>
                    <span className="badge-pending ml-auto"><i className="fa-solid fa-clock"></i>Pending</span>
                  </div>
                  <div className="flex items-center gap-2 text-sage-500 text-xs">
                    <i className="fa-solid fa-envelope w-4"></i>
                    <span className="truncate">{d.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(d._id)}
                  disabled={approving === d._id}
                  className="btn-primary w-full">
                  {approving === d._id
                    ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Approving…</>
                    : <><i className="fa-solid fa-check mr-2"></i>Approve Doctor</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}