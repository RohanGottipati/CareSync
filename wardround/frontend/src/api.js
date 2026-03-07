// Section 11: all backend calls include Auth0 JWT
import axios from 'axios';
import { useAppAuth } from './auth-context.jsx';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useApi() {
  const { getAccessTokenSilently } = useAppAuth();

  const authHeaders = async () => {
    const token = await getAccessTokenSilently();
    return { Authorization: `Bearer ${token}` };
  };

  return {
    get: async (path) =>
      axios.get(`${BASE}${path}`, { headers: await authHeaders() }),

    post: async (path, data) =>
      axios.post(`${BASE}${path}`, data, { headers: await authHeaders() }),

    upload: async (path, formData) =>
      axios.post(`${BASE}${path}`, formData, {
        headers: { ...(await authHeaders()), 'Content-Type': 'multipart/form-data' },
      }),
  };
}

// Legacy: use useApi() in components for JWT. This is for non-React callers only (no token).
export async function fetchWithAuth(endpoint, options = {}) {
  return fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: options.headers?.Authorization ?? 'Bearer ',
    },
  }).then((res) => res.json());
}
