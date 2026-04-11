export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-cream-300 border-t-sage-500 rounded-full animate-spin" />
      <p className="text-sm text-sage-500 font-body">Loading…</p>
    </div>
  );
}