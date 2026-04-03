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
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Income', path: '/income', icon: <TrendingUp size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Debt', path: '/debt', icon: <CreditCard size={20} /> },
    { name: 'Debt Advisor', path: '/debt-advisor', icon: <Brain size={20} /> },
    { name: 'Savings', path: '/savings', icon: <PiggyBank size={20} /> },
    { name: 'Budget', path: '/budget', icon: <Wallet size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Wallet className="text-trackerGreen" size={28} />
          Finance<span className="text-trackerGreen">Track</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-trackerBlue text-white font-medium shadow-md shadow-trackerBlue/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:translate-x-1'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-trackerRed hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
