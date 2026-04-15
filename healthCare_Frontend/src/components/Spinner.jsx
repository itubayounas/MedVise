export default function Spinner({ fullPage=true }) {
  const inner = (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.75rem",padding:"3rem 1rem"}}>
      <div style={{width:"2.5rem",height:"2.5rem",border:"3px solid var(--color-cream-300)",borderTop:"3px solid var(--color-sage-500)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}></div>
      <p style={{fontSize:"0.875rem",color:"var(--color-sage-500)",fontWeight:500}}>Loading…</p>
    </div>
  );
  if (!fullPage) return inner;
  return <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"60vh"}}>{inner}</div>;
}