import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fitness`;

const fitnessService = {
    // Metrics
    logMetric: async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/metrics`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getMetrics: async (type, days = 7) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/metrics`, {
            params: { type, days },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Goals
    getGoals: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/goals`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    createGoal: async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/goals`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Achievements
    getAchievements: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/achievements`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default fitnessService;
