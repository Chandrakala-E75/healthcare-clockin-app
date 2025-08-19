'use client';

import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

type MeResponse = {
  name?: string;
  email?: string;
  picture?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          // Only redirect if we have valid user data
          if (data && (data.email || data.name)) {
            router.push('/careworker');
          }
        } else {
          // Clear any stale data if API returns non-200
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [router]);

  if (loading) {
    return (
      <div style={{ 
        padding: '24px 16px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{ fontSize: '16px' }}>Loading...</Text>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 16px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 5vw, 32px)',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Welcome to Healthcare Clock-In System
        </h1>
        <p style={{ 
          fontSize: 'clamp(14px, 4vw, 16px)',
          marginBottom: '32px',
          lineHeight: '1.5',
          color: '#666',
          maxWidth: '400px'
        }}>
          Please log in to access your clock-in/out functionality and manage your shifts.
        </p>
        <a href="/api/auth/login">
          <button style={{ 
            padding: '16px 32px', 
            fontSize: 'clamp(14px, 4vw, 16px)',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            minHeight: '50px',
            minWidth: '200px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#40a9ff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
          >
            Login to Continue
          </button>
        </a>
      </div>
    );
  }

  return null;
}