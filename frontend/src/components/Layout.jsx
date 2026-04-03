import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ShieldHalf, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent shadow-xl"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Section */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white/50 backdrop-blur-3xl custom-scrollbar relative">
        {/* Simple Header for verification */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white/80 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic">{window.location.pathname.replace('/','') || 'Dashboard'}</span>
          </div>
          <button onClick={logout} className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] hover:text-rose-600 transition-colors flex items-center gap-2">
             <LogOut size={14} />
             Session Terminate
          </button>
        </header>

        <main className="flex-1 p-8 md:p-12">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
