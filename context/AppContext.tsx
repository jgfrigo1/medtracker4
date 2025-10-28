
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
// Fix: Import DailyData to correctly type the updateHealthData function parameter.
import type { AppContextType, HealthData, StandardPattern, DailyData } from '../types';
import { APP_PASSWORD, LOCAL_STORAGE_KEYS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(LOCAL_STORAGE_KEYS.IS_AUTHENTICATED, false);
    const [healthData, setHealthData] = useLocalStorage<HealthData>(LOCAL_STORAGE_KEYS.HEALTH_DATA, {});
    const [medications, setMedications] = useLocalStorage<string[]>(LOCAL_STORAGE_KEYS.MEDICATIONS, ['Paracetamol 1g', 'Ibuprofeno 600mg']);
    const [standardPattern, setStandardPattern] = useLocalStorage<StandardPattern>(LOCAL_STORAGE_KEYS.STANDARD_PATTERN, {});

    const login = (password: string): boolean => {
        if (password === APP_PASSWORD) {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    // Fix: Correctly type the `data` parameter as `DailyData` instead of `any`.
    const updateHealthData = (date: string, data: DailyData) => {
        setHealthData(prevData => ({ ...prevData, [date]: data }));
    };

    const addMedication = (med: string) => {
        if (!medications.includes(med)) {
            setMedications([...medications, med]);
        }
    };

    const editMedication = (oldMed: string, newMed: string) => {
        setMedications(medications.map(m => (m === oldMed ? newMed : m)));
        // Also update in healthData and standardPattern
        const newHealthData = { ...healthData };
        Object.keys(newHealthData).forEach(date => {
            Object.keys(newHealthData[date]).forEach(time => {
                const meds = newHealthData[date][time].medications;
                if (meds.includes(oldMed)) {
                    newHealthData[date][time].medications = meds.map(m => m === oldMed ? newMed : m);
                }
            });
        });
        setHealthData(newHealthData);

        const newStandardPattern = { ...standardPattern };
        Object.keys(newStandardPattern).forEach(time => {
            const meds = newStandardPattern[time];
            if (meds.includes(oldMed)) {
                newStandardPattern[time] = meds.map(m => m === oldMed ? newMed : m);
            }
        });
        setStandardPattern(newStandardPattern);
    };

    const deleteMedication = (medToDelete: string) => {
        setMedications(medications.filter(med => med !== medToDelete));
        // Also remove from healthData and standardPattern
        const newHealthData = { ...healthData };
        Object.keys(newHealthData).forEach(date => {
            Object.keys(newHealthData[date]).forEach(time => {
                newHealthData[date][time].medications = newHealthData[date][time].medications.filter(m => m !== medToDelete);
            });
        });
        setHealthData(newHealthData);

        const newStandardPattern = { ...standardPattern };
        Object.keys(newStandardPattern).forEach(time => {
            newStandardPattern[time] = newStandardPattern[time].filter(m => m !== medToDelete);
        });
        setStandardPattern(newStandardPattern);
    };

    const updateStandardPattern = (pattern: StandardPattern) => {
        setStandardPattern(pattern);
    };
    
    const value = {
        isAuthenticated,
        login,
        logout,
        healthData,
        updateHealthData,
        medications,
        addMedication,
        editMedication,
        deleteMedication,
        standardPattern,
        updateStandardPattern,
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