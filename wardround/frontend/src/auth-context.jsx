import React, { createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const noop = () => {};
const mockAuth = {
  isAuthenticated: true,
  isLoading: false,
  user: null,
  loginWithRedirect: noop,
  getAccessTokenSilently: async () => '',
};

const AppAuthContext = createContext(mockAuth);

export function useAppAuth() {
  return useContext(AppAuthContext);
}

export function MockAuthProvider({ children }) {
  return (
    <AppAuthContext.Provider value={mockAuth}>
      {children}
    </AppAuthContext.Provider>
  );
}

/** Renders only inside Auth0Provider; provides useAuth0 values to AppAuthContext */
export function Auth0Bridge({ children }) {
  const auth = useAuth0();
  return (
    <AppAuthContext.Provider
      value={{
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        user: auth.user,
        loginWithRedirect: auth.loginWithRedirect,
        getAccessTokenSilently: auth.getAccessTokenSilently,
      }}
    >
      {children}
    </AppAuthContext.Provider>
  );
}

export { AppAuthContext };
