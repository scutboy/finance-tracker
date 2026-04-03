import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log("[Auth] Init triggered, token detected:", !!token);
      if (token) {
        try {
          const res = await api.get('/auth/me');
          console.log("[Auth] User profile retrieved:", res.data?.email || "Unknown");
          setUser(res.data);
        } catch (error) {
          console.error("[Auth] Initialization failure:", error.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
      console.log("[Auth] Initialization complete, rendering children");
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    localStorage.setItem('token', res.data.access_token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen bg-vantage-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-vantage-blue border-t-transparent"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
