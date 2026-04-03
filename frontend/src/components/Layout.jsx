import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading, logout } = useAuth();

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
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative">
        <header className="flex items-center justify-between px-16 py-12 bg-white/80 backdrop-blur-3xl border-b border-slate-100/50 sticky top-0 z-[50] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Vantage Navigation Protocol</span>
          </div>
          <button 
            onClick={logout} 
            className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] px-10 py-5 bg-rose-50/50 hover:bg-rose-100 rounded-3xl border border-rose-100/30 transition-all active:scale-95"
          >
             Terminate Session
          </button>
        </header>

        <main className="flex-1 p-16 max-w-7xl mx-auto w-full">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
