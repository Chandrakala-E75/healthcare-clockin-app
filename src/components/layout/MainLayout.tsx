'use client';

import React from 'react';
import { Layout, Button, Avatar, Dropdown, Tag, Typography } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  CrownOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { user, switchRole, isLoading } = useAuth();
  const role = user?.role || 'careworker';

  const userMenuItems = [
    {
      key: 'switch-role',
      icon: <CrownOutlined />,
      label: `Switch to ${role === 'manager' ? 'Care Worker' : 'Manager'}`,
      onClick: () => {
        const newRole = role === 'manager' ? 'careworker' : 'manager';
        switchRole(newRole);
        if (newRole === 'manager') {
          router.push('/manager');
        } else {
          router.push('/careworker');
        }
      },
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Link href="/api/auth/logout">Logout</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 'clamp(12px, 3vw, 24px)',
          height: 'auto',
          minHeight: '64px',
          padding: '8px clamp(12px, 3vw, 24px)'
        }}
      >
        <div style={{ 
          color: 'white', 
          fontSize: 'clamp(14px, 4vw, 18px)', 
          fontWeight: 600,
          lineHeight: '1.2'
        }}>
          Healthcare Clock-In
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'clamp(8px, 2vw, 12px)',
          flexShrink: 0
        }}>
          {!isLoading && (
            <>
              {user && (
                <Tag
                  color={role === 'manager' ? 'gold' : 'blue'}
                  style={{ 
                    margin: 0,
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    padding: '2px 6px',
                    lineHeight: '1.2'
                  }}
                >
                  {role === 'manager' ? 'Manager' : 'Care Worker'}
                </Tag>
              )}

              {user ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <Avatar 
                      src={user.picture} 
                      icon={<UserOutlined />}
                      size={window.innerWidth < 768 ? 32 : 40}
                    />
                    <span style={{ 
                      color: 'white', 
                      marginLeft: 'clamp(4px, 2vw, 8px)',
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      display: window.innerWidth < 480 ? 'none' : 'inline',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.name || user.email}
                    </span>
                  </div>
                </Dropdown>
              ) : (
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  href="/api/auth/login"
                  size={window.innerWidth < 768 ? 'small' : 'middle'}
                  style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    height: 'auto',
                    minHeight: '36px',
                    padding: '6px 12px'
                  }}
                >
                  <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
                    Login
                  </span>
                </Button>
              )}
            </>
          )}
          {isLoading && (
            <Text style={{ 
              color: 'white',
              fontSize: 'clamp(12px, 3vw, 14px)'
            }} type="secondary">
              Checking session…
            </Text>
          )}
        </div>
      </Header>

      <Layout style={{ 
        padding: 'clamp(12px, 3vw, 24px)',
        background: '#f0f2f5'
      }}>
        <Content
          style={{
            padding: 'clamp(16px, 4vw, 24px)',
            margin: 0,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}