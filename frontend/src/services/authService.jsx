import axios from 'axios';
import { API_URL } from '../config';

console.log('[AUTH] Using API_URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('genova_user') || '{}');
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    // Register
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('genova_user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error('[AUTH] Registration failure:', error.response?.data || error.message);
            throw error;
        }
    },

    // Login
    login: async (email, password, role) => {
        console.log(`[AUTH] Attempting login for ${email} with role ${role} at ${API_URL}`);
        try {
            // Special handling for driver login which uses driverId instead of email
            const loginData = role === 'driver'
                ? { driverId: email, password }
                : { email, password };

            const response = await api.post('/auth/login', loginData);

            if (response.data.token) {
                if (response.data.role !== role && response.data.role !== 'admin') {
                    console.warn(`[AUTH] Role mismatch. Expected ${role}, got ${response.data.role}`);
                    throw { response: { data: { message: `Access denied. Not a ${role} account.` } } };
                }

                localStorage.setItem('genova_user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
                console.log('[AUTH] Login successful for', response.data.email);
            }
            return response.data;
        } catch (error) {
            console.error('[AUTH] Login failure at:', API_URL);
            console.error('[AUTH] Error details:', error.response?.data || error.message);
            if (!error.response) {
                console.error('[AUTH] Network error or backend unreachable. Please check VITE_API_URL and CORS settings.');
            }
            throw error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('genova_user');
        localStorage.removeItem('token');
        window.location.href = '#/login';
    },

    // Get current user
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('genova_user'));
    },

    // Check if authenticated
    isAuthenticated: () => {
        const user = JSON.parse(localStorage.getItem('genova_user'));
        return !!user && !!user.token;
    }
};

export default api;
