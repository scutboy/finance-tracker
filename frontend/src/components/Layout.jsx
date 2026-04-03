import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', color: '#94a3b8' }}>INIT_HANDSHAKE ACTIVE...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      <div className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.5em] py-2 px-8 text-center fixed bottom-0 left-0 right-0 z-[9999] opacity-20 pointer-events-none">
         Vantage Debug: User={user?.email} | Status=STABLE_V3
      </div>
      
      {/* Sidebar Section - Stable Restore */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative">
        <header className="flex items-center justify-between px-12 py-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm sticky top-0 z-[50]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Vantage Navigation Protocol</span>
          </div>
          <button onClick={logout} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline px-8 py-4 bg-rose-50 rounded-2xl transition-all">
             Terminate Session
          </button>
        </header>

        <main className="flex-1 p-12">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
