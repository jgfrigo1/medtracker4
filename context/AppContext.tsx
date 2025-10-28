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
            const { healthData, medications, standardPattern } = await api.getAllData();
            setHealthData(healthData);
            setMedications(medications);
            setStandardPattern(standardPattern);
        } catch (error) {
            console.error("Failed to fetch data", error);
            // If token is invalid, log out user
            if (error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
                 logout();
            }
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
        api.logout();
        setCurrentUser(null);
    };

    const updateHealthData = async (date: string, data: DailyData) => {
        if (!currentUser) return;
        setHealthData(prevData => ({ ...prevData, [date]: data })); // Optimistic update
        await api.saveHealthData(date, data);
    };
    
    const addMedication = async (med: string) => {
        if (!currentUser) return;
        if (!medications.includes(med)) {
            const newMeds = [...medications, med];
            setMedications(newMeds); // Optimistic update
            await api.addMedication(med);
        }
    };

    const editMedication = async (oldMed: string, newMed: string) => {
        if (!currentUser) return;
        // No optimistic update, just call API and refetch for consistency
        await api.editMedication(oldMed, newMed);
        await fetchData();
    };

    const deleteMedication = async (medToDelete: string) => {
        if (!currentUser) return;
        // No optimistic update, just call API and refetch for consistency
        await api.deleteMedication(medToDelete);
        await fetchData();
    };

    const updateStandardPattern = async (pattern: StandardPattern) => {
        if (!currentUser) return;
        setStandardPattern(pattern); // Optimistic update
        await api.saveStandardPattern(pattern);
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
