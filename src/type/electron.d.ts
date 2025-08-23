export interface ZekrItem {
    text: string;
    priority: number;
    count: number;
}

export interface DailySettings {
    target: number;
    lastResetDate: string;
}

export interface ElectronAPI {
    saveZekr: (data: { text: string, priority: number, count?: number }) => Promise<void>;
    loadZekr: () => Promise<ZekrItem[]>;
    updateZekr: (index: number, data: { text: string, priority: number, count?: number }) => Promise<boolean>;
    deleteZekr: (index: number) => Promise<boolean>;
    saveAllZekr: (zekrArray: ZekrItem[]) => Promise<boolean>;
    addMissingZekr: (zekrText: string) => Promise<boolean>;
    getNotificationSettings: () => Promise<any>;
    updateNotificationSettings: (settings: any) => Promise<any>;
    testNotification: () => Promise<boolean>;
    triggerNotificationTimer: () => Promise<boolean>;
    loadDailyProgress: (date: string) => Promise<number>;
    saveDailyProgress: (date: string, count: number) => Promise<boolean>;
    loadDailySettings: () => Promise<DailySettings>;
    saveDailySettings: (settings: DailySettings) => Promise<boolean>;
    getTodayTotal: () => Promise<number>;
    incrementZekrCount: (zekrText: string) => Promise<number>;
    getTodayZekrCount: () => Promise<number>;
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