import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  TrendingUp, 
  Receipt, 
  Settings, 
  LogOut, 
  ChevronRight,
  Wallet,
  PiggyBank,
  Brain,
  CreditCard
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Income Hub', path: '/income', icon: <TrendingUp size={20} /> },
    { name: 'Expense Trace', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Debt Sniper', path: '/debt', icon: <CreditCard size={20} /> },
    { name: 'Debt Advisor', path: '/debt-advisor', icon: <Brain size={20} /> },
    { name: 'Savings Core', path: '/savings', icon: <PiggyBank size={20} /> },
    { name: 'Budget Guard', path: '/budget', icon: <Wallet size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-80 bg-white border-r border-slate-100 flex flex-col min-h-screen shadow-2xl shadow-blue-900/5 relative z-[60]">
      <div className="p-14">
        <div className="flex items-center gap-6 group">
          <div className="bg-slate-950 p-4 rounded-3xl shadow-xl shadow-blue-900/40 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
            <Shield className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 tracking-[0.4em] mb-1">VANTAGE</span>
            <span className="text-slate-950 tracking-tighter text-2xl font-black italic">STRATEGY</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-8 space-y-3 mt-8 overflow-y-auto custom-scrollbar">
        <p className="text-[9px] uppercase font-black text-slate-300 px-8 mb-10 tracking-[0.5em] opacity-80">Management Console</p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-8 py-5 rounded-[2.5rem] transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-600 text-white font-black shadow-2xl shadow-blue-500/30 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-6">
              <div className={`p-1.5 transition-colors ${item.path === window.location.hash.replace('#','') || (item.path === '/' && window.location.hash === '') ? 'text-white' : 'group-hover:text-blue-600 transition-colors'}`}>
                {item.icon}
              </div>
              <span className="text-[11px] uppercase font-black tracking-widest italic">{item.name}</span>
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:translate-x-1 group-hover:opacity-40 transition-all" />
          </NavLink>
        ))}
      </nav>
      
      <div className="p-12 bg-slate-50 border-t border-slate-100 mt-auto">
        <button 
          onClick={logout}
          className="flex items-center gap-6 px-10 py-5 w-full rounded-3xl text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-xl hover:shadow-rose-500/5 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <LogOut size={20} className="opacity-40" />
          Terminate
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
