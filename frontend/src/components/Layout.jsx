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
      {/* Sidebar Domain */}
      <div className="border-4 border-dashed border-emerald-500/20">
         <Sidebar />
      </div>
      
      {/* Primary Flux Core */}
      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-16 custom-scrollbar border-4 border-dashed border-rose-500/20">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-5">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">Vantage v3.1 Logic Core</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
