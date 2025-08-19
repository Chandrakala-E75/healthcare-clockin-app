'use client';

import './globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { apolloClient } from '@/lib/apolloClient';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <ApolloProvider client={apolloClient}>
            <AuthProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </AuthProvider>
          </ApolloProvider>
        </UserProvider>
      </body>
    </html>
  );
}