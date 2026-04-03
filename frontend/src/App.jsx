import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Core Pages (Standardized v3.1)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Debt from './pages/Debt';
import Savings from './pages/Savings';
import Budget from './pages/Budget';
import Settings from './pages/Settings';

// Placeholder or Advanced Modules (Linked in Sidebar)
const DebtAdvisor = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-scale-in">
    <div className="p-10 bg-slate-950 text-white rounded-[3rem] shadow-2xl shadow-blue-500/20"><span className="text-4xl font-black italic uppercase italic">A-Node</span></div>
    <h1 className="text-5xl font-black text-slate-950 uppercase italic tracking-tighter">Debt Advisor Locked</h1>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Vantage AI Advisory Cluster Initializing...</p>
  </div>
);

const queryClient = new QueryClient();

function App() {
  console.log("[App] Vantage v3.1 Logic Restoration Sequence...");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/debt" element={<Debt />} />
              <Route path="/debt-advisor" element={<DebtAdvisor />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
