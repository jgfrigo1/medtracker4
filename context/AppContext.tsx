import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../services/api';
import type { AppContextType, HealthData, StandardPattern, DailyData, User } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>(LOCAL_STORAGE_KEYS.IS_AUTHENTICATED, null);
    const [healthData, setHealthData] = useState<HealthData>({});
    const [medications, setMedications] = useState<string[]>([]);
    const [standardPattern, setStandardPattern] = useState<StandardPattern>({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!currentUser) {
            setIsLoading(false);
            setHealthData({});
            setMedications([]);
            setStandardPattern({});
            return;
        }
        setIsLoading(true);
        try {
            const [healthDataRes, medicationsRes, standardPatternRes] = await Promise.all([
                api.getHealthData(currentUser.username),
                api.getMedications(currentUser.username),
                api.getStandardPattern(currentUser.username),
            ]);
            setHealthData(healthDataRes);
            setMedications(medicationsRes);
            setStandardPattern(standardPatternRes);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const login = async (username: string, password: string): Promise<boolean> => {
        const user = await api.login(username, password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const updateHealthData = async (date: string, data: DailyData) => {
        if (!currentUser) return;
        setHealthData(prevData => ({ ...prevData, [date]: data })); // Optimistic update
        await api.saveHealthData(currentUser.username, date, data);
    };
    
    const addMedication = async (med: string) => {
        if (!currentUser) return;
        if (!medications.includes(med)) {
            const newMeds = [...medications, med];
            setMedications(newMeds);
            await api.saveMedications(currentUser.username, newMeds);
        }
    };

    const editMedication = async (oldMed: string, newMed: string) => {
        if (!currentUser) return;
        const newMeds = medications.map(m => (m === oldMed ? newMed : m));
        setMedications(newMeds);
        
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
        // Persist all changes
        const healthDataPromises = Object.entries(newHealthData).map(([date, data]) => api.saveHealthData(currentUser.username, date, data));

        const newStandardPattern = { ...standardPattern };
        Object.keys(newStandardPattern).forEach(time => {
            const meds = newStandardPattern[time];
            if (meds.includes(oldMed)) {
                newStandardPattern[time] = meds.map(m => m === oldMed ? newMed : m);
            }
        });
        setStandardPattern(newStandardPattern);

        await Promise.all([
            api.saveMedications(currentUser.username, newMeds),
            api.saveStandardPattern(currentUser.username, newStandardPattern),
            ...healthDataPromises
        ]);
    };

    const deleteMedication = async (medToDelete: string) => {
        if (!currentUser) return;
        const newMeds = medications.filter(med => med !== medToDelete);
        setMedications(newMeds);
        
        const newHealthData = { ...healthData };
        Object.keys(newHealthData).forEach(date => {
            Object.keys(newHealthData[date]).forEach(time => {
                newHealthData[date][time].medications = newHealthData[date][time].medications.filter(m => m !== medToDelete);
            });
        });
        setHealthData(newHealthData);
        const healthDataPromises = Object.entries(newHealthData).map(([date, data]) => api.saveHealthData(currentUser.username, date, data));


        const newStandardPattern = { ...standardPattern };
        Object.keys(newStandardPattern).forEach(time => {
            newStandardPattern[time] = newStandardPattern[time].filter(m => m !== medToDelete);
        });
        setStandardPattern(newStandardPattern);
        
        await Promise.all([
            api.saveMedications(currentUser.username, newMeds),
            api.saveStandardPattern(currentUser.username, newStandardPattern),
            ...healthDataPromises
        ]);
    };

    const updateStandardPattern = async (pattern: StandardPattern) => {
        if (!currentUser) return;
        setStandardPattern(pattern);
        await api.saveStandardPattern(currentUser.username, pattern);
    };

    const value = {
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
