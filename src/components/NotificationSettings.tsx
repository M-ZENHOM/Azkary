import { useEffect, useState, useTransition } from "react";
import { Icons } from "./Icons";
import Button from "./ui/button";
import Input from "./ui/input";
import { DailyTargetSettings } from "./Azkar/DailyTargetSettings";
import { useDailySettings } from "./Azkar/hooks";
import { NotificationSettings as NotificationSettingsType } from "../type/electron";

interface NotificationSettingsProps {
  onSettingsChange: (settings: NotificationSettingsType) => void;
}

export function NotificationSettings({
  onSettingsChange,
}: NotificationSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<NotificationSettingsType>({
    notificationInterval: 60,
    enabled: true,
    showTray: true,
    muteSound: false,
  });
  const { dailySettings, updateDailyTarget } = useDailySettings();
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI?.getNotificationSettings();

      if (savedSettings) {
        setSettings(savedSettings);
        onSettingsChange(savedSettings);
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    }
  };

  const updateSettings = async (
    newSettings: Partial<NotificationSettingsType>
  ) => {
    try {
      startTransition(() => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
      });
      const updatedSettings = { ...settings, ...newSettings };
      const result = await window.electronAPI?.updateNotificationSettings(
        updatedSettings
      );

      if (result) {
        setSettings(result);
        onSettingsChange(result);
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    }
  };

  const testNotification = async () => {
    try {
      await window.electronAPI?.testNotification();
    } catch (error) {
      console.error("Failed to test notification:", error);
    }
  };

  return (
    <>
      <DailyTargetSettings
        target={dailySettings.target}
        onTargetChange={updateDailyTarget}
      />
      <div className="w-full p-4 bg-white rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-right">
          إعدادات الإشعارات
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              تفعيل الإشعارات
            </label>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              كتم صوت الإشعارات
            </label>
            <input
              type="checkbox"
              checked={settings.muteSound}
              onChange={(e) => updateSettings({ muteSound: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">
              الفاصل الزمني للإشعارات (بالثواني)
            </label>
            <Input
              type="number"
              min="5"
              max="3600"
              value={settings.notificationInterval}
              onChange={(e) =>
                updateSettings({ notificationInterval: Number(e.target.value) })
              }
              disabled={!settings.enabled || isPending}
              className="w-full"
              icon={<Icons.ClockIcon className="size-[12px] text-black" />}
            />
            <p className="text-xs text-gray-500 text-right">
              سيتم إرسال إشعار كل {settings.notificationInterval} ثانية
              {settings.notificationInterval >= 60 && (
                <span className="block text-gray-400">
                  ({Math.round((settings.notificationInterval / 60) * 10) / 10}{" "}
                  دقيقة)
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                {
                  label: "10 ثانية",
                  value: 10,
                },
                {
                  label: "30 ثانية",
                  value: 30,
                },
                {
                  label: "1 دقيقة",
                  value: 60,
                },
                {
                  label: "5 دقائق",
                  value: 300,
                },
              ].map((interval) => (
                <Button
                  key={interval.value}
                  onClick={() =>
                    updateSettings({ notificationInterval: interval.value })
                  }
                  className="px-2 py-1 text-xs"
                >
                  {interval.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              إظهار في شريط المهام
            </label>
            <input
              type="checkbox"
              checked={settings.showTray}
              onChange={(e) => updateSettings({ showTray: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>

          <Button
            onClick={testNotification}
            disabled={!settings.enabled || isPending}
            className="w-full px-4 py-2"
          >
            اختبار الإشعار
          </Button>

          {isPending && (
            <div className="text-center text-sm text-gray-500">
              جاري حفظ الإعدادات...
            </div>
          )}
        </div>
      </div>
    </>
  );
}
