import { ApolloServer } from 'apollo-server-micro';
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';

// Create Apollo Server instance (same as your pages version)
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => {
    try {
      // Get the user session from Auth0
      const session = await getSession();
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

async function handleGraphQL(request: NextRequest) {
  try {
    await startServer;

    // Convert NextRequest to the format apollo-server-micro expects
    const body = request.method === 'POST' ? await request.text() : '';
    
    // Create mock req/res objects that apollo-server-micro can work with
    const mockReq = {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      url: '/api/graphql',
      body,
    };

    const mockRes = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      writeHead(status: number, headers?: Record<string, string>) {
        this.statusCode = status;
        if (headers) {
          Object.assign(this.headers, headers);
        }
      },
      write() {},
      end(data?: string) {
        return data;
      }
    };

    // Get the Apollo Server handler
    const handler = apolloServer.createHandler({ path: '/api/graphql' });
    
    // Call the handler
    const result = await handler(mockReq as any, mockRes as any);

    // Return the response
    return new Response(result || '{"data":null}', {
      status: mockRes.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        ...mockRes.headers,
      },
    });

  } catch (error) {
    console.error('GraphQL handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET(request: NextRequest) {
  return handleGraphQL(request);
}

export async function POST(request: NextRequest) {
  return handleGraphQL(request);
}