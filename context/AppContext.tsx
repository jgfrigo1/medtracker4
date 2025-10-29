import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { AppContextType, HealthData, StandardPattern, DailyData, User } from '../types';
import { supabase } from '../services/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const AppContext = createContext<AppContextType | undefined>(undefined);

// FIX: Define props in a type alias for clarity and to potentially help with type inference.
type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [healthData, setHealthData] = useState<HealthData>({});
    const [medications, setMedications] = useState<string[]>([]);
    const [standardPattern, setStandardPattern] = useState<StandardPattern>({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getAllData();
            if (data) {
                setHealthData(data.healthData);
                setMedications(data.medications);
                setStandardPattern(data.standardPattern);
            } else {
                setHealthData({});
                setMedications([]);
                setStandardPattern({});
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                const user = session?.user?.user_metadata?.username 
                    ? { username: session.user.user_metadata.username as string }
                    : null;
                
                setCurrentUser(user);

                if (event === 'SIGNED_IN') {
                    await fetchData();
                } else if (event === 'SIGNED_OUT') {
                    setHealthData({});
                    setMedications([]);
                    setStandardPattern({});
                    setIsLoading(false);
                }
            }
        );
        
        // Check initial session
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                 const user = session?.user?.user_metadata?.username 
                    ? { username: session.user.user_metadata.username as string }
                    : null;
                setCurrentUser(user);
                await fetchData();
            } else {
                setIsLoading(false);
            }
        };

        checkInitialSession();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchData]);

    const login = async (email: string, password: string): Promise<string | null> => {
        return api.login(email, password);
    };
    
    const signup = async (email: string, password: string): Promise<string | null> => {
        return api.signup(email, password);
    };

    const logout = () => {
        api.logout();
    };

    const updateHealthData = async (date: string, data: DailyData) => {
        setHealthData(prevData => ({ ...prevData, [date]: data })); // Optimistic update
        await api.saveHealthData(date, data);
    };
    
    const addMedication = async (med: string) => {
        if (!medications.includes(med)) {
            const newMeds = [...medications, med];
            setMedications(newMeds); // Optimistic update
            await api.addMedication(med);
        }
    };

    const editMedication = async (oldMed: string, newMed: string) => {
        // No optimistic update, just call API and refetch for consistency
        await api.editMedication(oldMed, newMed);
        await fetchData();
    };

    const deleteMedication = async (medToDelete: string) => {
        // No optimistic update, just call API and refetch for consistency
        await api.deleteMedication(medToDelete);
        await fetchData();
    };

    const updateStandardPattern = async (pattern: StandardPattern) => {
        setStandardPattern(pattern); // Optimistic update
        await api.saveStandardPattern(pattern);
    };

    const value = {
        currentUser,
        login,
        signup,
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
