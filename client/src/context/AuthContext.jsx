import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pharmaez_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveUser = (userData, token) => {
    localStorage.setItem('pharmaez_token', token);
    localStorage.setItem('pharmaez_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      saveUser(res.data.user, res.data.token);
      toast.success('Registration successful! Welcome to PharmaEZ 🎉');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      saveUser(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pharmaez_token');
    localStorage.removeItem('pharmaez_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/profile');
      const updated = { ...user, ...res.data.user };
      localStorage.setItem('pharmaez_user', JSON.stringify(updated));
      setUser(updated);
    } catch {}
  }, []);

  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refreshProfile, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
