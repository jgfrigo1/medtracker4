import { supabase } from './supabase';
import type { HealthData, DailyData, StandardPattern } from '../types';

const getUsernameFromEmail = (email: string) => email.split('@')[0];

const api = {
    login: async (email: string, password: string): Promise<string | null> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? 'Usuario o contraseña incorrecta.' : null;
    },

    signup: async (email: string, password: string): Promise<string | null> => {
        const username = getUsernameFromEmail(email);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                }
            }
        });

        if (error) {
            if (error.message.includes('unique constraint')) {
                return 'Este nombre de usuario ya está en uso.';
            }
            return 'Error al crear la cuenta. Inténtelo de nuevo.';
        }
        return null;
    },

    logout: async (): Promise<void> => {
        await supabase.auth.signOut();
    },

    getAllData: async (): Promise<{ healthData: HealthData, medications: string[], standardPattern: StandardPattern } | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch profile and health records in parallel
        const [profileRes, healthRecordsRes] = await Promise.all([
            supabase.from('profiles').select('medications, standard_pattern').eq('user_id', user.id).single(),
            supabase.from('health_records').select('date, data').eq('user_id', user.id)
        ]);
        
        if (profileRes.error || healthRecordsRes.error) {
            console.error('Error fetching data:', profileRes.error || healthRecordsRes.error);
            return null;
        }

        const healthData = healthRecordsRes.data.reduce((acc: HealthData, record) => {
            acc[record.date] = record.data;
            return acc;
        }, {});
        
        return {
            healthData,
            medications: profileRes.data.medications || [],
            standardPattern: profileRes.data.standard_pattern || {},
        };
    },

    saveHealthData: async (date: string, data: DailyData): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.from('health_records').upsert({
            user_id: user.id,
            date: date,
            data: data
        }, { onConflict: 'user_id, date' });

        if (error) console.error('Error saving health data:', error);
        return !error;
    },

    addMedication: async (medication: string): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Get current medications
        const { data, error: fetchError } = await supabase.from('profiles').select('medications').eq('user_id', user.id).single();
        if (fetchError || !data) {
             console.error('Error fetching medications for add:', fetchError);
            return false;
        }

        // Add new medication if it doesn't exist
        const currentMeds = data.medications || [];
        if (!currentMeds.includes(medication)) {
            const newMeds = [...currentMeds, medication];
            const { error } = await supabase.from('profiles').update({ medications: newMeds }).eq('user_id', user.id);
            if (error) console.error('Error adding medication:', error);
            return !error;
        }
        return true;
    },
    
    // Note: This relies on a Supabase Database Function (RPC) for transactional integrity.
    editMedication: async (oldMed: string, newMed: string): Promise<boolean> => {
        const { error } = await supabase.rpc('update_medication_name', {
            old_name: oldMed,
            new_name: newMed,
        });
        if (error) console.error('Error editing medication via RPC:', error);
        return !error;
    },
    
    // Note: This relies on a Supabase Database Function (RPC) for transactional integrity.
    deleteMedication: async (medication: string): Promise<boolean> => {
        const { error } = await supabase.rpc('delete_medication_name', {
            med_name: medication,
        });
        if (error) console.error('Error deleting medication via RPC:', error);
        return !error;
    },

    saveStandardPattern: async (pattern: StandardPattern): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.from('profiles').update({ standard_pattern: pattern }).eq('user_id', user.id);
        if (error) console.error('Error saving standard pattern:', error);
        return !error;
    },

    exportUserData: async (): Promise<{ healthData: HealthData, medications: string[], standardPattern: StandardPattern } | null> => {
        return api.getAllData(); // The same data is needed for export
    },

    importUserData: async (data: { healthData: HealthData, medications: string[], standardPattern: StandardPattern }): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // 1. Update profile with medications and standard pattern
        const { error: profileError } = await supabase.from('profiles').update({
            medications: data.medications,
            standard_pattern: data.standardPattern
        }).eq('user_id', user.id);

        if (profileError) {
            console.error('Import failed at profile update:', profileError);
            return false;
        }

        // 2. Delete all existing health records for the user
        const { error: deleteError } = await supabase.from('health_records').delete().eq('user_id', user.id);
        if (deleteError) {
            console.error('Import failed at deleting old records:', deleteError);
            // Note: In a real-world scenario, you'd want to roll back the profile update.
            return false;
        }

        // 3. Insert new health records
        const recordsToInsert = Object.entries(data.healthData).map(([date, dailyData]) => ({
            user_id: user.id,
            date: date,
            data: dailyData,
        }));
        
        if (recordsToInsert.length > 0) {
            const { error: insertError } = await supabase.from('health_records').insert(recordsToInsert);
            if (insertError) {
                console.error('Import failed at inserting new records:', insertError);
                return false;
            }
        }
        
        return true;
    },
};

export { api };
