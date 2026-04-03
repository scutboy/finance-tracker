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
  Moon,
  Sun,
  ShieldHalf
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Income', path: '/income', icon: <TrendingUp size={18} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={18} /> },
    { name: 'Debt Sniper', path: '/debt', icon: <CreditCard size={18} /> },
    { name: 'Debt Advisor', path: '/debt-advisor', icon: <Brain size={18} /> },
    { name: 'Savings & Future', path: '/savings', icon: <PiggyBank size={18} /> },
    { name: 'Budgeting', path: '/budget', icon: <Wallet size={18} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 dark:bg-black text-white flex flex-col min-h-screen shadow-xl border-r border-slate-800 dark:border-white/5 relative z-20">
      <div className="p-8">
        <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-emerald-400 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldHalf className="text-white" size={24} />
          </div>
          VANTAGE<span className="text-blue-400">FINANCE</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-5 space-y-1.5 mt-2">
        <p className="text-[10px] uppercase font-bold text-slate-500 px-4 mb-4 tracking-widest">Main Console</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/20 translate-x-1' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
              }`
            }
          >
            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-5 space-y-3 border-t border-slate-800/50">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all border border-slate-800"
        >
          {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
