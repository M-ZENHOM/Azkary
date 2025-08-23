import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater'

export function update(win: Electron.BrowserWindow) {

  autoUpdater.autoDownload = false
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = false

  if (app.isPackaged) {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'M-ZENHOM',
      repo: 'Azkary',
      private: false
    })
  }

  // start check
  autoUpdater.on('checking-for-update', function () {
    console.log('Checking for updates...')
  })

  // update available
  autoUpdater.on('update-available', (arg: UpdateInfo) => {
    console.log('Update available:', arg.version)
    win.webContents.send('update-can-available', { update: true, version: app.getVersion(), newVersion: arg?.version })
  })

  // update not available
  autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
    console.log('No update available')
    win.webContents.send('update-can-available', { update: false, version: app.getVersion(), newVersion: arg?.version })
  })

  // Handle update errors
  autoUpdater.on('error', (error: Error) => {
    console.error('Auto-updater error:', error)
    win.webContents.send('update-error', { message: error.message, error: error.toString() })
  })

  // Checking for updates
  ipcMain.handle('check-update', async () => {
    if (!app.isPackaged) {
      const error = new Error('The update feature is only available after the package.')
      return { message: error.message, error }
    }

    try {
      return await autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      return { message: 'Network error', error }
    }
  })

  // Start downloading and feedback on progress
  ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send('update-error', { message: error.message, error })
        } else {
          // feedback update progress message
          event.sender.send('download-progress', progressInfo)
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send('update-downloaded')
      }
    )
  })

  // Install now
  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall(false, true)
  })
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void,
) {
  autoUpdater.on('download-progress', (info: ProgressInfo) => callback(null, info))
  autoUpdater.on('error', (error: Error) => callback(error, null))
  autoUpdater.on('update-downloaded', complete)
  autoUpdater.downloadUpdate()
}
