// Mock Auth Service

const USERS_KEY = 'genova_users';
const CURRENT_USER_KEY = 'genova_current_user';

export const authService = {
    // Register a new user
    register: async (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
                const newUser = { ...userData, id: Date.now().toString() };
                users.push(newUser);
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
                resolve(newUser);
            }, 1000);
        });
    },

    // Login a user
    login: async (email, password, role) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
                const user = users.find(u => u.email === email && u.password === password && u.role === role);

                if (user) {
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                    resolve(user);
                } else {
                    // For demo purposes, allow login if user doesn't exist but credentials are "demo"/"demo"
                    if (email === 'demo@genova.com' && password === 'demo') {
                        const demoUser = {
                            id: 'demo-123',
                            name: 'Demo User',
                            email,
                            role,
                            isVerified: true // Auto verify demo user
                        };
                        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
                        resolve(demoUser);
                    } else {
                        reject(new Error('Invalid credentials'));
                    }
                }
            }, 1000);
        });
    },

    // Logout
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    // Get current user
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem(CURRENT_USER_KEY);
    }
};
