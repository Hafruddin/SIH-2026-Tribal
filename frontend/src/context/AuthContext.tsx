import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name?: string;
  email: string;
  mobile?: string;
  role: 'STUDENT' | 'ADMIN' | 'student' | 'admin';
  otrId?: string;
  studentProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tribal_scholar_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('tribal_scholar_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify session on mount with /api/auth/me
      axios.get('/api/auth/me')
        .then(res => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('tribal_scholar_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // If token expired or invalid, clear state
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('tribal_scholar_token', newToken);
    localStorage.setItem('tribal_scholar_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tribal_scholar_token');
    localStorage.removeItem('tribal_scholar_user');
    delete axios.defaults.headers.common['Authorization'];
    try {
      axios.post('/api/auth/logout').catch(() => {});
    } catch (e) {}
  };

  const roleStr = (user?.role || '').toUpperCase();
  const isAdmin = roleStr === 'ADMIN';
  const isStudent = roleStr === 'STUDENT' || roleStr === 'STUDENT_USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isStudent,
        loading,
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
