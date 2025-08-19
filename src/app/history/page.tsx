'use client';
import React from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import MyHistory from '../../components/careworker/MyHistory';

function HistoryPage() {
  return <MyHistory />;
}

export default withPageAuthRequired(HistoryPage);