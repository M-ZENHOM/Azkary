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
}

export interface ElectronAPI {
    saveZekr: (data: { text: string, priority: number, count?: number }) => Promise<void>;
    loadZekr: () => Promise<ZekrItem[]>;
    updateZekr: (index: number, data: { text: string, priority: number, count?: number }) => Promise<boolean>;
    deleteZekr: (index: number) => Promise<boolean>;
    saveAllZekr: (zekrArray: ZekrItem[]) => Promise<boolean>;
    addMissingZekr: (zekrText: string) => Promise<boolean>;
    getNotificationSettings: () => Promise<NotificationSettings>;
    updateNotificationSettings: (settings: NotificationSettings) => Promise<NotificationSettings>;
    testNotification: () => Promise<boolean>;
    triggerNotificationTimer: () => Promise<boolean>;
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
            on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
            off: (channel: string, ...args: any[]) => void;
            send: (channel: string, ...args: any[]) => void;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
        };
    }
} 