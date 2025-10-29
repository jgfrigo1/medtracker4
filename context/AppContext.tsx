import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppContextType, HealthData, StandardPattern, DailyData, User } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Simple password for local authentication. In a real app, this would be handled more securely.
const APP_PASSWORD = 'password123';
const USER_DATA_KEY = 'healthTracker_userData';

type AppProviderProps = {
    children: ReactNode;
};

interface UserDataBundle {
    healthData: HealthData;
    medications: string[];
    standardPattern: StandardPattern;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(LOCAL_STORAGE_KEYS.IS_AUTHENTICATED, false);
    
    const [userData, setUserData] = useLocalStorage<UserDataBundle>(USER_DATA_KEY, {
        healthData: {},
        medications: ['Medicina A', 'Medicina B'], // Example starting data
        standardPattern: {}
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // We just need to remove the initial loading state
        setIsLoading(false);
    }, []);
    
    const currentUser: User | null = isAuthenticated ? { username: 'Usuario' } : null;

    const login = async (password: string): Promise<string | null> => {
        setIsLoading(true);
        if (password === APP_PASSWORD) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return null; // Successful login
        } else {
            setIsLoading(false);
            return 'Contraseña incorrecta.'; // Failed login
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const updateHealthData = async (date: string, data: DailyData) => {
        setUserData(prev => ({
            ...prev,
            healthData: { ...prev.healthData, [date]: data }
        }));
    };

    const addMedication = async (med: string) => {
        if (!userData.medications.includes(med)) {
            setUserData(prev => ({
                ...prev,
                medications: [...prev.medications, med].sort()
            }));
        }
    };

    const editMedication = async (oldMed: string, newMed: string) => {
        setUserData(prev => {
            const newHealthData: HealthData = {};
            for (const date in prev.healthData) {
                newHealthData[date] = {};
                for (const time in prev.healthData[date]) {
                    newHealthData[date][time] = {
                        ...prev.healthData[date][time],
                        medications: prev.healthData[date][time].medications.map(m => (m === oldMed ? newMed : m))
                    };
                }
            }

            const newStandardPattern: StandardPattern = {};
            for (const time in prev.standardPattern) {
                newStandardPattern[time] = prev.standardPattern[time].map(m => (m === oldMed ? newMed : m));
            }
            
            return {
                ...prev,
                medications: prev.medications.map(m => (m === oldMed ? newMed : m)).sort(),
                healthData: newHealthData,
                standardPattern: newStandardPattern
            };
        });
    };

    const deleteMedication = async (medToDelete: string) => {
         setUserData(prev => {
            const newHealthData: HealthData = {};
            for (const date in prev.healthData) {
                newHealthData[date] = {};
                for (const time in prev.healthData[date]) {
                    newHealthData[date][time] = {
                        ...prev.healthData[date][time],
                        medications: prev.healthData[date][time].medications.filter(m => m !== medToDelete)
                    };
                }
            }
            
            const newStandardPattern: StandardPattern = {};
            for (const time in prev.standardPattern) {
                const filteredMeds = prev.standardPattern[time].filter(m => m !== medToDelete);
                if (filteredMeds.length > 0) {
                    newStandardPattern[time] = filteredMeds;
                }
            }
            
            return {
                ...prev,
                medications: prev.medications.filter(m => m !== medToDelete),
                healthData: newHealthData,
                standardPattern: newStandardPattern
            };
        });
    };
    
    const updateStandardPattern = async (pattern: StandardPattern) => {
        setUserData(prev => ({
            ...prev,
            standardPattern: pattern
        }));
    };
    
    const importData = async (data: { healthData: HealthData, medications: string[], standardPattern: StandardPattern }) => {
        setUserData({
            healthData: data.healthData || {},
            medications: data.medications || [],
            standardPattern: data.standardPattern || {}
        });
    };

    const value: AppContextType = {
        currentUser,
        login,
        logout,
        healthData: userData.healthData,
        medications: userData.medications,
        standardPattern: userData.standardPattern,
        isLoading,
        updateHealthData,
        addMedication,
        editMedication,
        deleteMedication,
        updateStandardPattern,
        importData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
