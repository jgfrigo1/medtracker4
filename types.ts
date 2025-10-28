export interface TimeSlotData {
    value: number | null;
    medications: string[];
    comments: string;
}

export type DailyData = Record<string, TimeSlotData>;

export type HealthData = Record<string, DailyData>;

export type StandardPattern = Record<string, string[]>;

export interface User {
    username: string;
}

export interface AppContextType {
    currentUser: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    healthData: HealthData;
    medications: string[];
    standardPattern: StandardPattern;
    isLoading: boolean;
    updateHealthData: (date: string, data: DailyData) => Promise<void>;
    addMedication: (med: string) => Promise<void>;
    editMedication: (oldMed: string, newMed: string) => Promise<void>;
    deleteMedication: (med: string) => Promise<void>;
    updateStandardPattern: (pattern: StandardPattern) => Promise<void>;
}
