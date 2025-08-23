import { Notification } from "electron"
import fs from "node:fs"
import path from "node:path"
import { getTodayTotal, saveDailyProgress } from "./zekr"

export async function showNotification(zekr: { text: string }, muteSound: boolean = false) {

    if (!Notification.isSupported()) {
        console.log('Notifications not supported on this platform')
        return;
    }

    let iconPath = path.join(process.env.VITE_PUBLIC, 'favicon.ico')
    if (!fs.existsSync(iconPath)) {
        iconPath = path.join(__dirname, '../../public/favicon.ico')
    }

    const notification = new Notification({
        body: zekr.text,
        icon: iconPath,
        silent: muteSound
    })

    notification.show()

    try {
        const newTotal = getTodayTotal()
        const today = new Date().toISOString().split("T")[0]
        saveDailyProgress(today, newTotal)
    } catch (error) {
        console.error('Failed to update counts in notification:', error)
    }

    setTimeout(() => {
        notification.close()
    }, 10000)
}



