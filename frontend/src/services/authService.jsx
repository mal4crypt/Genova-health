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
                // Verify role matches (unless it's the admin override which we handled above)
                // Note: The backend override returns role='admin', so if the user tried to login as 'patient'
                // with the override moves, the role mismatch check here requires adjustment.
                // However, the requirement is that logging in with these creds GRANTS admin access.
                // If the user selected 'patient' but provided admin creds, the backend returns admin role.
                // We should allow this mismatch if the returned role is admin.

                if (response.data.role !== role && response.data.role !== 'admin') {
                    throw { response: { data: { message: `Access denied. Not a ${role} account.` } } };
                }

                localStorage.setItem('genova_user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
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
