import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Income', path: '/income' },
    { name: 'Expenses', path: '/expenses' },
    { name: 'Debt Sniper', path: '/debt' },
    { name: 'Savings', path: '/savings' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100vh', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px', padding: '0 20px' }}>
         <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           VANTAGE: V3
         </h1>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? 'white' : '#64748b',
              backgroundColor: isActive ? '#2563eb' : 'transparent',
              transition: 'all 0.3s'
            })}
          >
            {item.name.toUpperCase()}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
         <button onClick={logout} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
           SESSION TERMINATE
         </button>
      </div>
    </div>
  );
};
export default Sidebar;
