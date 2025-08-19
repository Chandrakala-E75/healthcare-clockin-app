'use client';

import React from 'react';
import { Tabs } from 'antd';
import { ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import ClockInOut from '@/components/careworker/ClockInOut';
import MyHistory from '@/components/careworker/MyHistory';

function CareWorkerPage() {
  const tabItems = [
    {
      key: 'clockinout',
      label: (
        <span>
          <ClockCircleOutlined />
          Clock In/Out
        </span>
      ),
      children: <ClockInOut />,
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          My Work History
        </span>
      ),
      children: <MyHistory />,
    },
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <h1 style={{ marginBottom: 24 }}>Care Worker Dashboard</h1>
      <Tabs
        defaultActiveKey="clockinout"
        items={tabItems}
        size="large"
        style={{ minHeight: 400 }}
      />
    </div>
  );
}

export default withPageAuthRequired(CareWorkerPage);