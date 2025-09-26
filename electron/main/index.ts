import { app, BrowserWindow, ipcMain, Menu, nativeImage, shell, Tray } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'os'
import { exec, execSync } from 'child_process'
import { showNotification } from '../azkar/notification'
import { defaultSettings, loadSettings, saveSettings } from '../azkar/setting'
import {
  deleteZekr,
  getTodayTotal,
  incrementZekrCount,
  loadAzkar,
  loadDailyProgress,
  loadDailySettings,
  saveAllZekr,
  saveDailyProgress,
  saveDailySettings,
  saveZekr,
  setWebContents,
  updateZekr
} from '../azkar/zekr'
import { update } from './update'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '../..')
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let tray: Tray | null = null
let notificationTimer: NodeJS.Timeout | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

function setAutoLaunch(enabled: boolean) {
  try {
    if (process.platform === 'win32') {
      const appPath = process.execPath
      const appName = app.getName()

      if (!fs.existsSync(appPath)) {
        console.error('App executable not found at:', appPath)
        return
      }

      if (enabled) {
        const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}" /t REG_SZ /d "${appPath}" /f`
        exec(command, (error: Error | null) => {
          if (error) {
            console.error('Failed to add to startup:', error)
            return
          }
          console.log('Added to startup successfully')
        })
        return
      }

      const command = `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}" /f`
      exec(command, (error: Error | null) => {
        if (error) {
          console.error('Failed to remove from startup:', error)
          return
        }
        console.log('Removed from startup successfully')
      })
      return
    }

    if (process.platform === 'darwin') {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        openAsHidden: true
      })
      console.log(`Auto-startup ${enabled ? 'enabled' : 'disabled'} on macOS`)
      return
    }

    const desktopEntryPath = path.join(os.homedir(), '.config/autostart/azkary.desktop')

    if (enabled) {
      if (!fs.existsSync(process.execPath)) {
        console.error('App executable not found at:', process.execPath)
        return
      }

      const desktopEntry = `[Desktop Entry]
Type=Application
Name=Azkary
Exec=${process.execPath}
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true`

      const autostartDir = path.dirname(desktopEntryPath)
      if (!fs.existsSync(autostartDir)) {
        fs.mkdirSync(autostartDir, { recursive: true })
      }

      fs.writeFileSync(desktopEntryPath, desktopEntry)
      console.log('Added to startup on Linux')
      return
    }

    if (fs.existsSync(desktopEntryPath)) {
      fs.unlinkSync(desktopEntryPath)
      console.log('Removed from startup on Linux')
    }
  } catch (error) {
    console.error('Error setting auto-launch:', error)
  }
}

function checkAutoLaunchStatus(): boolean {
  if (process.platform === 'win32') {
    try {
      const result = execSync(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${app.getName()}"`, { encoding: 'utf8' })
      return result.includes(app.getName())
    } catch {
      return false
    }
  }

  if (process.platform === 'darwin') {
    return app.getLoginItemSettings().openAtLogin
  }

  const desktopEntryPath = path.join(os.homedir(), '.config/autostart/azkary.desktop')
  return fs.existsSync(desktopEntryPath)
}

function verifyAutoStartup(): boolean {
  if (process.platform === 'win32') {
    try {
      const result = execSync(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${app.getName()}"`, { encoding: 'utf8' })
      if (result.includes(app.getName())) {
        const pathMatch = result.match(/REG_SZ\s+(.+)/)
        if (pathMatch) {
          const registryPath = pathMatch[1].trim().replace(/"/g, '')
          return registryPath === process.execPath
        }
      }
      return false
    } catch {
      return false
    }
  }

  if (process.platform === 'darwin') {
    const loginItemSettings = app.getLoginItemSettings()
    return loginItemSettings.openAtLogin
  }

  const desktopEntryPath = path.join(os.homedir(), '.config/autostart/azkary.desktop')
  if (fs.existsSync(desktopEntryPath)) {
    try {
      const content = fs.readFileSync(desktopEntryPath, 'utf8')
      return content.includes(`Exec=${process.execPath}`)
    } catch {
      return false
    }
  }
  return false
}

function createTray() {
  try {
    let iconPath = path.join(process.env.VITE_PUBLIC, 'favicon.ico')
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, '../../public/favicon.ico')
    }

    const icon = nativeImage.createFromPath(iconPath)
    tray = new Tray(icon.resize({ width: 16, height: 16 }))

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          if (!win) return

          win.show()
          win.focus()
          if (win.isMinimized()) {
            win.restore()
          }
        }
      },
      { label: 'Quit', click: () => app.quit() }
    ])

    tray.setToolTip('Azkary - Zekr Reminder')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      if (!win) return

      win.show()
      win.focus()
      if (win.isMinimized()) {
        win.restore()
      }
    })
  } catch (error) {
    console.error('Failed to create tray:', error)
  }
}

