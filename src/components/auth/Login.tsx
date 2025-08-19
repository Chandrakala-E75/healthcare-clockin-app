'use client';
import React from 'react';
import { Button, Card, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Login() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Title level={2}>Healthcare Clock-In</Title>
        <Text type="secondary">Sign in to your account</Text>
        <br /><br />
        <Button 
          type="primary" 
          icon={<LoginOutlined />} 
          size="large" 
          block
          href="/api/auth/login"
        >
          Login with Auth0
        </Button>
      </Card>
    </div>
  );
}
