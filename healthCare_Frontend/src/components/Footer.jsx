export default function Footer() {
  return (
    <footer style={{
      borderTop:"0.5px solid rgba(119,159,119,0.25)",
      background:"rgba(255,255,255,0.8)",
      backdropFilter:"blur(12px)",
      padding:"24px 16px",
      marginTop:"auto",
    }}>
      <div style={{
        maxWidth:"1200px",
        margin:"0 auto",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        gap:"10px",
      }}>

        {/* Logo row */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"20px" }}>🏥</span>
          <span style={{
            fontFamily:"var(--font-display)",
            fontSize:"17px",
            fontWeight:700,
            color:"#1a2e1a",
          }}>
            MedVise
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize:"12px",
          color:"#6b8f6b",
          textAlign:"center",
          maxWidth:"400px",
          lineHeight:1.6,
        }}>
          Smart Healthcare & Mental Health Management Platform.
          Your health, managed intelligently.
        </p>

        {/* Links */}
        {/* <div style={{
          display:"flex",
          gap:"20px",
          flexWrap:"wrap",
          justifyContent:"center",
          marginTop:"4px",
        }}>
          {["Privacy Policy","Terms of Service","Support","Contact"].map(link => (
            <span
              key={link}
              style={{
                fontSize:"12px",
                color:"#558055",
                cursor:"pointer",
                fontWeight:500,
                transition:"color .15s",
              }}
              onMouseEnter={e => e.target.style.color = "#2c402c"}
              onMouseLeave={e => e.target.style.color = "#558055"}
            >
              {link}
            </span>
          ))}
        </div> */}

        {/* Divider */}
        <div style={{
          width:"100%",
          height:"0.5px",
          background:"rgba(119,159,119,0.2)",
          margin:"4px 0",
        }} />

        {/* Copyright */}
        <p style={{ fontSize:"11px", color:"#9cae9c", textAlign:"center" }}>
          © {new Date().getFullYear()} MedVise. All rights reserved.
          {/* &nbsp;·&nbsp; Built with React + Node.js */}
        </p>

      </div>
    </footer>
  );
}