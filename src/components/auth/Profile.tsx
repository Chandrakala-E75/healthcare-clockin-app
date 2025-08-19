'use client';
import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Row, Col, Typography, Tag, Space, Divider, message } from 'antd';
import { UserOutlined, SaveOutlined, EditOutlined, SafetyOutlined } from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';

const { Title, Text } = Typography;

export default function Profile() {
  const { user, updateProfile } = useUser();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = async (values: any) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      updateProfile({
        name: values.name,
        email: values.email,
        department: values.department
      });
      setIsEditing(false);
      setLoading(false);
      message.success('Profile updated successfully!');
    }, 1000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      department: user.department
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>
        <UserOutlined /> User Profile
      </Title>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                src={user.picture} 
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Title level={4}>{user.name}</Title>
              <Space direction="vertical">
                <Tag 
                  color={user.role === 'manager' ? 'gold' : 'blue'} 
                  icon={user.role === 'manager' ? <SafetyOutlined /> : <UserOutlined />}
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  {user.role === 'manager' ? 'Manager' : 'Care Worker'}
                </Tag>
                <Text type="secondary">{user.email}</Text>
              </Space>
            </div>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Employee ID:</Text>
                <br />
                <Text code>{user.employeeId}</Text>
              </div>
              <div>
                <Text strong>Department:</Text>
                <br />
                <Text>{user.department}</Text>
              </div>
              <div>
                <Text strong>Role:</Text>
                <br />
                <Text>{user.role === 'manager' ? 'Manager' : 'Care Worker'}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card 
            title="Profile Information"
            extra={
              !isEditing && (
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  Edit Profile
                </Button>
              )
            }
          >
            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  label="Department"
                  name="department"
                  rules={[{ required: true, message: 'Please enter your department' }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Full Name</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user.name}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Employee ID</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user.employeeId}</Text>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Email Address</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user.email}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Department</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user.department}</Text>
                    </div>
                  </Col>
                </Row>

                <div>
                  <Text strong>Account Type</Text>
                  <br />
                  <Tag 
                    color={user.role === 'manager' ? 'gold' : 'blue'}
                    style={{ fontSize: '14px', padding: '6px 12px', marginTop: 4 }}
                  >
                    {user.role === 'manager' ? 'Manager Account' : 'Care Worker Account'}
                  </Tag>
                </div>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}