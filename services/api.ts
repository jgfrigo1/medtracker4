import type { HealthData, DailyData, StandardPattern } from '../types';

// This is a mock API service to simulate a backend.
// In a real application, this would make HTTP requests to a server.
// It uses localStorage to persist data, but simulates asynchronicity.

// --- MOCK DATABASE ---
const USERS_STORAGE_KEY = 'healthTracker_users';

const initializeUsers = (): Record<string, string> => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    const defaultUsers = {
        'user1': 'salud1',
        'user2': 'salud2',
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
};

let MOCK_USERS = initializeUsers();

const saveUsers = () => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
}

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

    getUsers: async (): Promise<string[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Object.keys(MOCK_USERS));
            }, SIMULATED_LATENCY);
        });
    },

    addUser: async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (MOCK_USERS[username]) {
                    resolve({ success: false, message: 'El nombre de usuario ya existe.' });
                } else {
                    MOCK_USERS[username] = password;
                    saveUsers();
                    resolve({ success: true });
                }
            }, SIMULATED_LATENCY);
        });
    },

    updateUserPassword: async (username: string, newPassword: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (MOCK_USERS[username]) {
                    MOCK_USERS[username] = newPassword;
                    saveUsers();
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, SIMULATED_LATENCY);
        });
    },

    deleteUser: async (username: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (MOCK_USERS[username]) {
                    delete MOCK_USERS[username];
                    saveUsers();
                    // Also delete user's data
                    localStorage.removeItem(getStorageKey('healthData', username));
                    localStorage.removeItem(getStorageKey('medications', username));
                    localStorage.removeItem(getStorageKey('standardPattern', username));
                    resolve(true);
                } else {
                    resolve(false);
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
    },

    exportUserData: async (username: string): Promise<{ healthData: HealthData, medications: string[], standardPattern: StandardPattern }> => {
        return new Promise(async (resolve) => {
            const [healthData, medications, standardPattern] = await Promise.all([
                api.getHealthData(username),
                api.getMedications(username),
                api.getStandardPattern(username)
            ]);
            resolve({ healthData, medications, standardPattern });
        });
    },

    importUserData: async (username: string, data: { healthData: HealthData, medications: string[], standardPattern: StandardPattern }): Promise<boolean> => {
        return new Promise(async (resolve) => {
            setTimeout(() => {
                try {
                    // Overwrite all data for the user
                    localStorage.setItem(getStorageKey('healthData', username), JSON.stringify(data.healthData || {}));
                    localStorage.setItem(getStorageKey('medications', username), JSON.stringify(data.medications || []));
                    localStorage.setItem(getStorageKey('standardPattern', username), JSON.stringify(data.standardPattern || {}));
                    resolve(true);
                } catch (e) {
                    console.error("Failed to import user data", e);
                    resolve(false);
                }
            }, SIMULATED_LATENCY);
        });
    },
};