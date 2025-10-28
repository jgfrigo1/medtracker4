import type { HealthData, DailyData, StandardPattern } from '../types';

// This is a mock API service to simulate a backend.
// In a real application, this would make HTTP requests to a server.
// It uses localStorage to persist data, but simulates asynchronicity.

// --- MOCK DATABASE ---
const MOCK_USERS: Record<string, string> = {
    'user1': 'salud1',
    'user2': 'salud2',
};

const SIMULATED_LATENCY = 300; // ms

const getStorageKey = (base: string, username: string) => `healthTracker_${base}_${username}`;

// --- API FUNCTIONS ---

export const api = {
    login: async (username: string, password: string): Promise<{ username: string } | null> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (MOCK_USERS[username] && MOCK_USERS[username] === password) {
                    resolve({ username });
                } else {
                    resolve(null);
                }
            }, SIMULATED_LATENCY);
        });
    },

    getHealthData: async (username: string): Promise<HealthData> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = localStorage.getItem(getStorageKey('healthData', username));
                resolve(data ? JSON.parse(data) : {});
            }, SIMULATED_LATENCY);
        });
    },

    saveHealthData: async (username: string, date: string, data: DailyData): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const existingDataStr = localStorage.getItem(getStorageKey('healthData', username));
                    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
                    const newData = { ...existingData, [date]: data };
                    localStorage.setItem(getStorageKey('healthData', username), JSON.stringify(newData));
                    resolve(true);
                } catch (e) {
                    console.error("Failed to save health data", e);
                    resolve(false);
                }
            }, SIMULATED_LATENCY);
        });
    },

    getMedications: async (username: string): Promise<string[]> => {
         return new Promise((resolve) => {
            setTimeout(() => {
                const data = localStorage.getItem(getStorageKey('medications', username));
                // Provide default meds for new users
                resolve(data ? JSON.parse(data) : ['Paracetamol 1g', 'Ibuprofeno 600mg']);
            }, SIMULATED_LATENCY);
        });
    },

    saveMedications: async (username: string, medications: string[]): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    localStorage.setItem(getStorageKey('medications', username), JSON.stringify(medications));
                    resolve(true);
                } catch (e) {
                    console.error("Failed to save medications", e);
                    resolve(false);
                }
            }, SIMULATED_LATENCY);
        });
    },
    
    getStandardPattern: async (username: string): Promise<StandardPattern> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = localStorage.getItem(getStorageKey('standardPattern', username));
                resolve(data ? JSON.parse(data) : {});
            }, SIMULATED_LATENCY);
        });
    },

    saveStandardPattern: async (username: string, pattern: StandardPattern): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    localStorage.setItem(getStorageKey('standardPattern', username), JSON.stringify(pattern));
                    resolve(true);
                } catch(e) {
                    console.error("Failed to save standard pattern", e);
                    resolve(false);
                }
            }, SIMULATED_LATENCY);
        });
    }
};
