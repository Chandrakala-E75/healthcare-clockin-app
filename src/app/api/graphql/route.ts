import { NextRequest } from 'next/server';
import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { getSession } from '@auth0/nextjs-auth0';

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  context: async (context) => {
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
});

export { yoga as GET, yoga as POST };