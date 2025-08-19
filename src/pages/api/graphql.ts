// src/pages/api/graphql.ts
import { ApolloServer } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';

// Create Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => {
    try {
      // Get the user session from Auth0 - needs both req and res
      const session = await getSession(req, res);
      const user = session?.user || null;

      // Debug logging
      console.log('GraphQL Context - Session found:', !!session);
      console.log('GraphQL Context - User:', user?.email || 'No user');

      return {
        user,
      };
    } catch (error) {
      console.error('Context error:', error);
      return {
        user: null,
      };
    }
  },
  introspection: process.env.NODE_ENV !== 'production',
  csrfPrevention: true,
});

const startServer = apolloServer.start();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    await startServer;
    await apolloServer.createHandler({ path: '/api/graphql' })(req, res);
  } catch (error) {
    console.error('GraphQL handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};