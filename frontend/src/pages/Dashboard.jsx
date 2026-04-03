import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: summary, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    retry: 1
  });

  if (isLoading) {
    return <div style={{ padding: '50px', color: '#64748b' }}>[DEBUG] Loading Financial Summary...</div>;
  }

  if (isError) {
    return <div style={{ padding: '50px', color: 'red' }}>[DEBUG] API Error: {error?.message || 'Unknown Failure'}</div>;
  }

  const {
    net_worth = 0, monthly_income = 0, monthly_expenses = 0,
    total_debt = 0, total_saved = 0
  } = summary || {};

  const cardStyle = {
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    flex: '1 1 300px'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic' }}>
          STRATEGIC DATA: <span style={{ color: '#2563eb' }}>{user?.name || 'NODE'}</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Vantage Strategy System v3.1
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>NET WORTH</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>{formatCurrency(net_worth)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>INCOME</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#10b981' }}>{formatCurrency(monthly_income)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>EXPENSES</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#f43f5e' }}>{formatCurrency(monthly_expenses)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>TOTAL DEBT</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#f43f5e' }}>{formatCurrency(total_debt)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>TOTAL SAVINGS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>{formatCurrency(total_saved)}</div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '10px', color: '#cbd5e1' }}>
        HARD_SYNC_ACTIVE // ZERO_LIB_RENDER_PROTOCOL
      </div>
    </div>
  );
};

export default Dashboard;
