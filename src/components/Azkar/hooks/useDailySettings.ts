import { useState, useEffect } from "react";
import { DailySettings } from "../types";

export const useDailySettings = () => {
    const [dailySettings, setDailySettings] = useState<DailySettings>({
        target: 100,
        lastResetDate: new Date().toISOString().split("T")[0],
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
    }, []);

    return {
        dailySettings,
        updateDailyTarget,
        saveSettings,
    };
};
