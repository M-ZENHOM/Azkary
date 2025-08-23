export interface ZekrItem {
    text: string;
    priority: number;
    count: number;
}

export interface DailyProgress {
    date: string;
    count: number;
}

export interface DailySettings {
    target: number;
    lastResetDate: string;
}