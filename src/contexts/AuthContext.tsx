'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();

        // Load saved role if exists, otherwise default to careworker
        const savedRole = localStorage.getItem('userRole') as 'manager' | 'careworker' | null;

        const mappedUser: User = {
          id: data.sub || data.email,
          name: data.name || data.email,
          email: data.email,
          role: savedRole || 'careworker',
          department: '',
          employeeId: ''
        };

        setUser(mappedUser);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching /api/auth/me', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUser();
}, []);


  const login = async () => {
    // Redirects to Auth0 login
    window.location.href = '/api/auth/login';
    return true;
  };

  const logout = () => {
  setUser(null);
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userRole');
  localStorage.clear();
  
  // Force Auth0 logout with proper session clearing
  window.location.replace('/api/auth/logout?returnTo=' + encodeURIComponent(window.location.origin));
};

  const switchRole = (role: 'manager' | 'careworker') => {
  if (user) {
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('userRole', role);  // save role persistently
  }
};


  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
