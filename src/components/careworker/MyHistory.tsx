// src/components/careworker/MyHistory.tsx - STYLED TO MATCH MANAGER DASHBOARD
import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Space, Tag, Statistic, Row, Col, DatePicker, Button, Empty, Spin } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, HistoryOutlined, FileTextOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { GET_MY_CLOCK_RECORDS, GET_MY_CLOCK_STATS } from '@/graphql/operations';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ClockRecord {
  id: string;
  clockInTime: string;
  clockOutTime?: string;
  duration?: number;
  clockInNote?: string;
  clockOutNote?: string;
  isActive: boolean;
  createdAt: string;
}

const MyHistory: React.FC = () => {
  const { user: auth0User, isLoading: authLoading } = useUser();
  const [filteredRecords, setFilteredRecords] = useState<ClockRecord[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // GraphQL queries
  const { data: recordsData, loading: recordsLoading, refetch: refetchRecords } = useQuery(GET_MY_CLOCK_RECORDS);
  const { data: statsData, loading: statsLoading } = useQuery(GET_MY_CLOCK_STATS);

  const records = recordsData?.myClockRecords || [];
  const stats = statsData?.myClockStats || {
    totalHours: 0,
    completedShifts: 0,
    averageShiftHours: 0,
    activeShifts: 0
  };

  useEffect(() => {
    applyFilters();
  }, [records, dateRange]);

  const applyFilters = () => {
    let filtered = [...records];
    
    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter(record => {
        const recordDate = dayjs(record.clockInTime);
        return recordDate.isAfter(start.startOf('day')) && recordDate.isBefore(end.endOf('day'));
      });
    }
    
    setFilteredRecords(filtered);
  };

  const clearFilters = () => {
    setDateRange(null);
  };

  // Calculate filtered statistics
  const filteredCompletedShifts = filteredRecords.filter(r => !r.isActive && r.duration);
  const filteredTotalMinutes = filteredCompletedShifts.reduce((sum, r) => sum + (r.duration || 0), 0);
  const filteredTotalHours = filteredTotalMinutes / 60;
  const filteredAverageShiftHours = filteredCompletedShifts.length > 0 ? filteredTotalHours / filteredCompletedShifts.length : 0;
  const filteredActiveShifts = filteredRecords.filter(r => r.isActive);

  // Mobile Card Component - Styled to match Manager Dashboard
  const MobileRecordCard = ({ record }: { record: ClockRecord }) => {
    const getDuration = () => {
      if (record.isActive) {
        const now = dayjs();
        const clockIn = dayjs(record.clockInTime);
        const currentDurationHours = now.diff(clockIn, 'hour', true);
        return (
          <Tag color="processing" style={{ fontSize: '12px' }}>
            ⏱️ {Math.floor(currentDurationHours)}h {Math.floor((currentDurationHours % 1) * 60)}m
          </Tag>
        );
      }
      
      if (record.duration) {
        const hours = Math.floor(record.duration / 60);
        const minutes = record.duration % 60;
        return (
          <Tag color="success" style={{ fontSize: '12px' }}>
            ✅ {hours}h {minutes}m
          </Tag>
        );
      }
      
      return <Text type="secondary">-</Text>;
    };

    return (
      <Card 
        size="small" 
        style={{ 
          marginBottom: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: record.isActive ? '2px solid #1890ff' : '1px solid #d9d9d9'
        }}
        hoverable
      >
        <Row justify="space-between" align="top">
          <Col span={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  📅 {dayjs(record.clockInTime).format('MMM DD, YYYY')}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {dayjs(record.clockInTime).format('dddd')}
                </Text>
              </div>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>🟢 Clock In</Text>
                  <br />
                  <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                    {dayjs(record.clockInTime).format('h:mm A')}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>🔴 Clock Out</Text>
                  <br />
                  {record.clockOutTime ? (
                    <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                      {dayjs(record.clockOutTime).format('h:mm A')}
                    </Text>
                  ) : (
                    <Tag color="processing" size="small">🔄 Active</Tag>
                  )}
                </Col>
              </Row>
            </Space>
          </Col>
          
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="small" align="end">
              <div>
                <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>⏰ Duration</Text>
                <br />
                {getDuration()}
              </div>
            </Space>
          </Col>
        </Row>
        
        {(record.clockInNote || record.clockOutNote) && (
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '12px', 
            borderTop: '1px solid #f0f0f0',
            backgroundColor: '#fafafa',
            borderRadius: '4px',
            padding: '8px'
          }}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>📝 Notes</Text>
            {record.clockInNote && (
              <div style={{ marginTop: '4px' }}>
                <Text strong style={{ fontSize: '10px', color: '#52c41a' }}>🟢 Clock In:</Text>
                <br />
                <Text style={{ fontSize: '12px' }}>{record.clockInNote}</Text>
              </div>
            )}
            {record.clockOutNote && (
              <div style={{ marginTop: '4px' }}>
                <Text strong style={{ fontSize: '10px', color: '#ff4d4f' }}>🔴 Clock Out:</Text>
                <br />
                <Text style={{ fontSize: '12px' }}>{record.clockOutNote}</Text>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  // Desktop Table Columns - Enhanced styling
  const columns = [
    {
      title: '📅 Date',
      dataIndex: 'clockInTime',
      key: 'date',
      render: (clockInTime: string) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: '#1890ff' }}>
            {dayjs(clockInTime).format('MMM DD, YYYY')}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(clockInTime).format('dddd')}
          </Text>
        </Space>
      ),
      width: 140,
      responsive: ['sm'] as any,
    },
    {
      title: '🟢 Clock In',
      dataIndex: 'clockInTime',
      key: 'clockIn',
      render: (clockInTime: string) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontWeight: '500' }}>
            {dayjs(clockInTime).format('h:mm A')}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dayjs(clockInTime).format('MMM DD')}
          </Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: '🔴 Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOut',
      render: (clockOutTime: string | undefined, record: ClockRecord) => (
        <Space direction="vertical" size="small">
          {clockOutTime ? (
            <>
              <Text style={{ fontWeight: '500' }}>
                {dayjs(clockOutTime).format('h:mm A')}
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {dayjs(clockOutTime).format('MMM DD')}
              </Text>
            </>
          ) : (
            <Tag color="processing">🔄 Active</Tag>
          )}
        </Space>
      ),
      width: 120,
    },
    {
      title: '⏰ Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number | undefined, record: ClockRecord) => {
        if (record.isActive) {
          const now = dayjs();
          const clockIn = dayjs(record.clockInTime);
          const currentDurationHours = now.diff(clockIn, 'hour', true);
          return (
            <Tag color="processing" style={{ fontWeight: 'bold' }}>
              ⏱️ {Math.floor(currentDurationHours)}h {Math.floor((currentDurationHours % 1) * 60)}m
            </Tag>
          );
        }
        
        if (duration) {
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          return (
            <Tag color="success" style={{ fontWeight: 'bold' }}>
              ✅ {hours}h {minutes}m
            </Tag>
          );
        }
        
        return <Text type="secondary">-</Text>;
      },
      width: 120,
    },
    {
      title: '📝 Notes',
      key: 'notes',
      render: (record: ClockRecord) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {record.clockInNote && (
            <div style={{ 
              padding: '4px 8px', 
              backgroundColor: '#f6ffed', 
              borderRadius: '4px',
              border: '1px solid #b7eb8f'
            }}>
              <Text strong style={{ fontSize: '11px', color: '#52c41a' }}>🟢 Clock In:</Text>
              <br />
              <Text style={{ fontSize: '12px' }}>{record.clockInNote}</Text>
            </div>
          )}
          {record.clockOutNote && (
            <div style={{ 
              padding: '4px 8px', 
              backgroundColor: '#fff2f0', 
              borderRadius: '4px',
              border: '1px solid #ffccc7'
            }}>
              <Text strong style={{ fontSize: '11px', color: '#ff4d4f' }}>🔴 Clock Out:</Text>
              <br />
              <Text style={{ fontSize: '12px' }}>{record.clockOutNote}</Text>
            </div>
          )}
          {!record.clockInNote && !record.clockOutNote && (
            <Text type="secondary" style={{ fontSize: '12px' }}>No notes</Text>
          )}
        </Space>
      ),
      responsive: ['md'] as any,
    },
  ];

  if (authLoading || recordsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Loading your work history...</p>
      </div>
    );
  }

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
        📊 My Work History
      </Title>

      {/* Statistics Cards - Matching Manager Dashboard Style */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Total Hours"
              value={dateRange ? filteredTotalHours : stats.totalHours}
              precision={1}
              suffix="hrs"
              valueStyle={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#52c41a'
              }}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Completed Shifts"
              value={dateRange ? filteredCompletedShifts.length : stats.completedShifts}
              valueStyle={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1890ff'
              }}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Average Shift"
              value={dateRange ? filteredAverageShiftHours : stats.averageShiftHours}
              precision={1}
              suffix="hrs"
              valueStyle={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#faad14'
              }}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Active Shifts"
              value={dateRange ? filteredActiveShifts.length : stats.activeShifts}
              valueStyle={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: (dateRange ? filteredActiveShifts.length : stats.activeShifts) > 0 ? '#f5222d' : '#8c8c8c'
              }}
              prefix={<HistoryOutlined style={{ 
                color: (dateRange ? filteredActiveShifts.length : stats.activeShifts) > 0 ? '#f5222d' : '#8c8c8c' 
              }} />}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters Card - Enhanced Styling */}
      <Card 
        style={{ marginBottom: '24px' }}
        title={<Text strong><FilterOutlined style={{ color: '#1890ff' }} /> Filters & Actions</Text>}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              placeholder={['Start Date', 'End Date']}
              size="large"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Button 
              onClick={clearFilters}
              size="large"
              block
              icon={<FilterOutlined />}
            >
              Clear
            </Button>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Button 
              onClick={() => refetchRecords()}
              size="large"
              type="primary"
              block
              icon={<ReloadOutlined />}
            >
              Refresh
            </Button>
          </Col>
          <Col xs={24} lg={8}>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '14px',
                textAlign: 'center',
                display: 'block'
              }}
            >
              📈 Showing <Text strong>{filteredRecords.length}</Text> of <Text strong>{records.length}</Text> records
            </Text>
          </Col>
        </Row>
      </Card>

      {/* History Display */}
      <Row>
        <Col xs={24}>
          {filteredRecords.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text style={{ fontSize: '16px' }}>📭 No work history found</Text>
                    <br />
                    <Text type="secondary">Try adjusting your filters or check back later</Text>
                  </div>
                }
              />
            </Card>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="mobile-only" style={{ display: 'block' }}>
                <style>{`
                  @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                  }
                `}</style>
                {filteredRecords.map((record) => (
                  <MobileRecordCard key={record.id} record={record} />
                ))}
              </div>

              {/* Desktop Table */}
              <div className="desktop-only" style={{ display: 'none' }}>
                <style>{`
                  @media (min-width: 768px) {
                    .desktop-only { display: block !important; }
                  }
                `}</style>
                <Card title={<Text strong>📋 Work History Details</Text>}>
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={columns}
                      dataSource={filteredRecords}
                      loading={recordsLoading}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} records`,
                      }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No work history found"
                          />
                        ),
                      }}
                      scroll={{ x: 800 }}
                      size="small"
                    />
                  </div>
                </Card>
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default MyHistory;