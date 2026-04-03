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
    <div className="min-h-screen bg-slate-50 relative">
      <div className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.5em] py-2 px-8 text-center sticky top-0 z-[9999]">
         Vantage Debug: User={user?.email} | Name={user?.name} | State=LOGGED_IN
      </div>
      
      {/* Sidebar Section - Temporarily Disabled for debug bypass */}
      {/* <Sidebar /> */}
      
      {/* Main Content Area */}
      <div className="p-8">
        <header className="flex items-center justify-between px-8 py-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Vantage Registry</span>
          </div>
          <button onClick={logout} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline px-6 py-3 bg-rose-50 rounded-2xl">
             Terminate Connection
          </button>
        </header>

        <main>
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
