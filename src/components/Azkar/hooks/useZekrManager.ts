import { useState, useEffect, useCallback, useTransition } from "react";
import { Zekr } from "../types";

const SAMPLE_ZEKR: Zekr[] = [
    { text: "سبحان الله", priority: 1, count: 0 },
    { text: "الحمد لله", priority: 1, count: 0 },
    { text: "لا إله إلا الله", priority: 1, count: 0 },
    { text: "الله أكبر", priority: 1, count: 0 },
    { text: "لا حول ولا قوة إلا بالله", priority: 2, count: 0 },
    { text: "أستغفر الله", priority: 2, count: 0 },
];

export const useZekrManager = () => {
    const [zekr, setZekr] = useState<Zekr[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const todayTotal = zekr.reduce((sum, item) => sum + (item.count || 0), 0);

    const loadZekr = useCallback(async () => {
        try {
            setError(null);

            if (!window.electronAPI?.loadZekr) {
                setZekr(SAMPLE_ZEKR);
                return;
            }

            const zekrData = await window.electronAPI.loadZekr();
            if (zekrData && Array.isArray(zekrData)) {
                setZekr(zekrData);
                return;
            }

            setZekr(SAMPLE_ZEKR);
            if (window.electronAPI?.saveAllZekr) {
                await window.electronAPI.saveAllZekr(SAMPLE_ZEKR, true);
            }
        } catch (error) {
            console.error("Failed to load zekr:", error);
            setError("Failed to load zekr data");
            setZekr(SAMPLE_ZEKR);
        }
    }, []);

    const addZekr = async (text: string, priority: number) => {
        try {
            const newZekr = { text, priority, count: 0 };
            const updatedZekr = [...zekr, newZekr];
            setZekr(updatedZekr);

            if (window.electronAPI?.saveZekr) {
                await window.electronAPI.saveZekr(newZekr);
            }
        } catch (error) {
            console.error("Failed to save zekr:", error);
            setError("Failed to save zekr");
        }
    };

    const quickAddZekr = async (text: string, count: number = 1) => {
        try {
            setError(null);
            const existingIndex = zekr.findIndex((z) => z.text === text);
            const updatedZekr = [...zekr];

            if (existingIndex >= 0) {
                updatedZekr[existingIndex].count += count;
                setZekr(updatedZekr);

                if (window.electronAPI?.updateZekr) {
                    await window.electronAPI.updateZekr(existingIndex, updatedZekr[existingIndex]);
                }
                return;
            }

            const newZekr = { text, priority: 1, count };
            updatedZekr.push(newZekr);
            setZekr(updatedZekr);

            if (window.electronAPI?.saveZekr) {
                await window.electronAPI.saveZekr(newZekr);
            }
        } catch (error) {
            console.error("Failed to quick add zekr:", error);
            setError("Failed to add zekr");
        }
    };

    const updateZekr = async (index: number, text: string, priority: number) => {
        try {
            setError(null);
            const updatedItem = { text, priority, count: zekr[index].count };
            const updatedZekr = [...zekr];
            updatedZekr[index] = updatedItem;
            setZekr(updatedZekr);

            if (window.electronAPI?.updateZekr) {
                await window.electronAPI.updateZekr(index, updatedItem);
            }
        } catch (error) {
            console.error("Failed to update zekr:", error);
            setError("Failed to update zekr");
        }
    };

    const deleteZekr = async (index: number) => {
        try {
            setError(null);
            const updatedZekr = zekr.filter((_, i) => i !== index);
            setZekr(updatedZekr);

            if (window.electronAPI?.deleteZekr) {
                await window.electronAPI.deleteZekr(index);
            }
        } catch (error) {
            console.error("Failed to delete zekr:", error);
            setError("Failed to delete zekr");
        }
    };

    const decrementZekrCount = async (index: number) => {
        if (zekr[index].count <= 0) return;

        try {
            setError(null);
            const updatedZekr = [...zekr];
            updatedZekr[index].count -= 1;
            setZekr(updatedZekr);

            if (window.electronAPI?.updateZekr) {
                await window.electronAPI.updateZekr(index, updatedZekr[index]);
            }
        } catch (error) {
            console.error("Failed to decrement zekr count:", error);
            setError("Failed to update zekr count");
        }
    };

    const clearError = () => {
        setError(null);
    };

    const reloadZekr = () => {
        startTransition(() => {
            loadZekr();
        });
    };

    useEffect(() => {
        startTransition(() => {
            loadZekr();
        });
    }, []);

    useEffect(() => {
        let isProcessingUpdate = false;
        let isInitialLoad = true;

        setTimeout(() => {
            isInitialLoad = false;
            console.log('Initial load complete, notifications enabled');
        }, 3000);

        const handleZekrDataUpdate = async (event: Electron.IpcRendererEvent, data: { total: number }) => {
            console.log('Received zekr-data-updated event:', data);

            if (isInitialLoad) {
                console.log('Skipping notification during initial load');
                return;
            }

            if (isProcessingUpdate) {
                console.log('Already processing update, skipping');
                return;
            }

            const currentTotal = zekr.reduce((sum, item) => sum + (item.count || 0), 0);
            if (data.total === currentTotal) {
                console.log('Total matches current state, skipping reload');
                return;
            }

            try {
                isProcessingUpdate = true;

                if (window.electronAPI?.loadZekr) {
                    const zekrData = await window.electronAPI.loadZekr();
                    if (zekrData && Array.isArray(zekrData)) {
                        console.log('Updating zekr data from event:', zekrData);
                        setZekr(zekrData);
                    }
                }
            } catch (error) {
                console.error('Error processing zekr update:', error);
            } finally {
                isProcessingUpdate = false;
            }
        };

        if (window.ipcRenderer) {
            window.ipcRenderer.on("zekr-data-updated", handleZekrDataUpdate);
        }

        return () => {
            if (window.ipcRenderer) {
                window.ipcRenderer.off("zekr-data-updated", handleZekrDataUpdate);
            }
        };
    }, []);

    return {
        zekr,
        todayTotal,
        isPending,
        error,
        addZekr,
        quickAddZekr,
        updateZekr,
        deleteZekr,
        decrementZekrCount,
        clearError,
        reloadZekr,
    };
};
