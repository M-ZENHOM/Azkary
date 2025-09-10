export interface ZekrItem {
    text: string;
    priority: number;
    count: number;
}

export interface DailySettings {
    target: number;
    lastResetDate: string;
}

export interface NotificationSettings {
    notificationInterval: number;
    enabled: boolean;
    showTray: boolean;
    muteSound: boolean;
    autoStartup: boolean;
}

export interface ElectronAPI {
    saveZekr: (data: { text: string, priority: number, count?: number }) => Promise<void>;
    loadZekr: () => Promise<ZekrItem[]>;
    updateZekr: (index: number, data: { text: string, priority: number, count?: number }) => Promise<boolean>;
    deleteZekr: (index: number) => Promise<boolean>;
    saveAllZekr: (zekrArray: ZekrItem[], skipNotification?: boolean) => Promise<boolean>;
    addMissingZekr: (zekrText: string) => Promise<boolean>;
    getNotificationSettings: () => Promise<NotificationSettings>;
    updateNotificationSettings: (settings: NotificationSettings) => Promise<NotificationSettings>;
    testNotification: () => Promise<boolean>;
    triggerNotificationTimer: () => Promise<boolean>;
    checkAutoStartupStatus: () => Promise<boolean>;
    verifyAutoStartup: () => Promise<boolean>;
    loadDailyProgress: (date: string) => Promise<number>;
    saveDailyProgress: (date: string, count: number) => Promise<boolean>;
    loadDailySettings: () => Promise<DailySettings>;
    saveDailySettings: (settings: DailySettings) => Promise<boolean>;
    getTodayTotal: () => Promise<number>;
    incrementZekrCount: (zekrText: string) => Promise<number>;
    getTodayZekrCount: (zekrText: string) => Promise<number>;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
        ipcRenderer?: {
            on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void;
            off: (channel: string, ...args: unknown[]) => void;
            send: (channel: string, ...args: unknown[]) => void;
            invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        };
    }
} 