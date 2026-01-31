// Central API and Socket Configuration
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// BASE_URL for Sockets (e.g. https://backend.com)
const BASE_URL = VITE_API_URL.replace(/\/api$/, '');

// API_URL for REST (e.g. https://backend.com/api)
const API_URL = VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL}/api`;

console.log('[CONFIG] BASE_URL (Sockets):', BASE_URL);
console.log('[CONFIG] API_URL (REST):', API_URL);

export { BASE_URL, API_URL };
