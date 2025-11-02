import { useEffect } from "react";
import Button from "../ui/button";
import { AddZekrForm } from "./AddZekrForm";
import { DailyProgress } from "./DailyProgress";
import { QuickAddSection } from "./QuickAddSection";
import { ZekrList } from "./ZekrList";
import { useDailyReset } from "./hooks/useDailyReset";
import { useDailySettings } from "./hooks/useDailySettings";
import { useZekrManager } from "./hooks/useZekrManager";

export default function Azkar() {
  const {
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
  } = useZekrManager();

  const { dailySettings } = useDailySettings();
  const { checkDailyReset, performDailyReset } = useDailyReset(
    zekr,
    dailySettings
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (dailySettings.lastResetDate) {
        checkDailyReset();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (isPending) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الأذكار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
          <span>{error}</span>
          <div className="flex gap-2">
            <Button
              onClick={reloadZekr}
              variant="info"
              size="sm"
              className="text-xs"
            >
              إعادة المحاولة
            </Button>
            <Button
              onClick={clearError}
              variant="error"
              size="sm"
              className="text-xs"
            >
              إغلاق
            </Button>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 space-y-4">
        <DailyProgress
          todayTotal={todayTotal}
          target={dailySettings.target}
          onManualReset={performDailyReset}
        />

        <QuickAddSection onQuickAdd={quickAddZekr} />

        <AddZekrForm onAddZekr={addZekr} />
      </div>

      <div className="flex-1 overflow-hidden mt-4">
        <div className="h-full overflow-y-auto bg-white p-4 rounded-lg">
          <ZekrList
            zekr={zekr}
            onUpdateZekr={updateZekr}
            onDeleteZekr={deleteZekr}
            onDecrementCount={decrementZekrCount}
          />
        </div>
      </div>
    </div>
  );
}
