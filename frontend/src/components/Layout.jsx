import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();

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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-16 custom-scrollbar relative">
        <header className="flex items-center justify-between mb-16 px-4">
          <div className="flex items-center gap-5">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none opacity-80">Vantage Stable v3.1</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1 italic">Status Hub</span>
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] italic">Operational System Active</span>
            </div>
          </div>
        </header>
        <div className="px-4">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
