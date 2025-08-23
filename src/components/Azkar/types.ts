export interface Zekr {
    text: string;
    priority: number;
    count: number;
}

export interface EditingZekr {
    index: number;
    text: string;
    priority: number;
}

export interface DailySettings {
    target: number;
    lastResetDate: string;
}

export interface ZekrListProps {
    zekr: Zekr[];
    onUpdateZekr: (index: number, text: string, priority: number) => Promise<void>;
    onDeleteZekr: (index: number) => Promise<void>;
    onDecrementCount: (index: number) => Promise<void>;
}

export interface DailyProgressProps {
    todayTotal: number;
    target: number;
}

export interface DailyTargetSettingsProps {
    target: number;
    onTargetChange: (target: number) => Promise<void>;
}

export interface QuickAddSectionProps {
    onQuickAdd: (text: string, count?: number) => Promise<void>;
}

export interface AddZekrFormProps {
    onAddZekr: (text: string, priority: number) => Promise<void>;
}
