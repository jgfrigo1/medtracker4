
export interface TimeSlotData {
    value: number | null;
    medications: string[];
    comments: string;
}

export type DailyData = Record<string, TimeSlotData>;

export type HealthData = Record<string, DailyData>;

export type StandardPattern = Record<string, string[]>;

export interface AppContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    healthData: HealthData;
    updateHealthData: (date: string, data: DailyData) => void;
    medications: string[];
    addMedication: (med: string) => void;
    editMedication: (oldMed: string, newMed: string) => void;
    deleteMedication: (med: string) => void;
    standardPattern: StandardPattern;
    updateStandardPattern: (pattern: StandardPattern) => void;
}
