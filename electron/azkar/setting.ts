import fs from 'node:fs'
import { settingsPath } from './paths'

export const defaultSettings = {
    notificationInterval: 60,
    enabled: true,
    showTray: true
}

export function loadSettings() {
    try {
        if (!fs.existsSync(settingsPath)) {
            console.log('Settings file does not exist, using defaults')
            return defaultSettings
        }
        const fileData = fs.readFileSync(settingsPath, "utf-8")
        const parsedSettings = JSON.parse(fileData)
        const mergedSettings = { ...defaultSettings, ...parsedSettings }
        return mergedSettings
    } catch (error) {
        console.error("Error loading settings:", error)
        return defaultSettings
    }
}

export function saveSettings(settings: { notificationInterval: number, enabled: boolean, showTray: boolean }) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8")
    } catch (e) {
        console.error("Failed to save settings:", e)
    }
}