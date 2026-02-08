import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types/roles';
import api from '@/utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      const response = await api.login(email, password, role);
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('hms_user', JSON.stringify(userData));
        localStorage.setItem('hms_token', response.data.token);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const response = await api.signup(name, email, password, role);
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('hms_user', JSON.stringify(userData));
        localStorage.setItem('hms_token', response.data.token);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('hms_user');
    localStorage.removeItem('hms_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
