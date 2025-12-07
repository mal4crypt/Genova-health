import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
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
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Login
    login: async (email, password, role) => {
        try {
            // Special handling for driver login which uses driverId instead of email
            const loginData = role === 'driver'
                ? { driverId: email, password } // LoginDriver passes ID as first arg
                : { email, password };

            const response = await api.post('/auth/login', loginData);

            if (response.data.token) {
                // Verify role matches
                if (response.data.role !== role && role !== 'admin') { // Admin can login anywhere usually, or restrict
                    // For now, strict role check
                    if (response.data.role !== role) {
                        throw { response: { data: { message: `Access denied. Not a ${role} account.` } } };
                    }
                }
                localStorage.setItem('genova_user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('genova_user');
        window.location.href = '/login';
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
