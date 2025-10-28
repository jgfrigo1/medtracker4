
export const APP_PASSWORD = "salud"; // Simple password for demo purposes

export const TIME_SLOTS: string[] = [];
for (let h = 8; h < 24; h++) {
    TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 23) {
      TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
    }
}

export const LOCAL_STORAGE_KEYS = {
    HEALTH_DATA: 'healthTracker_healthData',
    MEDICATIONS: 'healthTracker_medications',
    STANDARD_PATTERN: 'healthTracker_standardPattern',
    IS_AUTHENTICATED: 'healthTracker_isAuthenticated',
};
