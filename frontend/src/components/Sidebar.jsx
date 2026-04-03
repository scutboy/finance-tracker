import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, TrendingUp, Receipt, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Income', path: '/income', icon: <TrendingUp size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-80 bg-white border-r border-slate-100 flex flex-col min-h-screen shadow-2xl shadow-blue-900/5">
      <div className="p-12">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-4 rounded-3xl shadow-xl shadow-blue-900/20">
            <Shield className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 tracking-[0.4em] mb-1">VANTAGE</span>
            <span className="text-slate-900 tracking-tighter text-2xl font-black italic">STRATEGY</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-8 space-y-3 mt-8 overflow-y-auto">
        <p className="text-[9px] uppercase font-black text-slate-400 px-6 mb-8 tracking-[0.4em]">Protocol Node</p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-5 px-8 py-5 rounded-[2rem] transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600 text-white font-black shadow-2xl shadow-blue-500/20 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] uppercase font-black tracking-widest italic">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-10 bg-slate-50 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-5 px-8 py-5 w-full rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-black uppercase tracking-widest text-[9px]"
        >
          <LogOut size={18} />
          Terminate
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
