import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Activity, ShieldCircle } from 'lucide-react';

const Layout = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 gap-6">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent shadow-xl"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Vantage Node Handshake...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 italic">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute inset-y-4 left-4 w-72 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-in-left">
            <Sidebar mobile={true} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Command Center */}
      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto h-screen relative custom-scrollbar">
        {/* Responsive Header Node */}
        <header className="flex items-center justify-between p-6 lg:px-16 lg:py-12 bg-white/40 backdrop-blur-md lg:bg-transparent sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-slate-950 text-white rounded-xl shadow-xl hover:bg-blue-600 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none opacity-80">v4.2.1 PLATINUM</span>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg"><ShieldCircle size={16} className="text-white"/></div>
              <span className="text-sm font-black italic tracking-tighter text-slate-950 uppercase leading-none">Strategy</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1 italic">Status Hub</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] italic">System Active</span>
                <Activity size={10} className="text-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-16 lg:pt-4">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
