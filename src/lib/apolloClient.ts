// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create HTTP link to your GraphQL endpoint
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

// Create auth link to include credentials
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      // Include credentials for Auth0 session
    }
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});