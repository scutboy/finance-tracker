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
    <div className="w-80 bg-white border-r border-slate-200/60 flex flex-col min-h-screen relative z-20 overflow-hidden">
      {/* Subtle decorative background nodes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="p-10 relative z-10">
        <div className="flex items-center gap-4 group">
          <div className="bg-vantage-950 p-3.5 rounded-2xl shadow-xl shadow-vantage-950/20 group-hover:scale-110 transition-transform duration-500">
            <ShieldHalf className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="leading-none tracking-[0.4em] text-[9px] font-black text-vantage-400">VANTAGE</span>
            <span className="leading-none text-vantage-950 tracking-tighter text-xl font-bold italic">STRATEGY</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-6 space-y-1.5 mt-6 relative z-10 overflow-y-auto custom-scrollbar">
        <p className="text-[9px] uppercase font-bold text-vantage-400 px-4 mb-6 tracking-[0.3em] opacity-70">Control Center</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-vantage-50 text-vantage-950 font-bold border border-vantage-100/50 shadow-sm' 
                  : 'text-vantage-500 hover:text-vantage-950 hover:bg-vantage-50/50'
              }`
            }
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${item.path === window.location.pathname ? 'bg-white shadow-sm text-vantage-blue' : 'group-hover:text-vantage-blue'}`}>
                {item.icon}
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold">{item.name}</span>
            </div>
            <ChevronRight size={14} className={`opacity-0 group-hover:opacity-40 transition-opacity ${isActive ? 'opacity-20' : ''}`} />
          </NavLink>
        ))}
      </nav>
      
      <div className="p-8 space-y-4 relative z-10 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-4 py-4 w-full rounded-xl text-vantage-400 hover:text-rose-500 hover:bg-rose-50 transition-all group font-bold uppercase tracking-widest text-[9px]"
        >
          <div className="p-2 bg-vantage-50 rounded-lg group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
            <LogOut size={16} />
          </div>
          Session Terminate
        </button>
        <div className="px-4 py-2 opacity-40">
           <p className="text-[7px] font-bold text-vantage-400 uppercase tracking-[0.3em]">VANTAGE LINK SECURE</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
