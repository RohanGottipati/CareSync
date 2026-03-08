const API_BASE = `${import.meta.env.VITE_API_URL}api`;

export function createApiFetcher(getToken) {
    return async function fetchWithAuth(endpoint, options = {}) {
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
    };
}
