import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Bridge, MockAuthProvider } from './auth-context.jsx';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

export const Auth0ProviderWrapper = ({ children }) => {
  // Section 11: when Auth0 env vars are set, wrap with Auth0Provider + BrowserRouter
  if (domain && clientId) {
    return (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience || undefined,
        }}
      >
        <BrowserRouter>
          <Auth0Bridge>{children}</Auth0Bridge>
        </BrowserRouter>
      </Auth0Provider>
    );
  }
  // No Auth0 config: dev mode — mock auth so all routes are accessible
  return (
    <BrowserRouter>
      <MockAuthProvider>{children}</MockAuthProvider>
    </BrowserRouter>
  );
};
