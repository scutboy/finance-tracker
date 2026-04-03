import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ShieldHalf } from 'lucide-react';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-2xl"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white selection:bg-blue-600/10">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/20 relative">
        {/* Unified ambient background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <main className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto p-8 md:p-12 lg:p-16">
            <Outlet />
            
            <footer className="mt-20 pt-12 pb-12 border-t border-slate-200/50 relative group">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-6 py-2 border border-slate-100/50 rounded-full shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <ShieldHalf size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
               </div>
               
               <div className="text-center space-y-4">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 italic">
                    © {new Date().getFullYear()} Vantage Strategic Financial Matrix
                  </p>
                  <p className="text-slate-400 text-[9px] font-medium uppercase tracking-[0.2em] max-w-md mx-auto leading-loose opacity-60">
                    Engineered for <span className="text-slate-800 font-bold border-b border-blue-200/50">Charith & Family</span>. Precision wealth architecture.
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-4 opacity-30 group-hover:opacity-100 transition-opacity">
                     <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                     <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em]">SECURE CHANNEL ACTIVE</span>
                     <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                  </div>
               </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
