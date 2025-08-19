import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      prompt: 'login' // Always show login screen
    }
  })
});