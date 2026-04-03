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
  CreditCard,
  Zap,
  Activity,
  History
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

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
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen shadow-2xl shadow-slate-200/50 relative z-[100]">
      {/* Brand Node */}
      <div className="p-8 border-b border-slate-50">
        <div className="flex items-center gap-4 group">
          <div className="bg-slate-950 p-2 rounded-xl shadow-2xl shadow-blue-900/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
            <Shield className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 tracking-[0.4em] mb-0.5 italic opacity-60">VANTAGE</span>
            <span className="text-slate-950 tracking-tighter text-xl font-black italic uppercase leading-none">Strategy</span>
          </div>
        </div>
      </div>
      
      {/* Navigation Matrix */}
      <nav className="flex-1 px-4 pt-8 overflow-y-auto custom-scrollbar pb-32">
        <div className="px-4 mb-6">
          <p className="text-[8px] uppercase font-black text-slate-300 tracking-[0.5em] opacity-80 italic">Global Console</p>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-500 group relative ${
                  isActive 
                    ? 'bg-slate-950 text-white font-black shadow-lg shadow-slate-950/20' 
                    : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`transition-all duration-500 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-600'}`}>
                      <item.icon size={18} />
                    </div>
                    <span className={`text-[10px] uppercase font-black tracking-[0.1em] italic transition-transform`}>{item.name}</span>
                  </div>
                  {isActive && (
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-0.5 h-4 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50 scale-110 transition-all"></div>
                  )}
                  <ChevronRight size={12} className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-1 text-blue-500' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-1'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* System Integrity & Logout */}
      <div className="p-8 border-t border-slate-50 bg-white sticky bottom-0 z-20">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-3 px-6 py-4 w-full rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-black uppercase tracking-[0.2em] text-[8px] italic border border-slate-50 hover:border-rose-100"
        >
          <LogOut size={14} />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
