// src/components/careworker/ClockInOut.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Alert, Spin, notification, Row, Col, Typography, Statistic } from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  GET_WORKPLACE_SETTINGS,
  GET_MY_CLOCK_RECORDS,
  CLOCK_IN,
  CLOCK_OUT,
  CREATE_OR_UPDATE_USER,
} from '@/graphql/operations';
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  StopOutlined,
  HomeOutlined,
  RadiusSettingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ClockRecord {
  id: string;
  clockInTime: string;
  clockOutTime?: string;
  isActive: boolean;
  clockInLocation: any;
  clockInNote?: string;
}

export default function ClockInOut() {
  const { user: auth0User, isLoading: authLoading } = useUser();
  const [location, setLocation] = useState<Location | null>(null);
  const [note, setNote] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // GraphQL queries and mutations
  const { data: workplaceData, loading: workplaceLoading } = useQuery(GET_WORKPLACE_SETTINGS);
  const { data: clockRecordsData, loading: recordsLoading, refetch: refetchRecords } = useQuery(GET_MY_CLOCK_RECORDS);
  
  const [createOrUpdateUser] = useMutation(CREATE_OR_UPDATE_USER);
  const [clockInMutation] = useMutation(CLOCK_IN);
  const [clockOutMutation] = useMutation(CLOCK_OUT);

  // Get current active clock record
  const activeRecord: ClockRecord | null = clockRecordsData?.myClockRecords?.find(
    (record: ClockRecord) => record.isActive
  ) || null;

  // Ensure user exists in database
  useEffect(() => {
    if (auth0User && !authLoading) {
      createOrUpdateUser({
        variables: {
          email: auth0User.email!,
          name: auth0User.name,
          picture: auth0User.picture,
          auth0Id: auth0User.sub,
          role: 'careworker',
        },
      }).catch((error) => {
        console.error('Error creating/updating user:', error);
      });
    }
  }, [auth0User, authLoading, createOrUpdateUser]);

  // Get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          setLocation({ 
            latitude, 
            longitude, 
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          });
        } catch (error) {
          setLocation({ 
            latitude, 
            longitude, 
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          });
        }
        setGettingLocation(false);
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Check if user is within workplace perimeter
  const isWithinPerimeter = (userLat: number, userLng: number): boolean => {
    if (!workplaceData?.workplaceSettings) return false;

    const { latitude: workLat, longitude: workLng, radius } = workplaceData.workplaceSettings;

    const R = 6371000; // Earth's radius in meters
    const dLat = ((workLat - userLat) * Math.PI) / 180;
    const dLng = ((workLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((workLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radius;
  };

  const getDistanceFromWorkplace = (userLat: number, userLng: number): number => {
    if (!workplaceData?.workplaceSettings) return 0;

    const { latitude: workLat, longitude: workLng } = workplaceData.workplaceSettings;

    const R = 6371000; // Earth's radius in meters
    const dLat = ((workLat - userLat) * Math.PI) / 180;
    const dLng = ((workLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((workLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleClockIn = async () => {
    if (!location) {
      notification.error({
        message: 'Location Required',
        description: 'Please get your current location first.',
      });
      return;
    }

    if (!isWithinPerimeter(location.latitude, location.longitude)) {
      notification.error({
        message: 'Outside Workplace Perimeter',
        description: 'You must be within the workplace perimeter to clock in.',
      });
      return;
    }
    
    try {
      const result = await clockInMutation({
        variables: {
          note: note || null,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
      });

      notification.success({
        message: 'Clocked In Successfully',
        description: 'You have successfully clocked in for your shift.',
      });

      setNote('');
      refetchRecords();
    } catch (error: any) {
      notification.error({
        message: 'Clock In Failed',
        description: error.message || 'Failed to clock in. Please try again.',
      });
    }
  };

  const handleClockOut = async () => {
    if (!activeRecord || !location) {
      notification.error({
        message: 'Invalid Clock Out',
        description: 'Unable to clock out. Please check your status.',
      });
      return;
    }

    try {
      await clockOutMutation({
        variables: {
          clockRecordId: activeRecord.id,
          note: note || null,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
      });

      notification.success({
        message: 'Clocked Out Successfully',
        description: 'You have successfully clocked out of your shift.',
      });

      setNote('');
      refetchRecords();
    } catch (error: any) {
      notification.error({
        message: 'Clock Out Failed',
        description: error.message || 'Failed to clock out. Please try again.',
      });
    }
  };

  if (authLoading || workplaceLoading || recordsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Loading...</p>
      </div>
    );
  }

  const workplace = workplaceData?.workplaceSettings;
  const distance = location ? getDistanceFromWorkplace(location.latitude, location.longitude) : null;
  const withinPerimeter = location ? isWithinPerimeter(location.latitude, location.longitude) : false;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '16px' 
    }}>
      <Title level={2} style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        fontSize: '28px'
      }}>
        Clock In/Out
      </Title>

      {/* Workplace Information Card */}
      {workplace && (
        <Card 
          style={{ marginBottom: '24px' }}
          title={<Text strong><HomeOutlined style={{ color: '#1890ff' }} /> Workplace Information</Text>}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="Workplace"
                value={workplace.name}
                valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}
                prefix={<HomeOutlined style={{ color: '#1890ff' }} />}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Perimeter Radius"
                value={workplace.radius}
                suffix="meters"
                valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}
                prefix={<RadiusSettingOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={24}>
              <Text type="secondary">
                <EnvironmentOutlined style={{ color: '#faad14' }} /> {workplace.address}
              </Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* Location Status Card */}
      <Card 
        style={{ marginBottom: '24px' }}
        title={<Text strong><EnvironmentOutlined style={{ color: '#faad14' }} /> Location Status</Text>}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Button
              type="primary"
              loading={gettingLocation}
              onClick={getCurrentLocation}
              block
              size="large"
              icon={<EnvironmentOutlined />}
              style={{ height: '50px', fontSize: '16px' }}
            >
              {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
            </Button>
          </Col>
          <Col xs={24} md={12}>
            {location && (
              <div style={{ 
                padding: '16px', 
                backgroundColor: withinPerimeter ? '#f6ffed' : '#fff2f0',
                borderRadius: '8px',
                border: `1px solid ${withinPerimeter ? '#b7eb8f' : '#ffccc7'}`
              }}>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Text strong style={{ color: withinPerimeter ? '#52c41a' : '#ff4d4f' }}>
                      {withinPerimeter ? 'Within Perimeter' : 'Outside Perimeter'}
                    </Text>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Location: {location.address}
                    </Text>
                  </Col>
                  {distance !== null && (
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Distance: {Math.round(distance)}m from workplace
                      </Text>
                    </Col>
                  )}
                </Row>
              </div>
            )}
          </Col>
        </Row>

        {/* Status Alerts */}
        {locationError && (
          <Alert
            message="Location Error"
            description={locationError}
            type="error"
            style={{ marginTop: '16px' }}
            showIcon
          />
        )}

        {location && !withinPerimeter && (
          <Alert
            message="Outside Workplace Perimeter"
            description="You must be within the workplace perimeter to clock in."
            type="warning"
            style={{ marginTop: '16px' }}
            showIcon
          />
        )}

        {location && withinPerimeter && (
          <Alert
            message="Within Workplace Perimeter"
            description="You can clock in/out from this location."
            type="success"
            style={{ marginTop: '16px' }}
            showIcon
          />
        )}
      </Card>

      {/* Current Status Card */}
      <Card 
        style={{ marginBottom: '24px' }}
        title={<Text strong><ClockCircleOutlined style={{ color: '#722ed1' }} /> Current Status</Text>}
      >
        {activeRecord ? (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#e6f7ff',
            borderRadius: '8px',
            border: '1px solid #91d5ff'
          }}>
            <Row gutter={[16, 8]} align="middle">
              <Col xs={24} md={12}>
                <Statistic
                  title="Status"
                  value="Currently Clocked In"
                  valueStyle={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#1890ff' 
                  }}
                  prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic
                  title="Since"
                  value={new Date(activeRecord.clockInTime).toLocaleString()}
                  valueStyle={{ fontSize: '14px', color: '#595959' }}
                  prefix={<ClockCircleOutlined style={{ color: '#595959' }} />}
                />
              </Col>
              {activeRecord.clockInNote && (
                <Col span={24}>
                  <div style={{ 
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9'
                  }}>
                    <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>
                      Clock In Note:
                    </Text>
                    <br />
                    <Text style={{ fontSize: '14px' }}>{activeRecord.clockInNote}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        ) : (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}>
            <Statistic
              title="Status"
              value="Currently Clocked Out"
              valueStyle={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#8c8c8c' 
              }}
              prefix={<StopOutlined style={{ color: '#8c8c8c' }} />}
            />
            <Text type="secondary" style={{ fontSize: '14px' }}>
              You are not currently clocked in for any shift.
            </Text>
          </div>
        )}
      </Card>

      {/* Notes Card */}
      <Card 
        style={{ marginBottom: '24px' }}
        title={<Text strong><FileTextOutlined style={{ color: '#faad14' }} /> Add Note (Optional)</Text>}
      >
        <TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any notes about your shift..."
          rows={4}
          maxLength={500}
          showCount
          style={{ fontSize: '16px' }}
        />
      </Card>

      {/* Action Buttons Card */}
      <Card title={<Text strong>Actions</Text>}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Button
              type="primary"
              size="large"
              block
              disabled={!location || !withinPerimeter || !!activeRecord}
              onClick={handleClockIn}
              icon={<CheckCircleOutlined />}
              style={{ 
                height: '60px', 
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              Clock In
            </Button>
            {(!location || !withinPerimeter || !!activeRecord) && (
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px', textAlign: 'center' }}>
                {!location && "Get location first"}
                {location && !withinPerimeter && "Move within perimeter"}
                {activeRecord && "Already clocked in"}
              </Text>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Button
              type="default"
              size="large"
              block
              disabled={!location || !activeRecord}
              onClick={handleClockOut}
              icon={<StopOutlined />}
              style={{ 
                height: '60px', 
                fontSize: '18px',
                fontWeight: 'bold',
                borderColor: '#ff4d4f',
                color: '#ff4d4f'
              }}
            >
              Clock Out
            </Button>
            {(!location || !activeRecord) && (
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px', textAlign: 'center' }}>
                {!location && "Get location first"}
                {location && !activeRecord && "Not clocked in"}
              </Text>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
}