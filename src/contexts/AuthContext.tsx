'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { User, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: auth0User, error, isLoading: auth0Loading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth0Loading) {
      setIsLoading(true);
      return;
    }

    if (error) {
      console.error('Auth0 error:', error);
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (auth0User) {
      // Load saved role if exists, otherwise default to careworker
      const savedRole = localStorage.getItem('userRole') as 'manager' | 'careworker' | null;

      const mappedUser: User = {
        id: auth0User.sub || auth0User.email || '',
        name: auth0User.name || auth0User.email || '',
        email: auth0User.email || '',
        role: savedRole || 'careworker',
        department: '',
        employeeId: ''
      };

      setUser(mappedUser);
      localStorage.setItem('currentUser', JSON.stringify(mappedUser));
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [auth0User, auth0Loading, error]);

  const login = async () => {
    window.location.href = '/api/auth/login';
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.clear();
    window.location.replace('/api/auth/logout?returnTo=' + encodeURIComponent(window.location.origin));
  };

  const switchRole = (role: 'manager' | 'careworker') => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('userRole', role);
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