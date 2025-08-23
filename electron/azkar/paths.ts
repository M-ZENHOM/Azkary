import { app } from 'electron'
import path from 'node:path'

export const userData = app.getPath('userData')
export const azkarPath = path.join(userData, 'azkar.json')
export const settingsPath = path.join(userData, 'settings.json')
export const dailyProgressPath = path.join(userData, 'daily-progress.json')
export const dailySettingsPath = path.join(userData, 'daily-settings.json')
export const todayTotalPath = path.join(userData, 'today-total.json')
