import { WebContents } from "electron";
import fs from "node:fs";
import { DailySettings, ZekrItem } from "../types";
import {
    azkarPath,
    dailyProgressPath,
    dailySettingsPath
} from "./paths";
import { getLocalDateString } from "../../src/lib/utils";

let webContents: WebContents | null = null
let isNotifying = false
let notificationTimeout: NodeJS.Timeout | null = null
let isInitializing = true
let notificationCount = 0
const MAX_NOTIFICATIONS_PER_SECOND = 5

export function setWebContents(wc: WebContents) {
    webContents = wc
    setTimeout(() => {
        isInitializing = false
        console.log('Initialization complete, notifications enabled')
    }, 2000)
}

function _notifyRendererOfZekrUpdate() {
    if (isNotifying || !webContents || isInitializing) {
        console.log('Notification blocked:', { isNotifying, hasWebContents: !!webContents, isInitializing })
        return
    }

    notificationCount++
    if (notificationCount > MAX_NOTIFICATIONS_PER_SECOND) {
        console.log('Rate limit exceeded, skipping notification')
        return
    }

    setTimeout(() => {
        notificationCount = 0
    }, 1000)

    if (notificationTimeout) {
        clearTimeout(notificationTimeout)
    }

    notificationTimeout = setTimeout(() => {
        try {
            isNotifying = true
            const total = getTodayTotal()
            console.log('Notifying renderer of zekr update, total:', total)
            webContents?.send('zekr-data-updated', { total })
        } catch (error) {
            console.error('Error notifying renderer:', error)
        } finally {
            isNotifying = false
        }
    }, 200) // Increased debounce to 200ms
}

export function loadAzkar(): ZekrItem[] {
    try {
        if (!fs.existsSync(azkarPath)) {
            return []
        }

        const fileData = fs.readFileSync(azkarPath, "utf-8")

        if (!fileData.trim()) {
            console.log("zekr.json is empty, returning empty array")
            return []
        }

        const data = JSON.parse(fileData)

        if (!Array.isArray(data)) {
            console.error("zekr.json does not contain an array, returning empty array")
            return []
        }

        return data.map((item: { text: string; priority: number; count?: number }) => ({
            text: item.text,
            priority: item.priority,
            count: item.count || 0
        }))
    } catch (error) {
        console.error("Error loading zekr.json:", error)

        try {
            const backupPath = azkarPath + '.backup.' + Date.now()
            if (fs.existsSync(azkarPath)) {
                fs.copyFileSync(azkarPath, backupPath)
                console.log(`Backed up corrupted zekr.json to ${backupPath}`)
            }
        } catch (backupError) {
            console.error("Failed to backup corrupted zekr.json:", backupError)
        }

        return []
    }
}

export function saveZekr(newItem: { text: string, priority: number, count?: number }) {
    try {
        const existing = loadAzkar()
        const itemWithCount: ZekrItem = {
            text: newItem.text,
            priority: newItem.priority,
            count: newItem.count || 0
        }
        const updated = [...existing, itemWithCount]
        fs.writeFileSync(azkarPath, JSON.stringify(updated, null, 2), "utf-8")
        _notifyRendererOfZekrUpdate()
    } catch (e) {
        console.error("Failed to save zekr:", e)
    }
}

export function updateZekr(index: number, updatedItem: { text: string, priority: number, count?: number }) {
    try {
        const existing = loadAzkar()
        if (index >= 0 && index < existing.length) {
            existing[index] = {
                text: updatedItem.text,
                priority: updatedItem.priority,
                count: updatedItem.count !== undefined ? updatedItem.count : existing[index].count
            }
            fs.writeFileSync(azkarPath, JSON.stringify(existing, null, 2), "utf-8")
            _notifyRendererOfZekrUpdate()
        }
    } catch (e) {
        console.error("Failed to update zekr:", e)
    }
}

export function deleteZekr(index: number) {
    try {
        const existing = loadAzkar()
        if (index >= 0 && index < existing.length) {
            existing.splice(index, 1)
            fs.writeFileSync(azkarPath, JSON.stringify(existing, null, 2), "utf-8")
            _notifyRendererOfZekrUpdate()
        }
    } catch (e) {
        console.error("Failed to delete zekr:", e)
    }
}

export function saveAllZekr(zekrArray: ZekrItem[], skipNotification: boolean = false) {
    try {
        fs.writeFileSync(azkarPath, JSON.stringify(zekrArray, null, 2), "utf-8")
        if (!skipNotification) {
            _notifyRendererOfZekrUpdate()
        }
    } catch (e) {
        console.error("Failed to save all zekr:", e)
    }
}

export function incrementZekrCount(zekrText: string) {
    try {
        const existing = loadAzkar()
        const zekrIndex = existing.findIndex(z => z.text === zekrText)
        if (zekrIndex >= 0) {
            existing[zekrIndex].count += 1
            fs.writeFileSync(azkarPath, JSON.stringify(existing, null, 2), "utf-8")
            _notifyRendererOfZekrUpdate()
            return existing[zekrIndex].count
        } else {
            const newZekr: ZekrItem = {
                text: zekrText,
                priority: 1,
                count: 1
            }
            const updated = [...existing, newZekr]
            fs.writeFileSync(azkarPath, JSON.stringify(updated, null, 2), "utf-8")
            _notifyRendererOfZekrUpdate()
            return 1
        }
    } catch (e) {
        console.error("Failed to increment zekr count:", e)
        return 0
    }
}

export function loadDailyProgress(date: string): number {
    try {
        if (!fs.existsSync(dailyProgressPath)) {
            return 0
        }
        const fileData = fs.readFileSync(dailyProgressPath, "utf-8")
        const progress = JSON.parse(fileData)
        return progress[date] || 0
    } catch (error) {
        console.error("Error loading daily progress:", error)
        return 0
    }
}

export function saveDailyProgress(date: string, count: number) {
    try {
        let progress: { [key: string]: number } = {}
        if (fs.existsSync(dailyProgressPath)) {
            const fileData = fs.readFileSync(dailyProgressPath, "utf-8")
            progress = JSON.parse(fileData)
        }
        progress[date] = count
        fs.writeFileSync(dailyProgressPath, JSON.stringify(progress, null, 2), "utf-8")
    } catch (e) {
        console.error("Failed to save daily progress:", e)
    }
}

export function loadDailySettings(): DailySettings {
    try {
        if (!fs.existsSync(dailySettingsPath)) {
            const defaultSettings: DailySettings = {
                target: 100,
                lastResetDate: getLocalDateString()
            }
            saveDailySettings(defaultSettings)
            return defaultSettings
        }
        const fileData = fs.readFileSync(dailySettingsPath, "utf-8")
        return JSON.parse(fileData)
    } catch (error) {
        console.error("Error loading daily settings:", error)
        return {
            target: 100,
            lastResetDate: getLocalDateString()
        }
    }
}

export function saveDailySettings(settings: DailySettings) {
    try {
        fs.writeFileSync(dailySettingsPath, JSON.stringify(settings, null, 2), "utf-8")
    } catch (e) {
        console.error("Failed to save daily settings:", e)
    }
}

export function getTodayTotal(): number {
    try {
        const zekrList = loadAzkar()
        const total = zekrList.reduce((sum, zekr) => sum + (zekr.count || 0), 0)
        return total
    } catch (error) {
        console.error("Error calculating today's total:", error)
        return 0
    }
}

