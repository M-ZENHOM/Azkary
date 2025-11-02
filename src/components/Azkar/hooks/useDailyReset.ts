import { useEffect, useCallback } from "react";
import { Zekr, DailySettings } from "../types";
import { getLocalDateString } from "../../../lib/utils";

export const useDailyReset = (zekr: Zekr[], dailySettings: DailySettings) => {
    const performDailyReset = useCallback(async () => {
        const today = getLocalDateString();
        console.log('Performing manual daily reset for date:', today);

        const resetZekr = zekr.map((item) => ({ ...item, count: 0 }));

        if (window.electronAPI?.saveDailySettings) {
            await window.electronAPI.saveDailySettings({
                ...dailySettings,
                lastResetDate: today,
            });
        }

        if (window.electronAPI?.saveAllZekr) {
            await window.electronAPI.saveAllZekr(resetZekr, false);
        }

        if (window.electronAPI?.saveDailyProgress) {
            await window.electronAPI.saveDailyProgress(today, 0);
        }

        try {
            if (window.electronAPI && 'showDailyResetNotification' in window.electronAPI) {
                await (window.electronAPI as any).showDailyResetNotification();
            }
        } catch (error) {
            console.error('Failed to show daily reset notification:', error);
        }
    }, [zekr, dailySettings]);

    const checkDailyReset = useCallback(async () => {
        const today = getLocalDateString();

        if (dailySettings.lastResetDate === today) {
            console.log('Daily reset already performed today:', today);
            return;
        }

        console.log('Daily reset needed. Last reset:', dailySettings.lastResetDate, 'Today:', today);
        console.log('Daily reset will be handled by main process or can be triggered manually');
    }, [dailySettings.lastResetDate]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkDailyReset();
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [checkDailyReset]);

    return { checkDailyReset, performDailyReset };
};
