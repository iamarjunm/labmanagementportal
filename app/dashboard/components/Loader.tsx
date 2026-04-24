export function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-6">
        {/* Animated spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
          <div className="absolute inset-2 flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-700">MUJ</span>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Loading Dashboard</p>
          <p className="text-sm text-slate-500">Please wait...</p>
        </div>
      </div>
    </div>
  );
}
