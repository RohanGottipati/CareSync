import { Auth0Provider } from '@auth0/auth0-react';

/** Ensure a full origin with protocol (avoids "Invalid URI" when origin is bare host). */
function getRedirectUri() {
    if (typeof window === 'undefined') return 'http://localhost:5173';
    const o = window.location.origin;
    if (o && (o.startsWith('http://') || o.startsWith('https://'))) return o;
    const protocol = window.location.protocol || 'http:';
    const host = window.location.host || 'localhost:5173';
    return `${protocol}//${host}`;
}

export const Auth0ProviderWrapper = ({ children }) => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

    if (!domain || !clientId) {
        console.error('Auth0 domain and clientId are required in .env');
        return null;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: getRedirectUri(),
                audience: audience,
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider>
    );
};
