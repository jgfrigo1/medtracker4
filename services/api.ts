import type { HealthData, DailyData, StandardPattern } from '../types';

// Replace with your actual Render.com backend URL
const API_BASE_URL = 'https://health-monitor-backend.onrender.com/api'; 
const TOKEN_KEY = 'healthTracker_authToken';

// --- Token Management ---
const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// --- API Wrapper ---
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }
    
    if (response.status === 204) { // For "No Content" responses
        return null;
    }

    return response.json();
};

// --- API FUNCTIONS ---

export const api = {
    login: async (username: string, password: string): Promise<{ username: string } | null> => {
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            if (data && data.token) {
                setToken(data.token);
                return { username: data.user.username };
            }
            return null;
        } catch (error) {
            console.error('Login failed:', error);
            return null;
        }
    },

    logout: () => {
        removeToken();
    },

    getUsers: async (): Promise<string[]> => {
        return apiRequest('/users');
    },

    addUser: async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    updateUserPassword: async (username: string, newPassword: string): Promise<boolean> => {
        try {
            await apiRequest(`/users/${username}/password`, {
                method: 'PUT',
                body: JSON.stringify({ password: newPassword }),
            });
            return true;
        } catch (error) {
            return false;
        }
    },

    deleteUser: async (username: string): Promise<boolean> => {
        try {
            await apiRequest(`/users/${username}`, { method: 'DELETE' });
            return true;
        } catch(error) {
            return false;
        }
    },

    getAllData: async (): Promise<{ healthData: HealthData, medications: string[], standardPattern: StandardPattern }> => {
        return apiRequest('/data');
    },

    saveHealthData: async (date: string, data: DailyData): Promise<boolean> => {
        try {
            await apiRequest(`/data/health-data/${date}`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return true;
        } catch (error) {
            console.error("Failed to save health data", error);
            return false;
        }
    },

    addMedication: async (medication: string): Promise<boolean> => {
        try {
            await apiRequest('/medications', {
                method: 'POST',
                body: JSON.stringify({ medication }),
            });
            return true;
        } catch (error) {
            console.error("Failed to add medication", error);
            return false;
        }
    },
    
    editMedication: async (oldMed: string, newMed: string): Promise<boolean> => {
        try {
            const encodedOldMed = encodeURIComponent(oldMed);
            await apiRequest(`/medications/${encodedOldMed}`, {
                method: 'PUT',
                body: JSON.stringify({ medication: newMed }),
            });
            return true;
        } catch (error) {
            console.error("Failed to edit medication", error);
            return false;
        }
    },
    
    deleteMedication: async (medication: string): Promise<boolean> => {
        try {
            const encodedMed = encodeURIComponent(medication);
            await apiRequest(`/medications/${encodedMed}`, {
                method: 'DELETE',
            });
            return true;
        } catch (error) {
            console.error("Failed to delete medication", error);
            return false;
        }
    },

    saveStandardPattern: async (pattern: StandardPattern): Promise<boolean> => {
        try {
            await apiRequest('/data/standard-pattern', {
                method: 'POST',
                body: JSON.stringify(pattern),
            });
            return true;
        } catch(e) {
            console.error("Failed to save standard pattern", e);
            return false;
        }
    },

    exportUserData: async (): Promise<{ healthData: HealthData, medications: string[], standardPattern: StandardPattern }> => {
        return apiRequest('/data/export');
    },

    importUserData: async (data: { healthData: HealthData, medications: string[], standardPattern: StandardPattern }): Promise<boolean> => {
        try {
            await apiRequest('/data/import', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return true;
        } catch (error) {
            console.error("Failed to import user data", error);
            return false;
        }
    },
};
