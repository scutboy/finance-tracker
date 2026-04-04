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
  History,
  X
} from 'lucide-react';

const Sidebar = ({ mobile = false, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Income Hub', path: '/income', icon: TrendingUp },
    { name: 'Expense Trace', path: '/expenses', icon: Receipt },
    { name: 'Debt Sniper', path: '/debt', icon: CreditCard },
    { name: 'Debt Advisor', path: '/debt-advisor', icon: Brain },
    { name: 'Subscriptions', path: '/subscriptions', icon: Zap },
    { name: 'Savings Core', path: '/savings', icon: PiggyBank },
    { name: 'Budget Guard', path: '/budget', icon: Wallet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const content = (
    <div className={`flex flex-col h-full bg-white ${mobile ? 'w-full' : 'w-64 border-r border-slate-100'} shadow-2xl relative z-[100] italic`}>
      {/* Brand Node */}
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4 group">
          <div className="bg-slate-950 p-2 rounded-xl shadow-2xl group-hover:rotate-12 transition-all duration-700">
            <Shield className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 tracking-[0.4em] mb-0.5 italic">CHARITH'S VANTAGE</span>
            <span className="text-slate-950 tracking-tighter text-xl font-black italic uppercase leading-none">Strategy</span>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
            <X size={24} />
          </button>
        )}
      </div>
      
      {/* Navigation Matrix */}
      <nav className="flex-1 px-4 pt-8 overflow-y-auto custom-scrollbar pb-32">
        <div className="px-4 mb-6">
          <p className="text-[8px] uppercase font-black text-slate-300 tracking-[0.5em] italic">Global Console</p>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={mobile ? onClose : undefined}
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
                    <span className="text-[10px] uppercase font-black tracking-[0.1em] italic">{item.name}</span>
                  </div>
                  <ChevronRight size={12} className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-1 text-blue-500' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-1'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* Logout */}
      <div className="p-8 border-t border-slate-50 bg-white sticky bottom-0 z-20">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-3 px-6 py-4 w-full rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-black uppercase tracking-[0.2em] text-[8px] italic border border-slate-50"
        >
          <LogOut size={14} />
          Terminate Session
        </button>
      </div>
    </div>
  );

  if (mobile) return content;

  return (
    <div className="hidden lg:flex h-screen sticky top-0">
      {content}
    </div>
  );
};

export default Sidebar;
