// API Configuration with environment-based URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiConfig = {
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// API helper function
export const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            ...apiConfig.headers,
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const url = `${apiConfig.baseURL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export default api;