function ensureTrayExists() {
  const settings = loadSettings()
  if (!settings.showTray || tray) return

  createTray()
}



async function createWindow() {
  win = new BrowserWindow({
    title: 'Azkary',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    autoHideMenuBar: true,
    backgroundColor: "#f7f7f7",
    width: 650,
    height: 800,
    minWidth: 650,
    maxWidth: 650,
    webPreferences: {
      preload,
    },
  })

  win.on('minimize', () => {
    win?.hide()
  })

  win.on('close', (event) => {
    const settings = loadSettings()
    if (settings.showTray && tray) {
      event.preventDefault()
      win?.hide()
    }
  })

  win.on('hide', () => {
    ensureTrayExists()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (win.webContents) {
    console.log('Setting webContents for zekr updates')
    setWebContents(win.webContents)
  } else {
    console.log('No webContents available')
  }

  update(win)
}

app.whenReady().then(() => {
  createWindow()
  const settings = loadSettings()

  if (settings.autoStartup) {
    setAutoLaunch(true)
  }

  if (settings.showTray) {
    createTray()
  }
  startNotificationTimer()
})

app.on('window-all-closed', () => {
  const settings = loadSettings()
  if (!settings.showTray) {
    if (process.platform !== 'darwin') app.quit()
  }
})

app.on('before-quit', () => {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
  if (tray) {
    tray.destroy()
    tray = null
  }
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle("save-zekr", async (_, arg) => {
  try {
    saveZekr(arg)
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
})

ipcMain.handle("load-zekr", async () => {
  try {
    return loadAzkar()
  } catch (e) {
    console.error('Failed to load settings:', e)
    return null
  }
})

ipcMain.handle("update-zekr", async (_, index, updatedItem) => {
  try {
    updateZekr(index, updatedItem)
    return true
  } catch (e) {
    console.error('Failed to update zekr:', e)
    return false
  }
})

ipcMain.handle("delete-zekr", async (_, index) => {
  try {
    deleteZekr(index)
    return true
  } catch (e) {
    console.error('Failed to delete zekr:', e)
    return false
  }
})

ipcMain.handle("save-all-zekr", async (_, zekrArray, skipNotification = false) => {
  try {
    saveAllZekr(zekrArray, skipNotification)
    return true
  } catch (e) {
    console.error('Failed to save all zekr:', e)
    return false
  }
})

export function startNotificationTimer() {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }

  const settings = loadSettings()
  if (!settings.enabled) {
    console.log('Notifications disabled in settings')
    return
  }

  console.log('Starting notification timer with interval:', settings.notificationInterval, 'seconds')
  const intervalMs = settings.notificationInterval * 1000

  notificationTimer = setInterval(async () => {
    console.log('Notification timer triggered, loading zekr list...')
    const zekrList = loadAzkar()
    console.log('Loaded zekr list:', zekrList)

    if (!zekrList || zekrList.length === 0) {
      console.log('No zekr found or empty zekr list')
      return
    }

    const totalPriority = zekrList.reduce((sum: number, zekr: { priority: number }) => sum + zekr.priority, 0)
    let random = Math.random() * totalPriority

    for (const zekr of zekrList) {
      random -= zekr.priority
      if (random > 0) continue

      console.log(`Selected random zekr: "${zekr.text}"`)
      // Increment the zekr count when showing notification
      const newCount = incrementZekrCount(zekr.text)
      console.log(`Incremented count for "${zekr.text}" to ${newCount}`)
      const settings = loadSettings()
      await showNotification(zekr, settings.muteSound)
      break
    }
  }, intervalMs)
}

ipcMain.handle("get-notification-settings", async () => {
  try {
    return loadSettings()
  } catch (e) {
    console.error('Failed to load notification settings:', e)
    return defaultSettings
  }
})

ipcMain.handle("update-notification-settings", async (_, settings) => {
  try {
    console.log('Received notification settings update:', settings)
    const currentSettings = loadSettings()
    console.log('Current settings:', currentSettings)

    const updatedSettings = { ...currentSettings, ...settings }
    console.log('Updated settings:', updatedSettings)

    saveSettings(updatedSettings)
    console.log('Settings saved to file')

    if (settings.hasOwnProperty('autoStartup')) {
      setAutoLaunch(settings.autoStartup)
      console.log('Auto-startup setting updated:', settings.autoStartup)
    }

    startNotificationTimer()
    console.log('Notification timer restarted')

    if (settings.hasOwnProperty('showTray')) {
      if (settings.showTray && !tray) {
        createTray()
        console.log('Tray created')
        return updatedSettings
      }

      if (!settings.showTray && tray) {
        tray.destroy()
        tray = null
        console.log('Tray destroyed')
      }
    }

    ensureTrayExists()
    return updatedSettings
  } catch (e) {
    console.error('Failed to update notification settings:', e)
    throw e
  }
})

ipcMain.handle("test-notification", async () => {
  try {
    const zekrList = loadAzkar()
    if (zekrList && zekrList.length > 0) {
      const settings = loadSettings()
      await showNotification(zekrList[0], settings.muteSound)
      return true
    }
    return false
  } catch (e) {
    console.error('Failed to test notification:', e)
    return false
  }
})

ipcMain.handle("load-daily-progress", async (_, date) => {
  try {
    return loadDailyProgress(date)
  } catch (e) {
    console.error('Failed to load daily progress:', e)
    return 0
  }
})

ipcMain.handle("save-daily-progress", async (_, date, count) => {
  try {
    saveDailyProgress(date, count)
    return true
  } catch (e) {
    console.error('Failed to save daily progress:', e)
    return false
  }
})

ipcMain.handle("load-daily-settings", async () => {
  try {
    return loadDailySettings()
  } catch (e) {
    console.error('Failed to load daily settings:', e)
    return { target: 100, lastResetDate: new Date().toISOString().split("T")[0] }
  }
})

ipcMain.handle("save-daily-settings", async (_, settings) => {
  try {
    saveDailySettings(settings)
    return true
  } catch (e) {
    console.error('Failed to save daily settings:', e)
    return false
  }
})

ipcMain.handle("get-today-total", async () => {
  try {
    return getTodayTotal()
  } catch (e) {
    console.error('Failed to get today total:', e)
    return 0
  }
})

ipcMain.handle("increment-zekr-count", async (_, zekrText) => {
  try {
    return incrementZekrCount(zekrText)
  } catch (e) {
    console.error('Failed to increment zekr count:', e)
    return 0
  }
})

ipcMain.handle("get-today-zekr-count", async () => {
  try {
    return getTodayTotal()
  } catch (e) {
    console.error('Failed to get today zekr count:', e)
    return 0
  }
})

ipcMain.handle("add-missing-zekr", async (_, zekrText: string) => {
  try {
    const zekrList = loadAzkar()
    const newZekr = {
      text: zekrText,
      priority: 1,
      count: 0
    }
    const updatedZekrList = [...zekrList, newZekr]
    saveAllZekr(updatedZekrList, false) // Allow notification for adding missing zekr
    return true
  } catch (e) {
    console.error('Failed to add missing zekr:', e)
    return false
  }
})

ipcMain.handle("trigger-notification-timer", async () => {
  try {
    console.log("Manually triggering notification timer...")
    const zekrList = loadAzkar()
    if (zekrList && zekrList.length > 0) {
      const newCount = incrementZekrCount(zekrList[0].text)
      console.log(`Incremented count for "${zekrList[0].text}" to ${newCount}`)
      const settings = loadSettings()
      await showNotification(zekrList[0], settings.muteSound)
      return true
    }
    return false
  } catch (e) {
    console.error('Failed to trigger notification timer:', e)
    return false
  }
})

ipcMain.handle("check-auto-startup-status", async () => {
  try {
    return checkAutoLaunchStatus()
  } catch (e) {
    console.error('Failed to check auto-startup status:', e)
    return false
  }
})

ipcMain.handle("verify-auto-startup", async () => {
  try {
    return verifyAutoStartup()
  } catch (e) {
    console.error('Failed to verify auto-startup:', e)
    return false
  }
})

ipcMain.handle("show-daily-reset-notification", async () => {
  try {
    const { Notification } = require('electron')
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: 'Azkary - Daily Reset',
        body: 'تم إعادة تعيين الأذكار اليومية. بداية يوم جديد!',
        icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
        silent: false
      })
      notification.show()
      console.log('Daily reset notification shown')
    }
    return true
  } catch (e) {
    console.error('Failed to show daily reset notification:', e)
    return false
  }
})