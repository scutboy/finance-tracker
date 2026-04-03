import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trackerBlue"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
          
          <footer className="mt-12 py-8 border-t border-gray-200 dark:border-white/5 text-center">
            <p className="text-gray-400 dark:text-slate-600 text-xs font-medium uppercase tracking-widest">
              © {new Date().getFullYear()} Vantage Finance | Built for the future of Charith & Family
            </p>
            <p className="text-[10px] text-gray-300 dark:text-slate-700 mt-1 uppercase tracking-tighter">
              Precision Debt & Wealth Management Console v2.1
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
