import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('fh_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      localStorage.removeItem('fh_token');
      localStorage.removeItem('fh_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('fh_token', data.token);
    localStorage.setItem('fh_user', JSON.stringify(data.user));
    setUser(data.user);
    await loadUser();
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('fh_token', data.token);
    localStorage.setItem('fh_user', JSON.stringify(data.user));
    setUser(data.user);
    await loadUser();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    setUser(null);
    setProfile(null);
  };

  const updateUserData = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    localStorage.setItem('fh_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const updateProfile = (updatedProfile) => setProfile(prev => ({ ...prev, ...updatedProfile }));

  const isAuthenticated = !!user;
  const isFreelancer = user?.role === 'freelancer';
  const isEmployer = user?.role === 'employer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthenticated, isFreelancer, isEmployer, isAdmin, login, register, logout, updateUserData, updateProfile, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
