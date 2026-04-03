import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

// PROBE: STRIPPED APP
function App() {
  console.log("[App] Vantage v3 Bypass Probe Active...");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div style={{ padding: '20px', border: '5px solid #2563eb', margin: '20px', borderRadius: '24px' }}>
          <h2 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px' }}>[BYPASS: NO ROUTER]</h2>
          <Dashboard />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
