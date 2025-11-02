import { useState, useEffect } from "react";
import { DailySettings } from "../types";
import { getLocalDateString } from "../../../lib/utils";

export const useDailySettings = () => {
    const [dailySettings, setDailySettings] = useState<DailySettings>({
        target: 100,
        lastResetDate: getLocalDateString(),
    });

    const loadSettings = async () => {
        try {
            if (!window.electronAPI?.loadDailySettings) return;

            const settings = await window.electronAPI.loadDailySettings();
            if (settings) {
                setDailySettings(settings);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    };

    const saveSettings = async (settings: DailySettings) => {
        try {
            if (!window.electronAPI?.saveDailySettings) return;

            await window.electronAPI.saveDailySettings(settings);
            setDailySettings(settings);
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    };

    const updateDailyTarget = async (target: number) => {
        await saveSettings({
            ...dailySettings,
            target,
        });
    };

    useEffect(() => {
        loadSettings();

        const handleSettingsUpdate = () => {
            loadSettings();
        };

        if (window.ipcRenderer) {
            window.ipcRenderer.on('daily-settings-updated', handleSettingsUpdate);
        }

        const intervalId = setInterval(() => {
            loadSettings();
        }, 60000);

        return () => {
            if (window.ipcRenderer) {
                window.ipcRenderer.off('daily-settings-updated', handleSettingsUpdate);
            }
            clearInterval(intervalId);
        };
    }, []);

    return {
        dailySettings,
        updateDailyTarget,
        saveSettings,
    };
};
