'use client';
import { useAuth } from '@/contexts/AuthContext';
import ManagerDashboard from '@/components/manager/ManagerDashboard';
import Login from '@/components/auth/Login';
import { Spin, Alert } from 'antd';

export default function ManagerPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    // Not logged in → show login form
    return <Login />;
  }

  if (user.role !== 'manager') {
    // Logged in but not a manager → block access
    return (
      <div style={{ margin: '50px auto', maxWidth: '600px' }}>
        
      </div>
    );
  }

  // Manager role → show dashboard content only (global MainLayout wraps it)
  return <ManagerDashboard />;
}
