import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`;

export function useApi() {
    const { getAccessTokenSilently } = useAuth0();

    const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
        const token = await getAccessTokenSilently({
            authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            },
        });

        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(error.error || `API error: ${res.status}`);
        }

        return res.json();
    }, [getAccessTokenSilently]);

    return { fetchWithAuth };
}
