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

import DebtAdvisor from './pages/DebtAdvisor';

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
