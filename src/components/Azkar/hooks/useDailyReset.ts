import { useEffect, useCallback } from "react";
import { Zekr, DailySettings } from "../types";
import { getLocalDateString, getMillisecondsUntilMidnight } from "../../../lib/utils";

export const useDailyReset = (zekr: Zekr[], dailySettings: DailySettings) => {

    const performDailyReset = useCallback(async () => {
        const today = getLocalDateString();
        console.log('Performing daily reset for date:', today);

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
        await performDailyReset();
    }, [dailySettings.lastResetDate, performDailyReset]);

    useEffect(() => {
        const scheduleMidnightReset = () => {
            const msUntilMidnight = getMillisecondsUntilMidnight();
            console.log('Scheduling midnight reset in', msUntilMidnight, 'ms');

            const timeoutId = setTimeout(async () => {
                console.log('Midnight reached, performing automatic daily reset');
                await performDailyReset();

                scheduleMidnightReset();
            }, msUntilMidnight);

            return timeoutId;
        };

        const timeoutId = scheduleMidnightReset();

        return () => {
            clearTimeout(timeoutId);
        };
    }, [performDailyReset]);

    return { checkDailyReset, performDailyReset };
};
