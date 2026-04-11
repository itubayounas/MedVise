import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="blob w-96 h-96 bg-sage-300 top-0 -left-32 animate-drift"         style={{ position:"fixed" }} />
      <div className="blob w-80 h-80 bg-cream-300 top-1/3 -right-20 animate-drift-slow" style={{ position:"fixed" }} />
      <div className="blob w-64 h-64 bg-sage-200 bottom-10 left-1/4 animate-float"      style={{ position:"fixed" }} />
      <div className="blob w-48 h-48 bg-amber-100 bottom-1/3 right-1/3 animate-pulse2"  style={{ position:"fixed" }} />

      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}