'use client'

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Card, Statistic, Table, Tabs, Alert, Spin, Row, Col } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { GET_ALL_CLOCK_RECORDS } from '../../graphql/operations';
import LocationManagement from './LocationManagement';

const { TabPane } = Tabs;

interface ClockRecord {
  id: string;
  userId: string;
  clockInTime: string;
  clockOutTime?: string;
  clockInLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  clockOutLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  clockInNote?: string;
  clockOutNote?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Only fetch records with proper caching
  const { data: recordsData, loading: recordsLoading, error: recordsError } = useQuery(GET_ALL_CLOCK_RECORDS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first', // Use cache first to prevent infinite queries
    notifyOnNetworkStatusChange: false // Prevent unnecessary re-renders
  });

  // Memoize records to prevent re-renders
  const records = useMemo(() => recordsData?.allClockRecords || [], [recordsData]);
  
  // Memoize statistics
  const statistics = useMemo(() => {
    const currentlyWorking = records.filter(r => r.clockInTime && !r.clockOutTime).length;
    
    const completedShifts = records.filter(r => r.clockInTime && r.clockOutTime);
    const totalHours = completedShifts.reduce((sum, record) => {
      if (record.clockOutTime) {
        const clockIn = new Date(record.clockInTime);
        const clockOut = new Date(record.clockOutTime);
        return sum + (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    const avgHours = completedShifts.length > 0 ? totalHours / completedShifts.length : 0;
    
    const today = new Date().toDateString();
    const todayClockins = records.filter(r => 
      new Date(r.clockInTime).toDateString() === today
    ).length;

    return {
      currentlyWorking,
      avgHours: avgHours.toFixed(1),
      todayClockins,
      totalHours: totalHours.toFixed(1)
    };
  }, [records]);

  // Memoize chart data
  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = records.filter(r => 
        r.clockInTime && new Date(r.clockInTime).toISOString().split('T')[0] === dateStr
      );
      
      const clockIns = dayRecords.length;
      const totalHours = dayRecords.reduce((sum, record) => {
        if (record.clockOutTime) {
          const clockIn = new Date(record.clockInTime);
          const clockOut = new Date(record.clockOutTime);
          return sum + (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        clockIns,
        hours: Math.round(totalHours * 10) / 10
      });
    }
    return last7Days;
  }, [records]);

  // Memoize table data - FIXED VERSION
  const tableData = useMemo(() => {
    const currentlyWorking = records
      .filter(r => r.clockInTime && !r.clockOutTime)
      .map((record, index) => ({
        key: record.id,
        staff: record.user?.name || record.user?.email || `Staff ${index + 1}`,
        userId: record.user?.email || record.userId, // Show email instead of internal ID
        clockInTime: new Date(record.clockInTime).toLocaleString(),
        location: record.clockInLocation?.address || 'Location not available',
        notes: record.clockInNote || '-' // Show clockIn notes for currently working
      }));

    const recentActivity = records
      .filter(r => r.clockInTime)
      .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
      .slice(0, 10)
      .map((record, index) => ({
        key: record.id,
        staff: record.user?.name || record.user?.email || `Staff ${index + 1}`,
        userId: record.user?.email || record.userId, // Show email instead of internal ID
        clockInTime: new Date(record.clockInTime).toLocaleString(),
        clockOutTime: record.clockOutTime ? new Date(record.clockOutTime).toLocaleString() : 'Still working',
        duration: record.clockOutTime 
          ? `${((new Date(record.clockOutTime).getTime() - new Date(record.clockInTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs`
          : 'In progress',
        notes: record.clockOutTime 
          ? (record.clockOutNote || record.clockInNote || '-') // Show clockOut note if available, otherwise clockIn note
          : (record.clockInNote || '-') // For active shifts, show clockIn note
      }));

    return { currentlyWorking, recentActivity };
  }, [records]);

  console.log('📊 ManagerDashboard render - Records:', records.length);

  if (recordsError) {
    return (
      <div style={{ padding: '16px' }}>
        <Alert
          message="GraphQL Error"
          description={recordsError.message}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (recordsLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Loading dashboard...</p>
      </div>
    );
  }

  // Mobile-optimized table columns
  const currentlyWorkingColumns = [
    { 
      title: 'Staff', 
      dataIndex: 'staff', 
      key: 'staff',
      width: '120px',
      ellipsis: true
    },
    { 
      title: 'Email', 
      dataIndex: 'userId', 
      key: 'userId',
      responsive: ['md'] as any, // Hide on mobile
      ellipsis: true
    },
    { 
      title: 'Clock In', 
      dataIndex: 'clockInTime', 
      key: 'clockInTime',
      width: '140px',
      ellipsis: true
    },
    { 
      title: 'Location', 
      dataIndex: 'location', 
      key: 'location',
      responsive: ['lg'] as any, // Hide on mobile and tablet
      ellipsis: true
    },
    { 
      title: 'Notes', 
      dataIndex: 'notes', 
      key: 'notes',
      width: '100px',
      ellipsis: true
    }
  ];

  const recentActivityColumns = [
    { 
      title: 'Staff', 
      dataIndex: 'staff', 
      key: 'staff',
      width: '100px',
      ellipsis: true
    },
    { 
      title: 'Email', 
      dataIndex: 'userId', 
      key: 'userId',
      responsive: ['md'] as any, // Hide on mobile
      ellipsis: true
    },
    { 
      title: 'Clock In', 
      dataIndex: 'clockInTime', 
      key: 'clockInTime',
      width: '130px',
      ellipsis: true
    },
    { 
      title: 'Clock Out', 
      dataIndex: 'clockOutTime', 
      key: 'clockOutTime',
      width: '130px',
      ellipsis: true
    },
    { 
      title: 'Duration', 
      dataIndex: 'duration', 
      key: 'duration',
      width: '80px'
    },
    { 
      title: 'Notes', 
      dataIndex: 'notes', 
      key: 'notes',
      responsive: ['lg'] as any, // Hide on mobile and tablet
      ellipsis: true
    }
  ];

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '16px' 
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '24px',
        fontSize: '28px'
      }}>
        📊 Manager Dashboard
      </h1>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ marginBottom: '16px' }}
        tabBarStyle={{ marginBottom: '20px' }}
      >
        <TabPane tab="📈 Overview" key="overview">
          {/* Mobile-Responsive Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Currently Working"
                  value={statistics.currentlyWorking}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Avg Hours/Day"
                  value={statistics.avgHours}
                  suffix="hrs"
                  prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Today's Clock-ins"
                  value={statistics.todayClockins}
                  prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Total Hours (Week)"
                  value={statistics.totalHours}
                  suffix="hrs"
                  prefix={<UserOutlined style={{ color: '#f5222d' }} />}
                  valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Mobile-Responsive Charts - Stack on mobile */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} lg={12}>
              <Card title="📈 Daily Clock-ins (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="clockIns" 
                      stroke="#1890ff" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="📊 Daily Hours (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Mobile-Responsive Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card 
                title={`👥 Currently Working (${tableData.currentlyWorking.length})`}
                style={{ marginBottom: '16px' }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    columns={currentlyWorkingColumns}
                    dataSource={tableData.currentlyWorking}
                    pagination={false}
                    size="small"
                    scroll={{ x: 600 }}
                    locale={{ emptyText: 'No staff currently working' }}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="📝 Recent Activity">
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    columns={recentActivityColumns}
                    dataSource={tableData.recentActivity}
                    pagination={{ 
                      pageSize: 5,
                      showSizeChanger: false,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} records`
                    }}
                    size="small"
                    scroll={{ x: 700 }}
                    locale={{ emptyText: 'No recent activity' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="📍 Location" key="location">
          <LocationManagement />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;