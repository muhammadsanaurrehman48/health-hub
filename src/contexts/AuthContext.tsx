import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types/roles';

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
    // Simulated login - will be replaced with actual API call
    const mockUser: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      role,
    };
    setUser(mockUser);
    localStorage.setItem('hms_user', JSON.stringify(mockUser));
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    // Simulated signup - will be replaced with actual API call
    const mockUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
    };
    setUser(mockUser);
    localStorage.setItem('hms_user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('hms_user');
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
