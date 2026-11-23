import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trendora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = (data) => {
    localStorage.setItem('trendora_token', data.token);
    localStorage.setItem('trendora_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveUser(res.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    saveUser(res.data);
  };

  const updateProfile = async (details) => {
    const res = await api.put('/auth/profile', details);
    saveUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('trendora_token');
    localStorage.removeItem('trendora_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
