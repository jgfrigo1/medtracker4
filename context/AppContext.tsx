import React, { createContext, useContext, ReactNode, useState } from 'react';
import type { AppContextType, HealthData, StandardPattern, DailyData, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage('healthTracker_isAuthenticated', false);
    const [healthData, setHealthData] = useLocalStorage<HealthData>('healthTracker_healthData', {});
    const [medications, setMedications] = useLocalStorage<string[]>('healthTracker_medications', []);
    const [standardPattern, setStandardPattern] = useLocalStorage<StandardPattern>('healthTracker_standardPattern', {});
    const [isLoading, setIsLoading] = useState(false);

    const currentUser = isAuthenticated ? { username: 'Usuario' } : null;

    const login = async (password: string): Promise<string | null> => {
        setIsLoading(true);
        // Simulate async operation
        return new Promise(resolve => {
            setTimeout(() => {
                if (password === 'josep') {
                    setIsAuthenticated(true);
                    resolve(null);
                } else {
                    resolve('Contraseña incorrecta.');
                }
                setIsLoading(false);
            }, 500);
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const updateHealthData = async (date: string, data: DailyData) => {
        setHealthData(prevData => ({ ...prevData, [date]: data }));
    };
    
    const addMedication = async (med: string) => {
        if (!medications.includes(med)) {
            setMedications(prev => [...prev, med].sort());
        }
    };

    const editMedication = async (oldMed: string, newMed: string) => {
        // This logic ensures data consistency across all local storage entries
        setMedications(prev => prev.map(m => m === oldMed ? newMed : m).sort());
        
        setStandardPattern(prev => {
            const newPattern: StandardPattern = {};
            for (const time in prev) {
                newPattern[time] = prev[time].map(m => m === oldMed ? newMed : m);
            }
            return newPattern;
        });

        setHealthData(prev => {
            const newData: HealthData = {};
            for (const date in prev) {
                newData[date] = {};
                for (const time in prev[date]) {
                    newData[date][time] = {
                        ...prev[date][time],
                        medications: prev[date][time].medications.map(m => m === oldMed ? newMed : m)
                    };
                }
            }
            return newData;
        });
    };

    const deleteMedication = async (medToDelete: string) => {
        // This logic ensures data consistency across all local storage entries
        setMedications(prev => prev.filter(m => m !== medToDelete));
        
        setStandardPattern(prev => {
            const newPattern: StandardPattern = {};
            for (const time in prev) {
                const filteredMeds = prev[time].filter(m => m !== medToDelete);
                if (filteredMeds.length > 0) {
                    newPattern[time] = filteredMeds;
                }
            }
            return newPattern;
        });

        setHealthData(prev => {
            const newData: HealthData = {};
            for (const date in prev) {
                newData[date] = {};
                for (const time in prev[date]) {
                    newData[date][time] = {
                        ...prev[date][time],
                        medications: prev[date][time].medications.filter(m => m !== medToDelete)
                    };
                }
            }
            return newData;
        });
    };

    const updateStandardPattern = async (pattern: StandardPattern) => {
        setStandardPattern(pattern);
    };

    const importData = async (data: { healthData: HealthData, medications: string[], standardPattern: StandardPattern }) => {
        setHealthData(data.healthData || {});
        setMedications(data.medications || []);
        setStandardPattern(data.standardPattern || {});
    };

    const value: AppContextType = {
        currentUser,
        login,
        logout,
        healthData,
        medications,
        standardPattern,
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
