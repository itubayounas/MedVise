import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Layout({ children }) {
  return (
    <>
      {/* Fixed blobs — outside the flex container so they never affect layout */}
      <div style={{
        position:"fixed", width:"500px", height:"500px", borderRadius:"50%",
        background:"radial-gradient(circle, #779f77, #558055, transparent)",
        top:"-150px", left:"-150px", opacity:0.28, filter:"blur(70px)",
        pointerEvents:"none", zIndex:0,
        animation:"drift 18s ease-in-out infinite",
      }} />
      <div style={{
        position:"fixed", width:"420px", height:"420px", borderRadius:"50%",
        background:"radial-gradient(circle, #d4a853, #c8956b, transparent)",
        bottom:"-100px", right:"-100px", opacity:0.22, filter:"blur(60px)",
        pointerEvents:"none", zIndex:0,
        animation:"drift 25s ease-in-out infinite reverse",
      }} />
      <div style={{
        position:"fixed", width:"320px", height:"320px", borderRadius:"50%",
        background:"radial-gradient(circle, #a5c1a5, #779f77, transparent)",
        top:"40%", right:"5%", opacity:0.2, filter:"blur(55px)",
        pointerEvents:"none", zIndex:0,
        animation:"float 9s ease-in-out infinite",
      }} />
      <div style={{
        position:"fixed", width:"200px", height:"200px", borderRadius:"50%",
        background:"radial-gradient(circle, #5ba4a4, #3d7a7a, transparent)",
        top:"15%", right:"25%", opacity:0.18, filter:"blur(45px)",
        pointerEvents:"none", zIndex:0,
        animation:"pulse2 5s ease-in-out infinite",
      }} />

      {/* Main layout — clean flex column, no overflow issues */}
      <div style={{
        minHeight:"100vh",
        display:"flex",
        flexDirection:"column",
        position:"relative",
        zIndex:1,
      }}>
        <Navbar />

        <main style={{
          flex:1,
          width:"100%",
          maxWidth:"1200px",
          margin:"0 auto",
          padding:"24px 16px 48px",
        }}>
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}