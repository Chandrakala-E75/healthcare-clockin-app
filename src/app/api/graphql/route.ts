import { ApolloServer } from 'apollo-server-micro';
import { NextRequest, NextResponse } from 'next/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { getSession } from '@auth0/nextjs-auth0';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    try {
      const session = await getSession();
      return {
        user: session?.user || null,
      };
    } catch (error) {
      console.error('Context error:', error);
      return { user: null };
    }
  },
  introspection: true,
  playground: true,
});

const startServer = apolloServer.start();

export async function POST(request: NextRequest) {
  await startServer;
  
  const body = await request.text();
  
  const response = await apolloServer.executeOperation({
    query: body.includes('query') ? JSON.parse(body).query : body,
    variables: body.includes('variables') ? JSON.parse(body).variables : {},
  });

  return NextResponse.json(response);
}

export async function GET() {
  return NextResponse.json({ message: 'GraphQL endpoint ready' });
}