import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  CreditCard,
  Zap,
  Activity,
  History
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Income Hub', path: '/income', icon: TrendingUp },
    { name: 'Expense Trace', path: '/expenses', icon: Receipt },
    { name: 'Debt Sniper', path: '/debt', icon: CreditCard },
    { name: 'Debt Advisor', path: '/debt-advisor', icon: Brain },
    { name: 'Savings Core', path: '/savings', icon: PiggyBank },
    { name: 'Budget Guard', path: '/budget', icon: Wallet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-80 bg-white border-r-8 border-emerald-500/10 flex flex-col h-screen shadow-xl relative z-10">
      {/* Brand Node */}
      <div className="p-14 border-b border-slate-100">
        <div className="flex items-center gap-6 group">
          <div className="bg-slate-950 p-4 rounded-3xl shadow-2xl shadow-blue-900/40 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
            <Shield className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 tracking-[0.5em] mb-1 italic opacity-60">VANTAGE</span>
            <span className="text-slate-950 tracking-tighter text-3xl font-black italic uppercase leading-none">Strategy</span>
          </div>
        </div>
      </div>
      
      {/* Navigation Matrix */}
      <nav className="flex-1 px-8 space-y-3 mt-10 overflow-y-auto">
        <p className="text-[9px] uppercase font-black text-slate-300 px-8 mb-12 tracking-[0.6em] opacity-80 italic">Audit Console Active</p>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-8 py-5 rounded-[2.5rem] transition-all duration-500 group relative border-2 border-transparent hover:border-blue-500/20 active:scale-95 ${
                isActive 
                  ? 'bg-slate-950 text-white font-black shadow-3xl shadow-slate-950/20 translate-x-2' 
                  : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-8">
                <div className={`transition-all duration-500 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-600'}`}>
                  <item.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-[11px] uppercase font-black tracking-[0.2em] italic ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>{item.name}</span>
              </div>
              {isActive && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-1.5 h-6 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50 scale-110 transition-all"></div>
              )}
              <ChevronRight size={14} className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-2 text-blue-500' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-1'}`} />
            </Link>
          );
        })}
      </nav>
      
      <div className="p-12 mt-auto border-t border-slate-50">
        <button 
          onClick={logout}
          className="flex items-center gap-6 px-10 py-6 w-full rounded-[2.5rem] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-black uppercase tracking-[0.4em] text-[10px] italic border border-transparent hover:border-rose-100"
        >
          <LogOut size={20} />
          Terminate
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
