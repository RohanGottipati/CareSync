// All backend calls — always sends JWT
const API_BASE = 'http://localhost:3001/api';

export async function fetchWithAuth(endpoint, options = {}) {
    const token = 'mock-jwt-token'; // Replace with real Auth0 token logic
    return fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json());
}
