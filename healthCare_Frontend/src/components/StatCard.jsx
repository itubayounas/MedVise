export default function StatCard({ label, value, icon, colorClass="sage", delay=0, trend }) {
  const themes = {
    sage:   {bg:"var(--color-sage-50)",   color:"var(--color-sage-600)",   border:"var(--color-sage-200)"},
    blue:   {bg:"#eff6ff",                color:"#2563eb",                 border:"#bfdbfe"},
    amber:  {bg:"#fffbeb",                color:"#d97706",                 border:"#fcd34d"},
    purple: {bg:"#f5f3ff",                color:"#7c3aed",                 border:"#ddd6fe"},
    red:    {bg:"#fef2f2",                color:"#dc2626",                 border:"#fecaca"},
    teal:   {bg:"#f0fdfa",                color:"#0d9488",                 border:"#99f6e4"},
  };
  const t = themes[colorClass] || themes.sage;

  return (
    <div className="stat-card" style={{animationDelay:`${delay}ms`}}>
      <div className="stat-icon" style={{background:t.bg,color:t.color,border:`1px solid ${t.border}`}}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? "—"}</div>
        {trend && (
          <div style={{fontSize:"0.7rem",marginTop:"0.25rem",color:trend.up?"#16a34a":"#dc2626",fontWeight:600}}>
            <i className={`fa-solid fa-arrow-${trend.up?"up":"down"} mr-1`}></i>{trend.text}
          </div>
        )}
      </div>
    </div>
  );
}