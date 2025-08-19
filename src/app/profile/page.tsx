'use client';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ClockInOut from '@/components/careworker/ClockInOut';
import Login from '@/components/auth/Login';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <MainLayout>
      <ClockInOut />
    </MainLayout>
  );
}