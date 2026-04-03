import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('test1234');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Vantage Access</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && <div style={{ color: 'red', fontSize: '12px' }}>{error}</div>}
        <input 
          type="email" required placeholder="Identity Profile"
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db' }}
        />
        <input 
          type="password" required placeholder="Access Cipher"
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db' }}
        />
        <button type="submit" style={{ padding: '15px', borderRadius: '12px', backgroundColor: '#111827', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          Initialize Secure Link
        </button>
      </form>
    </div>
  );
};
export default Login;
