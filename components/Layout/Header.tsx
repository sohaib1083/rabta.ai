'use client';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lead Management System</h1>
          <p className="text-slate-600 mt-1 font-medium">Pakistan Real Estate Market Intelligence</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">System Active</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">Lead Manager</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}