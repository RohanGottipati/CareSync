import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

export function useApi() {
    const { getAccessTokenSilently } = useAuth0();

    const getToken = useCallback(() =>
        getAccessTokenSilently({
            authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        }), [getAccessTokenSilently]);

    /** Standard JSON fetch — use for all non-file requests. */
    const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
        const token = await getToken();
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
    }, [getToken]);

    /**
     * Multipart fetch — use for file uploads.
     * Pass a FormData object as `body`. Do NOT set Content-Type manually;
     * the browser sets it automatically with the correct multipart boundary.
     */
    const uploadWithAuth = useCallback(async (endpoint, formData) => {
        const token = await getToken();
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(error.error || `Upload error: ${res.status}`);
        }
        return res.json();
    }, [getToken]);

    return { fetchWithAuth, uploadWithAuth };
}
