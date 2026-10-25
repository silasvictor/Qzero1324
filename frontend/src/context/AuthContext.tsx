import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateBalanceLocally: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('qzero_token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const savedToken = localStorage.getItem('qzero_token');
    if (!savedToken) {
      // Auto-login with student demo account for seamless first-load demo!
      await switchRole('STUDENT');
      setLoading(false);
      return;
    }

    const res = await authApi.getProfile();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    } else {
      // Fallback demo switch
      await switchRole('STUDENT');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('qzero_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      localStorage.setItem('qzero_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('qzero_token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    const res = await authApi.demoLogin(role);
    if (res.success && res.data) {
      localStorage.setItem('qzero_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    setLoading(false);
  };

  const refreshProfile = async () => {
    const res = await authApi.getProfile();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
  };

  const updateBalanceLocally = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchRole,
        refreshProfile,
        updateBalanceLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
