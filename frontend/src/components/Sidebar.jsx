import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  Receipt, 
  TrendingUp,
  Brain,
  Settings, 
  LogOut,
  ShieldHalf,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Income', path: '/income', icon: <TrendingUp size={18} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={18} /> },
    { name: 'Debt Sniper', path: '/debt', icon: <CreditCard size={18} /> },
    { name: 'Debt Advisor', path: '/debt-advisor', icon: <Brain size={18} /> },
    { name: 'Savings & Future', path: '/savings', icon: <PiggyBank size={18} /> },
    { name: 'Budgeting', path: '/budget', icon: <Wallet size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-80 bg-white border-r border-slate-100 flex flex-col min-h-screen relative z-50 overflow-hidden shadow-2xl shadow-blue-900/5">
      {/* Decorative background flux */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="p-12 relative z-10">
        <div className="flex items-center gap-5 group">
          <div className="bg-slate-950 p-4 rounded-3xl shadow-2xl shadow-blue-950/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <ShieldHalf className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="leading-none tracking-[0.4em] text-[9px] font-black text-slate-400 mb-1">VANTAGE</span>
            <span className="leading-none text-slate-900 tracking-tighter text-2xl font-black italic">STRATEGY</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-8 space-y-2 mt-8 relative z-10 overflow-y-auto custom-scrollbar">
        <p className="text-[9px] uppercase font-black text-slate-300 px-5 mb-8 tracking-[0.4em] opacity-80">Management Console</p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-600 text-white font-black shadow-2xl shadow-blue-500/30' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-5">
              <div className={`p-2.5 rounded-xl transition-all ${item.path === window.location.pathname ? 'bg-white shadow-sm text-blue-600' : 'group-hover:text-blue-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black italic">{item.name}</span>
            </div>
            <ChevronRight size={14} className={`opacity-0 group-hover:opacity-40 transition-all ${isActive ? 'translate-x-1 opacity-20' : ''}`} />
          </NavLink>
        ))}
      </nav>
      
      <div className="p-10 space-y-6 relative z-10 bg-slate-50 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-5 px-6 py-5 w-full rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group font-black uppercase tracking-widest text-[9px]"
        >
          <div className="p-3 bg-white rounded-xl shadow-sm text-slate-300 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/20 transition-all">
            <LogOut size={18} />
          </div>
          Session Terminate
        </button>
        <div className="px-6 opacity-30">
           <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.5em] italic">VANTAGE LINK SECURE v3.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
