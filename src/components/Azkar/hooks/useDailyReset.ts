import { Zekr, DailySettings } from "../types";

export const useDailyReset = (zekr: Zekr[], dailySettings: DailySettings) => {
    const checkDailyReset = async () => {
        const today = new Date().toISOString().split("T")[0];

        if (dailySettings.lastResetDate === today) return;

        const resetZekr = zekr.map((item) => ({ ...item, count: 0 }));

        if (window.electronAPI?.saveDailySettings) {
            await window.electronAPI.saveDailySettings({
                ...dailySettings,
                lastResetDate: today,
            });
        }

        if (window.electronAPI?.saveAllZekr) {
            await window.electronAPI.saveAllZekr(resetZekr);
        }

        if (window.electronAPI?.saveDailyProgress) {
            await window.electronAPI.saveDailyProgress(today, 0);
        }
    };

    return { checkDailyReset };
};
