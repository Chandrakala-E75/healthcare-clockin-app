'use client';
import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, Alert, Space, Typography, Row, Col, Divider, Tag, message } from 'antd';
import { EnvironmentOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const { Title, Text } = Typography;

// GraphQL Queries and Mutations (unchanged)
const GET_WORKPLACE_SETTINGS = gql`
  query GetWorkplaceSettings {
    workplaceSettings {
      id
      name
      latitude
      longitude
      address
      radius
    }
  }
`;

const UPDATE_WORKPLACE_SETTINGS = gql`
  mutation UpdateWorkplaceSettings(
    $name: String
    $latitude: Float
    $longitude: Float
    $address: String
    $radius: Int
  ) {
    updateWorkplaceSettings(
      name: $name
      latitude: $latitude
      longitude: $longitude
      address: $address
      radius: $radius
    ) {
      id
      name
      latitude
      longitude
      address
      radius
    }
  }
`;

interface LocationSettings {
  latitude: number;
  longitude: number;
  radius: number;
  address: string;
  name: string;
}

export default function LocationManagement() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // GraphQL hooks (unchanged)
  const { data: workplaceData, loading: queryLoading, refetch } = useQuery(GET_WORKPLACE_SETTINGS);
  const [updateWorkplaceSettings, { loading: updateLoading }] = useMutation(UPDATE_WORKPLACE_SETTINGS);

  const workplaceSettings = workplaceData?.workplaceSettings;

  useEffect(() => {
    if (workplaceSettings) {
      form.setFieldsValue({
        name: workplaceSettings.name,
        latitude: workplaceSettings.latitude,
        longitude: workplaceSettings.longitude,
        radius: workplaceSettings.radius / 1000, // Convert to km for display
        address: workplaceSettings.address
      });
    }

    // Get manager's current location for reference (unchanged)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Could not get location:', error);
        }
      );
    }
  }, [form, workplaceSettings]);

  const handleSave = async (values: any) => {
    try {
      await updateWorkplaceSettings({
        variables: {
          name: values.name,
          latitude: values.latitude,
          longitude: values.longitude,
          radius: values.radius * 1000, // Convert km to meters
          address: values.address
        }
      });

      message.success('Location settings saved successfully!');
      setIsEditing(false);
      refetch(); // Refresh the data
      
    } catch (error) {
      console.error('Error saving location settings:', error);
      message.error('Failed to save location settings');
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      form.setFieldsValue({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      });
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lng2 - lng1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distanceFromWorkplace = currentLocation && workplaceSettings ? 
    calculateDistance(
      currentLocation.lat, 
      currentLocation.lng, 
      workplaceSettings.latitude, 
      workplaceSettings.longitude
    ) : null;

  if (queryLoading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: isMobile ? '20px' : '50px' 
      }}>
        Loading workplace settings...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Title 
        level={3} 
        style={{ 
          fontSize: isMobile ? '18px' : '24px',
          marginBottom: isMobile ? '16px' : '24px'
        }}
      >
        <EnvironmentOutlined /> Location & Perimeter Management
      </Title>

      <Row gutter={[16, 16]}>
        {/* Current Settings Display */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                Current Workplace Settings
              </span>
            }
            extra={
              <Button 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(!isEditing)}
                type={isEditing ? "default" : "primary"}
                size={isMobile ? 'middle' : 'large'}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            }
            size={isMobile ? 'small' : 'default'}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
              <div>
                <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
                  Facility Name:
                </Text>
                <br />
                <Text style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  {workplaceSettings?.name || 'Loading...'}
                </Text>
              </div>

              <div>
                <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
                  Address:
                </Text>
                <br />
                <Text style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  {workplaceSettings?.address || 'Loading...'}
                </Text>
              </div>
              
              <Divider style={{ margin: isMobile ? '8px 0' : '16px 0' }} />
              
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12}>
                  <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
                    Latitude:
                  </Text>
                  <br />
                  <Text code style={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {workplaceSettings?.latitude || 0}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
                    Longitude:
                  </Text>
                  <br />
                  <Text code style={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {workplaceSettings?.longitude || 0}
                  </Text>
                </Col>
              </Row>
              
              <Divider style={{ margin: isMobile ? '8px 0' : '16px 0' }} />
              
              <div>
                <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
                  Clock-in Radius:
                </Text>
                <br />
                <Tag 
                  color="blue" 
                  style={{ 
                    fontSize: isMobile ? '12px' : '14px', 
                    padding: isMobile ? '2px 6px' : '4px 8px',
                    marginTop: '4px'
                  }}
                >
                  {workplaceSettings?.radius ? (workplaceSettings.radius / 1000) : 0} km
                </Tag>
              </div>

              {currentLocation && workplaceSettings && (
                <>
                  <Divider style={{ margin: isMobile ? '8px 0' : '16px 0' }} />
                  <Alert
                    message={`Your current distance from workplace: ${distanceFromWorkplace?.toFixed(2)} km`}
                    type={distanceFromWorkplace && distanceFromWorkplace <= (workplaceSettings.radius / 1000) ? "success" : "info"}
                    showIcon
                    style={{ fontSize: isMobile ? '12px' : '14px' }}
                  />
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col xs={24} lg={12}>
          {isEditing && (
            <Card 
              title={
                <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  Update Workplace Location
                </span>
              }
              size={isMobile ? 'small' : 'default'}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                size={isMobile ? 'middle' : 'large'}
              >
                <Form.Item
                  label={<span style={{ fontSize: isMobile ? '13px' : '14px' }}>Facility Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Please enter the facility name' }]}
                >
                  <Input 
                    placeholder="Healthcare Facility" 
                    style={{ fontSize: isMobile ? '14px' : '16px' }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontSize: isMobile ? '13px' : '14px' }}>Workplace Address</span>}
                  name="address"
                  rules={[{ required: true, message: 'Please enter the workplace address' }]}
                >
                  <Input.TextArea 
                    rows={isMobile ? 2 : 3} 
                    placeholder="Enter the full address of your healthcare facility"
                    style={{ fontSize: isMobile ? '14px' : '16px' }}
                  />
                </Form.Item>

                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: isMobile ? '13px' : '14px' }}>Latitude</span>}
                      name="latitude"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: -90, max: 90, message: 'Invalid latitude' }
                      ]}
                    >
                      <InputNumber
                        style={{ 
                          width: '100%',
                          fontSize: isMobile ? '14px' : '16px'
                        }}
                        precision={6}
                        placeholder="12.971600"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: isMobile ? '13px' : '14px' }}>Longitude</span>}
                      name="longitude"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: -180, max: 180, message: 'Invalid longitude' }
                      ]}
                    >
                      <InputNumber
                        style={{ 
                          width: '100%',
                          fontSize: isMobile ? '14px' : '16px'
                        }}
                        precision={6}
                        placeholder="77.594600"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={<span style={{ fontSize: isMobile ? '13px' : '14px' }}>Clock-in Radius (km)</span>}
                  name="radius"
                  rules={[
                    { required: true, message: 'Please set the radius' },
                    { type: 'number', min: 0.1, max: 10, message: 'Radius must be between 0.1 and 10 km' }
                  ]}
                >
                  <InputNumber
                    style={{ 
                      width: '100%',
                      fontSize: isMobile ? '14px' : '16px'
                    }}
                    precision={1}
                    min={0.1}
                    max={10}
                    step={0.1}
                    addonAfter="km"
                  />
                </Form.Item>

                <Space 
                  style={{ width: '100%' }} 
                  direction="vertical"
                  size={isMobile ? 'small' : 'middle'}
                >
                  {currentLocation && (
                    <Button 
                      type="dashed" 
                      block 
                      onClick={handleUseCurrentLocation}
                      icon={<EnvironmentOutlined />}
                      size={isMobile ? 'middle' : 'large'}
                      style={{ fontSize: isMobile ? '14px' : '16px' }}
                    >
                      Use My Current Location
                    </Button>
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateLoading}
                    block
                    size={isMobile ? 'middle' : 'large'}
                    icon={<SaveOutlined />}
                    style={{ fontSize: isMobile ? '14px' : '16px' }}
                  >
                    Save Location Settings
                  </Button>
                </Space>
              </Form>
            </Card>
          )}

          {!isEditing && (
            <Card 
              title={
                <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  Instructions
                </span>
              }
              size={isMobile ? 'small' : 'default'}
            >
              <Space direction="vertical" size={isMobile ? 'small' : 'middle'}>
                <Alert
                  message="Location Perimeter Setup"
                  description="Set the workplace coordinates and radius within which care workers can clock in. The recommended radius is 2km to account for the facility size and nearby areas."
                  type="info"
                  showIcon
                  style={{ fontSize: isMobile ? '12px' : '14px' }}
                />
                
                <div>
                  <Title 
                    level={5} 
                    style={{ fontSize: isMobile ? '14px' : '16px' }}
                  >
                    How to get coordinates:
                  </Title>
                  <ol style={{ 
                    paddingLeft: 20,
                    fontSize: isMobile ? '13px' : '14px'
                  }}>
                    <li>Open Google Maps</li>
                    <li>Right-click on your facility location</li>
                    <li>Copy the coordinates (first number is latitude, second is longitude)</li>
                    <li>Or use the "Use My Current Location" button if you're at the facility</li>
                  </ol>
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
