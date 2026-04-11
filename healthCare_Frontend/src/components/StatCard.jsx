export default function StatCard({ label, value, icon, color = "sage", delay = 0 }) {
  const colors = {
    sage:   "bg-sage-50   text-sage-600   border-sage-200",
    blue:   "bg-blue-50   text-blue-600   border-blue-200",
    amber:  "bg-amber-50  text-amber-600  border-amber-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red:    "bg-red-50    text-red-600    border-red-200",
  };
  return (
    <div
      className="card card-hover flex items-center gap-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: "forwards" }}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border ${colors[color]}`}>
        <i className={icon}></i>
      </div>
      <div>
        <p className="text-sm text-sage-600 font-medium">{label}</p>
        <p className="text-3xl font-display font-bold text-charcoal-900 leading-tight">{value ?? "—"}</p>
      </div>
    </div>
  );
}