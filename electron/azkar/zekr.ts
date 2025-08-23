import { WebContents } from "electron";
import fs from "node:fs";
import { DailySettings, ZekrItem } from "../types";
import {
    azkarPath,
    dailyProgressPath,
    dailySettingsPath
} from "./paths";

let webContents: WebContents | null = null

export function setWebContents(wc: WebContents) {
    webContents = wc
}

function _notifyRendererOfZekrUpdate() {
    if (webContents) {
        const total = getTodayTotal()
        console.log('Notifying renderer of zekr update, total:', total)
        webContents.send('zekr-data-updated', { total })
    } else {
        console.log('No webContents available for notification')
    }
}

export function loadAzkar(): ZekrItem[] {
    try {
        if (!fs.existsSync(azkarPath)) {
            return []
        }
        const fileData = fs.readFileSync(azkarPath, "utf-8")
        const data = JSON.parse(fileData)
        return data.map((item: any) => ({
            text: item.text,
            priority: item.priority,
            count: item.count || 0
        }))
    } catch (error) {
        console.error("Error loading zekr.json:", error)
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

export function saveAllZekr(zekrArray: ZekrItem[]) {
    try {
        fs.writeFileSync(azkarPath, JSON.stringify(zekrArray, null, 2), "utf-8")
        _notifyRendererOfZekrUpdate()
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
                lastResetDate: new Date().toISOString().split("T")[0]
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
            lastResetDate: new Date().toISOString().split("T")[0]
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

